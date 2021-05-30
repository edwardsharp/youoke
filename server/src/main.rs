use log::*;
use serde::{Deserialize, Serialize};
// use serde_json;
use std::{
    net::{TcpListener, TcpStream},
    thread::spawn,
};
use tungstenite::{accept, handshake::HandshakeRole, Error, HandshakeError, Message, Result};

#[derive(Serialize, Deserialize)]
struct Room {
    room_id: String,
    queue: Vec<String>,
    info: String,
}

fn must_not_block<Role: HandshakeRole>(err: HandshakeError<Role>) -> Error {
    match err {
        HandshakeError::Interrupted(_) => panic!("Bug: blocking socket would block"),
        HandshakeError::Failure(f) => {
            info!("handshake err? {:?}", f);
            f
        }
    }
}

fn handle_client(stream: TcpStream) -> Result<()> {
    let mut socket = accept(stream).map_err(must_not_block)?;
    info!("socket server ready to handle_client!");

    loop {
        match socket.read_message()? {
            msg @ Message::Text(_) | msg @ Message::Binary(_) => {
                info!("got msg! {:?}", msg);
                socket.write_message(msg)?;
            }
            Message::Ping(_) | Message::Pong(_) | Message::Close(_) => {}
        }
    }
}

fn main() {
    env_logger::init();

    let server = TcpListener::bind("127.0.0.1:9002").unwrap();

    for stream in server.incoming() {
        spawn(move || match stream {
            Ok(stream) => {
                if let Err(err) = handle_client(stream) {
                    warn!("onoz! err: {}", err);
                    match err {
                        Error::ConnectionClosed | Error::Protocol(_) | Error::Utf8 => (),
                        e => error!("test: {}", e),
                    }
                }
            }
            Err(e) => error!("Error accepting stream: {}", e),
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread::sleep;
    use std::time::Duration;
    use tungstenite::{connect, Message};
    use url::Url;

    #[test]
    fn test_local() {
        spawn(|| {
            main();
        });

        // give the spawn thread a lil time to start...
        sleep(Duration::from_millis(100));

        let (mut socket, _) =
            connect(Url::parse("ws://127.0.0.1:9002").unwrap()).expect("Can't connect");

        // println!("Connected to the server");
        // println!("Response HTTP code: {}", response.status());
        // println!("Response contains the following headers:");
        // for (ref header, _value) in response.headers() {
        //     println!("* {}", header);
        // }

        socket
            .write_message(Message::Text("Hello WebSocket".into()))
            .unwrap();

        let msg = socket
            .read_message()
            .expect("Panic! reading socket message");
        // println!("Received: {}", msg);
        assert_eq!(msg, Message::Text("Hello WebSocket".into()));

        let address = Room {
            room_id: "some-room".to_owned(),
            queue: vec!["some".to_owned(), "queue".to_owned()],
            info: "zomg this info".to_owned(),
        };

        socket
            .write_message(Message::Text(serde_json::to_string(&address).unwrap()))
            .unwrap();
        let msg = socket
            .read_message()
            .expect("Panic! reading socket message");
        let msg = match msg {
            tungstenite::Message::Text(s) => s,
            _ => {
                panic!()
            }
        };
        let parsed: serde_json::Value = serde_json::from_str(&msg).expect("Can't parse to JSON");
        println!("parsed: {:?}", parsed);

        // let s = serde_json::to_string(&address).unwrap();

        assert_eq!(serde_json::to_value(&address).unwrap(), parsed);

        socket.close(None).unwrap()
    }
}
