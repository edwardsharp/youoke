use rusqlite::Connection;
use serde_json::Value;
use shared::{db, db_worker::DbWorker, models::Job};
use std::sync::Arc;
use warp::Filter;

// use crate::db_worker::DbWorker;

#[tokio::main]
async fn main() {
    let db = DbWorker::start("queue.db");
    let db_filter = warp::any().map(move || db.clone());

    let ws_route = warp::path("submit")
        .and(warp::body::json())
        .and(db_filter)
        .and_then(handle_submit);

    println!("🚀 Server running on http://localhost:3030");
    warp::serve(ws_route).run(([127, 0, 0, 1], 3030)).await;
}

pub async fn handle_submit(json: Value, db: DbWorker) -> Result<impl warp::Reply, warp::Rejection> {
    let payload = serde_json::to_string(&json).unwrap();

    db.enque("chat", &payload); // enqueue is a synchronous send()
    Ok(warp::reply::json(&"queued"))
}
