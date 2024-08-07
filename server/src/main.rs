use std::{
    collections::HashMap,
    env,
    fs::{canonicalize, create_dir_all, read_to_string},
    io::Error as IoError,
    net::SocketAddr,
    path::{Path, PathBuf},
    process::{Command, Stdio},
    sync::{Arc, Mutex},
};

use glob::glob;

use futures_channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use futures_util::{future, pin_mut, stream::TryStreamExt, StreamExt};

use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::accept_async;
use tungstenite::protocol::Message;

use log::*;
use serde::{Deserialize, Serialize};
use serde_json;

type Tx = UnboundedSender<Message>;
type PeerMap = Arc<Mutex<HashMap<SocketAddr, Tx>>>;
type Queue = Vec<QueueItem>;
type GenericResult<T> = std::result::Result<T, Box<dyn std::error::Error + Send + Sync>>;

#[derive(Serialize, Deserialize, Debug)]
struct QueueResponse {
    queue: Queue,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct QueueItem {
    id: String,
    title: String,
    singer: String,
    filepath: String,
    duration: usize,
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
    Queue {
        id: String,
        singer: String,
    },
    DeQueue {
        id: String,
    },
    QueueSetPosition {
        id: String,
        position: usize,
    },
    QueueSetSinger {
        id: String,
        singer: String,
    },
    GetQueue {
        addr: Option<SocketAddr>,
    },
    LibraryResponse {
        id: String,
        status: QueueItemStatus,
        filepath: String,
        title: String,
        duration: usize,
    },
    PlayerPlay,
    PlayerPause,
    PlayerSkip,
    GetLibrary,
    Error,
}

#[derive(Serialize, Deserialize, Debug)]
enum LibraryRequest {
    Queue { id: String },
}

#[derive(Serialize, Deserialize, Debug)]
enum DownloadRequest {
    Queue { id: String },
}

#[derive(Serialize, Deserialize, Debug)]
struct YoutubeDlJSON {
    id: String,
    ext: String,
    duration: usize,
    title: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct LibraryItem {
    title: String,
    duration: usize,
    id: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct GetLibraryResponse {
    library: Vec<LibraryItem>,
}

#[tokio::main]
async fn main() -> Result<(), IoError> {
    env_logger::init();

    Command::new("yt-dlp")
    .arg("--version")
    .stdout(Stdio::null())
    .spawn()
    .expect("PANIC! cannot find yt-dlp program, please make sure it is installed and on your $PATH.");

    let lib_dir = match env::var_os("LIB_DIR") {
        Some(val) => val.into_string().unwrap(),
        None => "./library".to_string(),
    };

    if !Path::new(&lib_dir).is_dir() {
        println!("creating new LIB_DIR: {:?}", &lib_dir);
        create_dir_all(&lib_dir).unwrap();
    }

    let library_path = PathBuf::from(&lib_dir);
    let library_path = canonicalize(&library_path)
        .unwrap()
        .into_os_string()
        .into_string()
        .unwrap();

    let addr = match env::var_os("WS_ADDRESS") {
        Some(val) => val.into_string().unwrap(),
        None => "127.0.0.1:9001".to_string(),
    };
    let peer_map = PeerMap::new(Mutex::new(HashMap::new()));
    let queue: Vec<QueueItem> = vec![];

    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("onoz! failed to bind to address and port!");
    println!("youoke ws server is listening on: {}", addr);

    // message bus for handling queue mutation and broadcasting
    let (q_sender, q_receiver) = unbounded();
    // message bus for handling file processing, doesn't broadcast but will send messages to the queue or download bus
    let (f_sender, f_receiver) = unbounded();
    // message bus for handling file downloading, doesn't broadcast but will send messages to the queue bus
    let (d_sender, d_receiver) = unbounded();
    tokio::task::spawn(queue_handler(
        q_receiver,
        peer_map.clone(),
        queue,
        f_sender.clone(),
    ));
    tokio::task::spawn(file_handler(
        library_path.clone(),
        f_receiver,
        q_sender.clone(),
        d_sender.clone(),
    ));
    // hmm, should the download_handler be spawn_blocking since it blockz??
    tokio::task::spawn(download_handler(
        library_path.clone(),
        d_receiver,
        q_sender.clone(),
    ));

    // spawn the handling of each connection in a separate task.
    while let Ok((stream, addr)) = listener.accept().await {
        tokio::spawn(connection_handler(
            peer_map.clone(),
            stream,
            addr,
            q_sender.clone(),
            library_path.clone(),
        ));
    }

    Ok(())
}

async fn connection_handler(
    peer_map: PeerMap,
    raw_stream: TcpStream,
    addr: SocketAddr,
    q_sender: UnboundedSender<Request>,
    library_path: String,
) {
    info!("incoming TCP connection from: {}", addr);
    let ws_stream = accept_async(raw_stream)
        .await
        .expect("error during the websocket handshake occurred");
    info!("WebSocket connection established: {}", addr);
    let (tx, rx) = unbounded();
    // insert the write (tx) part of this peer to the peer map
    peer_map.lock().unwrap().insert(addr, tx);
    // send the queue first thing:
    q_sender
        .unbounded_send(Request::GetQueue { addr: Some(addr) })
        .unwrap_or_default();
    let (outgoing, incoming) = ws_stream.split();
    let broadcast_incoming = incoming.try_for_each(|msg| {
        info!(
            "ohey! parse_message received a message from {}: {}",
            addr,
            msg.to_text().unwrap()
        );
        let request: Request =
            serde_json::from_str(msg.to_text().unwrap()).unwrap_or(Request::Error);

        info!("oheyyyy! so the request {:?}", &request);
        match request {
            Request::Error => {
                warn!("zomg unknown cmd!!");
                let peers = peer_map.lock().unwrap();
                // broadcast the error back to sender.
                match peers.get(&addr) {
                    Some(peer) => {
                        info!(
                            "zomg found peer with addr (will send 'unknown command'): {:#?}",
                            addr
                        );
                        peer.unbounded_send(Message::Text("unknown command".to_owned()))
                            .unwrap_or_default();
                    }
                    _ => {}
                }
            }
            Request::PlayerPause | Request::PlayerPlay | Request::PlayerSkip => {
                // broadcast the player msg to everyone (but maybe only the player truely needz this?)
                let peers = peer_map.lock().unwrap();
                let broadcast_recipients = peers.iter().map(|(_, ws_sink)| ws_sink);
                for recp in broadcast_recipients {
                    let msg = serde_json::to_value(&request).unwrap().to_string();
                    recp.unbounded_send(Message::Text(msg)).unwrap_or_default();
                }
                // #TODO: actually prolly don't need to send this request to q_sender
                // could yank additional logic inside queue_handler...
                q_sender.unbounded_send(request).unwrap_or_default();
            }
            Request::GetLibrary => {
                info!("zomg GetLibrary!");
                let mut library: Vec<LibraryItem> = vec![];
                for entry in glob(&format!("{}/*.json", &library_path)).unwrap() {
                    if let Ok(path) = entry {
                        // zomg, found it!
                        // path.as_path().display().to_string();
                        info!("zomg gonna reqd path: {:?}", path);
                        let contents = read_to_string(path)
                            .expect("PANIC! something went wrong reading json file");
                        let parsed: LibraryItem = serde_json::from_str(&contents)
                            .expect("download_handler panic! can't parse to JSON");
                        library.push(parsed);
                        // println!("With text:\n{}", contents);
                    }
                }

                let peers = peer_map.lock().unwrap();
                // broadcast the error back to sender.

                let msg = serde_json::to_value(GetLibraryResponse { library })
                    .unwrap()
                    .to_string();
                match peers.get(&addr) {
                    Some(peer) => {
                        peer.unbounded_send(Message::Text(msg)).unwrap_or_default();
                    }
                    _ => {}
                }
            }
            _ => {
                q_sender.unbounded_send(request).unwrap_or_default();
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

async fn queue_handler(
    mut events: UnboundedReceiver<Request>,
    peer_map: PeerMap,
    mut queue: Vec<QueueItem>,
    f_sender: UnboundedSender<LibraryRequest>,
) -> GenericResult<()> {
    while let Some(request) = events.next().await {
        info!("queue_handler has request: {:#?}", request);
        let mut to_addr: Option<SocketAddr> = None;
        // #TODO: if this never gets Request::Error | Request::PlayerPause | Request::PlayerPlay then
        // wouldn't have to handle this needs_q logic...
        let needs_q: bool = match request {
            Request::Error | Request::PlayerPause | Request::PlayerPlay | Request::GetLibrary => {
                false
            } // note: stop here if any of these (no queue response needed)
            Request::PlayerSkip => {
                if queue.len() > 0 {
                    queue.remove(0);
                }
                true
            }
            Request::Queue { id, singer } => {
                info!(
                    "queue_handler request to Queue id:{} singer:{}",
                    &id, singer
                );

                // take care to not add duplicates to the queue
                match queue.iter().position(|i| i.id == id) {
                    Some(_) => info!(
                        "queue_handler not gonna push to queue, id:{:?} already in queue!",
                        &id
                    ),
                    None => {
                        queue.push(QueueItem {
                            id: id.clone(),
                            singer: singer,
                            status: QueueItemStatus::Downloading,
                            duration: 0,
                            filepath: "".to_owned(),
                            title: "".to_owned(),
                        });

                        f_sender
                            .unbounded_send(LibraryRequest::Queue { id: id.clone() })
                            .unwrap_or_default();
                    }
                }
                true
            }
            Request::DeQueue { id } => {
                info!("queue_handler DeQueue id:{}", id);
                queue.retain(|q| q.id != id);
                true
            }
            Request::QueueSetPosition { id, position } => {
                info!(
                    "queue_handler QueueSetPosition id:{} position:{}",
                    id, position
                );
                match queue.iter().position(|q| q.id == id) {
                    Some(idx) => {
                        let item = queue.remove(idx);
                        queue.insert(position, item);
                    }
                    None => {}
                };
                true
            }
            Request::QueueSetSinger { id, singer } => {
                info!("queue_handler QueueSetSinger id:{} singer:{}", id, singer);
                match queue.iter().position(|q| q.id == id) {
                    Some(idx) => queue[idx].singer = singer,
                    None => {}
                };
                true
            }
            Request::LibraryResponse {
                id,
                status,
                filepath,
                title,
                duration,
            } => {
                info!(
                    "queue_handler LibraryResponse id:{}, status:{:#?}, filepath:{:#?}, title:{:#?}, duration:{:#?}",
                    id, status, filepath, title, duration
                );
                match queue.iter().position(|q| q.id == id) {
                    Some(idx) => match queue.get_mut(idx) {
                        Some(queue_item) => {
                            queue_item.status = status;
                            queue_item.filepath = filepath;
                            queue_item.title = title;
                            queue_item.duration = duration;
                        }
                        None => {}
                    },
                    None => {}
                };
                true
            }
            Request::GetQueue { addr } => {
                to_addr = addr;
                true
            }
        };
        if needs_q {
            let msg = serde_json::to_value(QueueResponse {
                queue: queue.clone(),
            })
            .unwrap()
            .to_string();
            info!("queue_handler msg: {:#?}", msg);
            let peers = peer_map.lock().unwrap();
            match to_addr {
                Some(addr) => match peers.get(&addr) {
                    Some(peer) => {
                        peer.unbounded_send(Message::Text(msg.clone()))
                            .unwrap_or_default();
                    }
                    _ => {}
                },
                None => {
                    // broadcast the queue msg to everyone
                    let broadcast_recipients = peers.iter().map(|(_, ws_sink)| ws_sink);
                    for recp in broadcast_recipients {
                        recp.unbounded_send(Message::Text(msg.clone()))
                            .unwrap_or_default();
                    }
                }
            }
        }
    }
    Ok(())
}

async fn file_handler(
    library_path: String,
    mut events: UnboundedReceiver<LibraryRequest>,
    q_sender: UnboundedSender<Request>,
    d_sender: UnboundedSender<DownloadRequest>,
) -> GenericResult<()> {
    while let Some(event) = events.next().await {
        match event {
            LibraryRequest::Queue { id } => {
                info!(
                    "file_handler LibraryRequest::Queue gonna look for file with id: {:#?}",
                    &id
                );
                let info_filepath = format!("{}/{}.info.json", library_path, &id);
                info!(
                    "file_handler looking for info json file named: {}",
                    info_filepath
                );
                let needs_to_download: bool = match read_to_string(info_filepath) {
                    Ok(contents) => {
                        match serde_json::from_str::<YoutubeDlJSON>(&contents) {
                            Ok(parsed) => {
                                let mut filepath = format!("{}.{}", parsed.id, parsed.ext);
                                //format!("{parsed.id}{parsed.ext}");
                                // validate filename is really a path & file on disk
                                if !Path::new(&filepath).is_file() {
                                    info!("file_handler: file not on filesystem gonna try to find {}/{}*[!json]", &library_path, &id);
                                    for entry in
                                        glob(&format!("{}/{}*[!json]", &library_path, &id)).unwrap()
                                    {
                                        if let Ok(path) = entry {
                                            // zomg, found it!
                                            filepath = path.as_path().display().to_string();
                                        }
                                    }

                                    if Path::new(&filepath).is_file() {
                                        // okay! got it, finally:
                                        q_sender
                                            .unbounded_send(Request::LibraryResponse {
                                                id: id.clone(),
                                                status: QueueItemStatus::Ready,
                                                filepath: filepath,
                                                title: parsed.title,
                                                duration: parsed.duration,
                                            })
                                            .unwrap_or_default();
                                        false
                                    } else {
                                        true
                                    }
                                } else {
                                    q_sender
                                        .unbounded_send(Request::LibraryResponse {
                                            id: id.clone(),
                                            status: QueueItemStatus::Ready,
                                            filepath: filepath,
                                            title: parsed.title,
                                            duration: parsed.duration,
                                        })
                                        .unwrap_or_default();
                                    false
                                }
                            }
                            Err(_) => true,
                        }
                    }
                    Err(_) => true,
                };

                if needs_to_download {
                    info!(
                        "file_handler unable to located  {:?} on filesystem, gonna try to download.",
                        &id
                    );
                    d_sender
                        .unbounded_send(DownloadRequest::Queue { id: id })
                        .unwrap_or_default();
                }
            }
        }
    }
    Ok(())
}

async fn download_handler(
    library_path: String,
    mut events: UnboundedReceiver<DownloadRequest>,
    q_sender: UnboundedSender<Request>,
) -> GenericResult<()> {
    while let Some(event) = events.next().await {
        match event {
            DownloadRequest::Queue { id } => {
                info!(
                    "download_handler DownloadRequest::Queue gonna yt-dlp id: {:#?}",
                    id
                );
                // info!("o flag: {:#?}", format!("{}/%(id)s.%(ext)s", library_path));
                let response: Request = match Command::new("yt-dlp")
                    .arg("--no-warnings")
                    .arg("--restrict-filenames")
                    .arg("--write-info-json") // --print-json
                    .arg("--quiet")
                    .arg("-o")
                    .arg(format!("{}/%(id)s.%(ext)s", library_path))
                    .arg("-S")
                    .arg("+res:720")
                    .arg("--")
                    .arg(&id) // note: this handles video IDz that start with a dash (-)
                    .output()
                // note: sleep for debuggin.
                // let response: Request = match Command::new("sleep").arg("1").output() 
                {
                    Ok(output) => {
                        info!("download_handler yt-dlp output: {:#?}", output);

                        match output.status.code() {
                            Some(code) => {
                                info!("yt-dlp Exited with status code: {}", code);
                                if code == 0 {
                                    let info_filepath =
                                        format!("{}/{}.info.json", library_path, id);
                                    info!(
                                        "download_handler reading info json file: {}",
                                        info_filepath
                                    );
                                    // #TODO handle erros, here. cuz might not be a valid file (like)
                                    let contents = read_to_string(info_filepath).expect(
                                        "PANIC! ...something went wrong reading info.json file!",
                                    );

                                    let parsed: YoutubeDlJSON = serde_json::from_str(&contents)
                                        .expect("download_handler panic! can't parse to JSON");
                                    // let mut filepath = parsed._filename;
                                    let mut filepath = format!("{}.{}", parsed.id, parsed.ext);
                                    // validate filename is really a path & file on disk
                                    if !Path::new(&filepath).is_file() {
                                        info!("ugh ref file not on filesystem gonna try to find {}/{}*[!json]", &library_path, &id);
                                        for entry in
                                            glob(&format!("{}/{}*[!json]", &library_path, &id))
                                                .unwrap()
                                        {
                                            if let Ok(path) = entry {
                                                // zomg, found it!
                                                filepath = path.as_path().display().to_string();
                                            }
                                        }
                                    }

                                    Request::LibraryResponse {
                                        id: id,
                                        status: QueueItemStatus::Ready,
                                        filepath: filepath,
                                        title: parsed.title,
                                        duration: parsed.duration,
                                    }
                                } else {
                                    // will remove this from the queue since it doesn't seem valid
                                    Request::DeQueue { id }
                                }
                            }
                            None => {
                                warn!("yt-dlp Process terminated by signal");
                                Request::DeQueue { id }
                            }
                        }
                    }
                    Err(e) => {
                        warn!("yt-dlp error: {:#?}", e);
                        Request::DeQueue { id }
                    }
                };
                q_sender.unbounded_send(response).unwrap_or_default();
            }
        }
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
    fn test_parae_youtubedl_json() {
        let contents = read_to_string("./examples/5--RnSogips.info.json".to_owned())
            .expect("TEST PANIC! ...something went wrong reading ./examples/5--RnSogips.info.json");

        let parsed: YoutubeDlJSON =
            serde_json::from_str(&contents).expect("test panic! can't parse to JSON");

        let expected: YoutubeDlJSON = YoutubeDlJSON {
            id: "5--RnSogips".to_owned(),
            ext: "mp4".to_owned(),
            duration: 352,
            title: "Korn   Faget".to_owned(),
        };
        println!("parsed: {:#?}", parsed);

        assert_eq!(
            serde_json::json!(expected),
            serde_json::to_value(&expected).unwrap()
        );
    }

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

        let queue = vec![];
        let empty_q = serde_json::to_value(QueueResponse { queue })
            .unwrap()
            .to_string();

        let msg = socket
            .read_message()
            .expect("test panic! reading socket message");
        assert_eq!(msg, Message::Text(empty_q.clone()));

        let msg = socket2
            .read_message()
            .expect("test panic! reading socket message");
        assert_eq!(msg, Message::Text(empty_q));

        socket
            .write_message(Message::Text("this is an invalid message".into()))
            .unwrap();
        let msg = socket
            .read_message()
            .expect("test panic! reading socket message");
        assert_eq!(msg, Message::Text("unknown command".into()));

        let q_item = QueueItem {
            id: "xxx666".to_owned(),
            title: "".to_owned(),
            singer: "frankie frankie".to_owned(),
            filepath: "".to_owned(),
            duration: 0,
            status: QueueItemStatus::Downloading,
        };
        let queue = vec![q_item];

        let queue_req = r#"{
            "Queue":{
                "id":"xxx666",
                "singer":"frankie frankie"
            }
        }"#;

        let q_response: QueueResponse = QueueResponse { queue };

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
