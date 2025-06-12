use rusqlite::Connection;
use std::sync::mpsc;
use std::thread;

use crate::db;
use crate::models::Job;

#[derive(Clone)]
pub struct DbWorker {
    tx: mpsc::Sender<DbCommand>,
}

enum DbCommand {
    FetchPending {
        limit: usize,
        respond_to: mpsc::Sender<Vec<Job>>,
    },
    UpdateStatus {
        id: i64,
        status: String,
    },
    Enque {
        job_type: String,
        payload: String,
    },
}

impl DbWorker {
    pub fn start(db_path: &str) -> Self {
        let (tx, rx) = mpsc::channel::<DbCommand>();
        let path = db_path.to_string();

        thread::spawn(move || {
            let conn = Connection::open(path).unwrap();
            db::init_db(&conn);

            for cmd in rx {
                match cmd {
                    DbCommand::FetchPending { limit, respond_to } => {
                        let jobs = db::fetch_pending(&conn, limit);
                        let _ = respond_to.send(jobs);
                    }
                    DbCommand::UpdateStatus { id, status } => {
                        db::update_status(&conn, id, &status);
                    }
                    DbCommand::Enque { job_type, payload } => {
                        db::enqueue(&conn, &job_type, &payload);
                    }
                }
            }
        });

        DbWorker { tx }
    }

    pub fn fetch_pending(&self, limit: usize) -> Vec<Job> {
        let (tx, rx) = mpsc::channel();
        let _ = self.tx.send(DbCommand::FetchPending {
            limit,
            respond_to: tx,
        });
        rx.recv().unwrap_or_else(|_| vec![])
    }

    pub fn update_status(&self, id: i64, status: &str) {
        let _ = self.tx.send(DbCommand::UpdateStatus {
            id,
            status: status.to_string(),
        });
    }

    pub fn enque(&self, job_type: &str, status: &str) {
        let _ = self.tx.send(DbCommand::Enque {
            job_type: job_type.to_string(),
            payload: status.to_string(),
        });
    }
}
