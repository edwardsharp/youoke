use crate::models::Job;
use chrono::Utc;
use rusqlite::{params, Connection};

pub fn init_db(conn: &Connection) {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS job_queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status TEXT NOT NULL,
            job_type TEXT NOT NULL,
            payload TEXT NOT NULL,
            created_at TEXT,
            updated_at TEXT
        );",
    )
    .unwrap();
}

pub fn enqueue(conn: &Connection, job_type: &str, payload: &str) {
    let now = Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO job_queue (status, job_type, payload, created_at, updated_at) VALUES ('pending', ?1, ?2, ?3, ?3)",
        params![job_type, payload, now],
    ).unwrap();
}

pub fn fetch_pending(conn: &Connection, limit: usize) -> Vec<Job> {
    let mut stmt = conn.prepare(
        "SELECT id, status, job_type, payload FROM job_queue WHERE status = 'pending' ORDER BY created_at LIMIT ?1",
    ).unwrap();

    let rows = stmt
        .query_map(params![limit], |row| {
            Ok(Job {
                id: row.get(0)?,
                status: row.get(1)?,
                job_type: row.get(2)?,
                payload: row.get(3)?,
            })
        })
        .unwrap();

    rows.filter_map(Result::ok).collect()
}

pub fn update_status(conn: &Connection, id: i64, status: &str) {
    conn.execute(
        "UPDATE job_queue SET status = ?1, updated_at = ?2 WHERE id = ?3",
        params![status, Utc::now().to_rfc3339(), id],
    )
    .unwrap();
}
