use std::{
    collections::HashMap,
    env,
    io::Error as IoError,
    net::SocketAddr,
    sync::{Arc, Mutex},
};

use futures_channel::mpsc::{unbounded, UnboundedSender};
use futures_util::{future, pin_mut, stream::TryStreamExt, StreamExt};

use tokio::net::{TcpListener, TcpStream};
use tungstenite::protocol::Message;

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;

use log::*;
use serde::{Deserialize, Serialize};
use serde_json;

#[derive(Serialize, Deserialize, Debug)]
struct Room {
    room_id: String,
    queue: Vec<QueueItem>,
    info: String,
}

type RoomMutex = Arc<Mutex<Room>>;

#[derive(Serialize, Deserialize, Debug)]
struct QueueItem {
    id: String,
    title: String,
    singer: String,
    timestamp: i64,
    status: QueueItemStatus,
}

#[derive(Serialize, Deserialize, Debug)]
enum QueueItemStatus {
    Pending,
    Downloading,
    Ready,
    Error,
}

#[derive(Serialize, Deserialize, Debug)]
enum Request {
    GetQueue,
    Queue { id: String, singer: String },
    DeQueue { id: String },
    QueuePosition { id: String, position: i32 },
    Error,
}

fn parse_message(
    msg: Message,
    peer_map: PeerMap,
    room_mutex: RoomMutex,
    addr: SocketAddr,
) -> Result<(), Box<dyn std::error::Error>> {
    info!(
        "ohey! parse_message received a message from {}: {}",
        addr,
        msg.to_text().unwrap()
    );
    let request: Request = serde_json::from_str(msg.to_text().unwrap()).unwrap_or(Request::Error);

    match request {
        Request::Error => error!("zomg request was error!"),
        Request::GetQueue => info!("GetQueue"),
        Request::Queue { id, singer } => info!("Queue id:{} singer:{}", id, singer),
        Request::DeQueue { id } => info!("DeQueue id:{}", id),
        Request::QueuePosition { id, position } => {
            info!("QueuePosition id:{} position:{}", id, position)
        }
    }

    let peers = peer_map.lock().unwrap();
    let room = room_mutex.clone();
    info!("room clone: {:#?}", room);

    // broadcast the message to everyone except sender
    let broadcast_recipients = peers
        .iter()
        .filter(|(peer_addr, _)| peer_addr != &&addr)
        .map(|(_, ws_sink)| ws_sink);

    for recp in broadcast_recipients {
        recp.unbounded_send(msg.clone()).unwrap();
    }

    Ok(())
}

async fn handle_connection(
    peer_map: PeerMap,
    room_mutex: RoomMutex,
    raw_stream: TcpStream,
    addr: SocketAddr,
) {
    info!("incoming TCP connection from: {}", addr);
    let ws_stream = tokio_tungstenite::accept_async(raw_stream)
        .await
        .expect("error during the websocket handshake occurred");
    info!("WebSocket connection established: {}", addr);
    let (tx, rx) = unbounded();
    // insert the write (tx) part of this peer to the peer map.
    peer_map.lock().unwrap().insert(addr, tx);
    let (outgoing, incoming) = ws_stream.split();
    let broadcast_incoming = incoming.try_for_each(|msg| {
        match parse_message(msg, peer_map.clone(), room_mutex.clone(), addr) {
            Err(e) => error!("zomg parse_message caught error: {:#?}", e),
            Ok(_) => info!("parsed msg..."),
        };
        future::ok(())
    });
    let receive_from_others = rx.map(Ok).forward(outgoing);
    pin_mut!(broadcast_incoming, receive_from_others);
    future::select(broadcast_incoming, receive_from_others).await;
    info!("{} disconnected", &addr);
    peer_map.lock().unwrap().remove(&addr);
}

#[tokio::main]
async fn main() -> Result<(), IoError> {
    env_logger::init();
    let addr = match env::var_os("WS_ADDRESS") {
        Some(val) => val.into_string().unwrap(),
        None => "127.0.0.1:9001".to_string(),
    };
    let peer_map = PeerMap::new(Mutex::new(HashMap::new()));
    let default_room = Room {
        room_id: "lobby".to_owned(),
        info: "the default room".to_owned(),
        queue: vec![],
    };
    let room_mutex = RoomMutex::new(Mutex::new(default_room));
    // setup the event loop and TCP listener
    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("onoz! failed to bind to address and port!");
    println!("youoke ws server is listening on: {}", addr);
    // spawn the handling of each connection in a separate task.
    while let Ok((stream, addr)) = listener.accept().await {
        tokio::spawn(handle_connection(
            peer_map.clone(),
            room_mutex.clone(),
            stream,
            addr,
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    use std::thread::sleep;
    use std::thread::spawn;
    use std::time::Duration;
    use tungstenite::{connect, Message};
    use url::Url;

    #[test]
    fn test_local() {
        env::set_var("RUST_LOG", "info");
        spawn(|| {
            main().expect("test can spawn on main()!");
        });

        // give the spawn thread a lil time to start...
        sleep(Duration::from_millis(100));

        let (mut socket, _) = connect(Url::parse("ws://127.0.0.1:9001").unwrap())
            .expect("test can't connect to socket!");

        let (mut socket2, _) = connect(Url::parse("ws://127.0.0.1:9001").unwrap())
            .expect("test can't connect to socket!");

        socket
            .write_message(Message::Text("Hello WebSocket".into()))
            .unwrap();

        let msg = socket2
            .read_message()
            .expect("test panic! reading socket message");
        assert_eq!(msg, Message::Text("Hello WebSocket".into()));

        // let q_item = QueueItem {
        //     id: "some-id".to_owned(),
        //     title: "some title".to_owned(),
        //     singer: "some singer".to_owned(),
        //     timestamp: 1234567890,
        //     status: QueueItemStatus::Pending,
        // };
        // let room = Room {
        //     room_id: "some-room".to_owned(),
        //     queue: vec![q_item],
        //     info: "zomg this is info".to_owned(),
        // };

        let queue_req = r#"{
            "Queue":{
                "id":"xxx666",
                "singer":"frankie frankie"
            }
        }"#;

        let request: Request = Request::Queue {
            id: "xxx666".to_owned(),
            singer: "frankie frankie".to_owned(),
        };

        socket
            .write_message(Message::Text(queue_req.to_owned()))
            .unwrap();
        let msg = socket2
            .read_message()
            .expect("test panic! reading socket message");
        let msg = match msg {
            tungstenite::Message::Text(s) => s,
            _ => {
                panic!()
            }
        };
        let parsed: Request = serde_json::from_str(&msg).expect("test panic! can't parse to JSON");

        assert_eq!(
            serde_json::to_value(&request).unwrap(),
            serde_json::json!(parsed)
        );

        socket.close(None).unwrap();
        socket2.close(None).unwrap();
    }
}
