use std::{
    collections::HashMap,
    env,
    io::Error as IoError,
    net::SocketAddr,
    sync::{Arc, Mutex},
};

use futures_channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use futures_util::{future, pin_mut, stream::TryStreamExt, StreamExt};

use tokio::net::{TcpListener, TcpStream};
use tungstenite::protocol::Message;

use log::*;
use serde::{Deserialize, Serialize};
use serde_json;

use std::process::Command;

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;
type Queue = Vec<QueueItem>;

#[derive(Serialize, Deserialize, Debug)]
struct QueueResponse {
    queue: Queue,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct QueueItem {
    id: String,
    title: String,
    singer: String,
    timestamp: i64,
    status: QueueItemStatus,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
enum QueueItemStatus {
    Pending,
    Downloading,
    Ready,
    Error,
}

#[derive(Serialize, Deserialize, Debug)]
enum Request {
    Queue { id: String, singer: String },
    DeQueue { id: String },
    QueuePosition { id: String, position: usize },
    Error,
}

#[derive(Serialize, Deserialize, Debug)]
struct Response {
    request: Request,
    addr: SocketAddr,
}

async fn handle_connection(
    peer_map: PeerMap,
    raw_stream: TcpStream,
    addr: SocketAddr,
    broker: UnboundedSender<Response>,
) {
    info!("incoming TCP connection from: {}", addr);
    let ws_stream = tokio_tungstenite::accept_async(raw_stream)
        .await
        .expect("error during the websocket handshake occurred");
    info!("WebSocket connection established: {}", addr);
    let (tx, rx) = unbounded();
    // TODO: maybe move this into the q_loop and send queue?
    tx.unbounded_send(Message::Text("ZOMG WELCOME!".to_owned()))
        .unwrap();
    // insert the write (tx) part of this peer to the peer map
    peer_map.lock().unwrap().insert(addr, tx);
    let (outgoing, incoming) = ws_stream.split();
    let broadcast_incoming = incoming.try_for_each(|msg| {
        info!(
            "ohey! parse_message received a message from {}: {}",
            addr,
            msg.to_text().unwrap()
        );
        let request: Request =
            serde_json::from_str(msg.to_text().unwrap()).unwrap_or(Request::Error);

        match request {
            Request::Error => {
                error!("zomg unknown cmd!!");
                let peers = peer_map.lock().unwrap();
                // broadcast the error back to sender.
                match peers.get(&addr) {
                    Some(peer) => {
                        info!("zomg found peer with addr: {:#?}", addr);
                        peer.unbounded_send(Message::Text("unknown command".to_owned()))
                            .unwrap();
                    }
                    _ => {}
                }
            }
            _ => {
                match broker.unbounded_send(Response {
                    request: request,
                    addr: addr,
                }) {
                    Err(e) => error!(
                        "handle_connection broker.unbounded_send caught error: {:#?}",
                        e
                    ),
                    _ => {}
                }
            }
        };

        future::ok(())
    });
    let receive_from_others = rx.map(Ok).forward(outgoing);
    pin_mut!(broadcast_incoming, receive_from_others);
    future::select(broadcast_incoming, receive_from_others).await;
    info!("{} disconnected", &addr);
    peer_map.lock().unwrap().remove(&addr);
}

type BrokerResult<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

async fn q_loop(
    mut events: UnboundedReceiver<Response>,
    peer_map: PeerMap,
    mut queue: Vec<QueueItem>,
) -> BrokerResult<()> {
    while let Some(event) = events.next().await {
        match event {
            Response { request, addr } => {
                info!("q_loop has request: {:#?}, addr: {:#?}", request, addr);
                match request {
                    Request::Error => break, // note: stop here if Error
                    Request::Queue { id, singer } => {
                        info!(
                            "q_loop request to Queue (will sleep 5s) id:{} singer:{}",
                            id, singer
                        );
                        // std::thread::sleep(std::time::Duration::from_millis(5000));
                        // info!("q_loop done sleeping!!");

                        let mut child = Command::new("sleep").arg("5").spawn().unwrap();
                        let _result = child.wait().unwrap();

                        info!("q_loop done sleeping!! result: {:#?}", _result);
                        queue.push(QueueItem {
                            id: id,
                            singer: singer,
                            status: QueueItemStatus::Pending,
                            timestamp: 0,
                            title: "".to_owned(),
                        });
                    }
                    Request::DeQueue { id } => {
                        info!("q_loop DeQueue id:{}", id);
                        queue.retain(|q| q.id != id);
                    }
                    Request::QueuePosition { id, position } => {
                        info!("q_loop QueuePosition id:{} position:{}", id, position);
                        match queue.iter().position(|q| q.id == id) {
                            Some(idx) => {
                                match queue.get(idx) {
                                    Some(queue_item) => {
                                        queue.insert(position, queue_item.clone());
                                        // #TODO: ugh, this is not working, is not removed :/
                                        queue.remove(idx);
                                    }
                                    None => {}
                                }
                            }
                            None => {}
                        };
                    }
                };

                let msg = serde_json::to_value(QueueResponse {
                    queue: queue.clone(),
                })
                .unwrap()
                .to_string();

                info!("q_loop msg: {:#?}", msg);

                let peers = peer_map.lock().unwrap();
                // broadcast the queue msg to everyone
                let broadcast_recipients = peers.iter().map(|(_, ws_sink)| ws_sink);
                for recp in broadcast_recipients {
                    recp.unbounded_send(Message::Text(msg.clone())).unwrap();
                }
            }
        }
    }
    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), IoError> {
    env_logger::init();
    let addr = match env::var_os("WS_ADDRESS") {
        Some(val) => val.into_string().unwrap(),
        None => "127.0.0.1:9001".to_string(),
    };
    let peer_map = PeerMap::new(Mutex::new(HashMap::new()));
    let queue: Vec<QueueItem> = vec![];

    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("onoz! failed to bind to address and port!");
    println!("youoke ws server is listening on: {}", addr);

    let (q_sender, q_receiver) = unbounded();
    let _q_handle = tokio::task::spawn(q_loop(q_receiver, peer_map.clone(), queue));

    println!("ZOMG >>>CAN HANDLE_CONNECTION NOWWWWW!!!");

    // spawn the handling of each connection in a separate task.
    while let Ok((stream, addr)) = listener.accept().await {
        tokio::spawn(handle_connection(
            peer_map.clone(),
            stream,
            addr,
            q_sender.clone(),
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

        // welcome message:
        let msg = socket
            .read_message()
            .expect("test panic! reading socket message");
        assert_eq!(msg, Message::Text("ZOMG WELCOME!".into()));

        let msg = socket2
            .read_message()
            .expect("test panic! reading socket message");
        assert_eq!(msg, Message::Text("ZOMG WELCOME!".into()));

        socket
            .write_message(Message::Text("Hello WebSocket".into()))
            .unwrap();
        let msg = socket
            .read_message()
            .expect("test panic! reading socket message");
        assert_eq!(msg, Message::Text("unknown command".into()));

        let q_item = QueueItem {
            id: "xxx666".to_owned(),
            title: "".to_owned(),
            singer: "frankie frankie".to_owned(),
            timestamp: 0,
            status: QueueItemStatus::Pending,
        };
        let queue = vec![q_item];

        let queue_req = r#"{
            "Queue":{
                "id":"xxx666",
                "singer":"frankie frankie"
            }
        }"#;

        // let request: Request = Request::Queue {
        //     id: "xxx666".to_owned(),
        //     singer: "frankie frankie".to_owned(),
        // };

        let q_response: QueueResponse = QueueResponse { queue: queue };

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
        let parsed: QueueResponse =
            serde_json::from_str(&msg).expect("test panic! can't parse to JSON");

        assert_eq!(
            serde_json::to_value(&q_response).unwrap(),
            serde_json::json!(parsed)
        );

        socket.close(None).unwrap();
        socket2.close(None).unwrap();
    }
}
