// add to Cargo.toml these:
// [dependencies]
// tokio = { version = "1", features = ["full"] }
// warp = "0.3"
// serde = { version = "1", features = ["derive"] }
// serde_json = "1"
// futures = "0.3"
// web-view = "0.7"

// main.rs
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::{convert::Infallible, process::Command, sync::Arc};
use tokio::sync::Mutex;
use warp::ws::{Message, WebSocket};
use warp::Filter;

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
enum CommandMessage {
    ReadFile { path: String },
    WriteFile { path: String, data: String },
    SpawnProcess { command: String },
    ForwardToPlayer { action: String },
    Sleep { seconds: u64 },
}

#[derive(Default)]
struct AppState {
    player_channel: Option<tokio::sync::mpsc::Sender<String>>,
}

#[derive(Debug)]
struct Unauthorized;

impl warp::reject::Reject for Unauthorized {}

type SharedState = Arc<Mutex<AppState>>;

const SECRET_CODE: &str = "aaahhh";

#[tokio::main]
async fn main() {
    let state: SharedState = Arc::new(Mutex::new(AppState::default()));
    let (player_tx, mut player_rx) = tokio::sync::mpsc::channel(32);
    state.lock().await.player_channel = Some(player_tx);

    // Start the central "player" task
    tokio::spawn(async move {
        while let Some(msg) = player_rx.recv().await {
            println!("[Player] Received action: {}", msg);
        }
    });

    let state_filter = warp::any().map(move || state.clone());

    let ws_route = warp::path("ws")
        .and(warp::ws())
        .and(warp::query::<std::collections::HashMap<String, String>>()) // extract query params
        .and(state_filter.clone())
        .and_then(handle_ws_request);
    // .map(|ws: warp::ws::Ws, state| {
    //     ws.on_upgrade(move |socket| handle_connection(socket, state))
    // });

    let static_files = warp::fs::dir("./library");

    let routes = ws_route.or(static_files);

    println!("websocket server running at ws://localhost:3030/ws");
    println!("serving ./library at http://localhost:3030/");

    // tokio::spawn(spawn_webview());
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}

// pub async fn handle_submit(json: Value, db: DbWorker) -> Result<impl warp::Reply, warp::Rejection> {

async fn handle_ws_request(
    ws: warp::ws::Ws,
    query: std::collections::HashMap<String, String>,
    state: SharedState,
) -> Result<impl warp::Reply, warp::Rejection> {
    if let Some(code) = query.get("code") {
        if code == SECRET_CODE {
            return Ok(ws.on_upgrade(move |socket| handle_connection(socket, state)));
        }
    }

    Err(warp::reject::custom(Unauthorized))
}

async fn handle_connection(ws: WebSocket, state: SharedState) {
    let (mut tx, mut rx) = ws.split();

    while let Some(result) = rx.next().await {
        match result {
            Ok(msg) if msg.is_text() => {
                let msg_text = msg.to_str().unwrap_or("");
                if let Ok(command) = serde_json::from_str::<CommandMessage>(msg_text) {
                    let response = handle_command(command, state.clone()).await;
                    if let Some(resp) = response {
                        let _ = tx.send(Message::text(resp)).await;
                    }
                }
            }
            _ => break,
        }
    }
}

async fn handle_command(cmd: CommandMessage, state: SharedState) -> Option<String> {
    match cmd {
        CommandMessage::ReadFile { path } => {
            let contents = tokio::fs::read_to_string(path).await.ok()?;
            Some(contents)
        }
        CommandMessage::WriteFile { path, data } => {
            tokio::fs::write(path, data).await.ok()?;
            Some("ok".to_string())
        }
        CommandMessage::SpawnProcess { command } => {
            tokio::spawn(async move {
                let _ = Command::new("sh").arg("-c").arg(&command).spawn();
            });
            Some("spawned".to_string())
        }
        CommandMessage::ForwardToPlayer { action } => {
            let state = state.lock().await;
            if let Some(sender) = &state.player_channel {
                let _ = sender.send(action.clone()).await;
            }
            Some("forwarded".to_string())
        }
        CommandMessage::Sleep { seconds } => {
            tokio::time::sleep(std::time::Duration::from_secs(seconds)).await;
            Some(format!("slept for {} seconds", seconds))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_sleep_command() {
        let state = Arc::new(Mutex::new(AppState::default()));
        let start = std::time::Instant::now();
        let result = handle_command(CommandMessage::Sleep { seconds: 1 }, state).await;
        assert_eq!(result.unwrap(), "slept for 1 seconds");
        assert!(start.elapsed().as_secs() >= 1);
    }

    #[tokio::test]
    async fn test_write_and_read_file() {
        let state = Arc::new(Mutex::new(AppState::default()));
        let path = "testfile.txt".to_string();
        let data = "hello, world".to_string();

        let write_result = handle_command(
            CommandMessage::WriteFile {
                path: path.clone(),
                data: data.clone(),
            },
            state.clone(),
        )
        .await;
        assert_eq!(write_result.unwrap(), "ok");

        let read_result = handle_command(CommandMessage::ReadFile { path }, state.clone()).await;
        assert_eq!(read_result.unwrap(), data);
    }

    #[tokio::test]
    async fn test_forward_to_player() {
        let (tx, mut rx) = tokio::sync::mpsc::channel(1);
        let mut state = AppState::default();
        state.player_channel = Some(tx);
        let shared_state = Arc::new(Mutex::new(state));

        let result = handle_command(
            CommandMessage::ForwardToPlayer {
                action: "test_action".to_string(),
            },
            shared_state.clone(),
        )
        .await;
        assert_eq!(result.unwrap(), "forwarded");
        assert_eq!(rx.recv().await.unwrap(), "test_action");
    }
}
