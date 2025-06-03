use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct Job {
    pub id: i64,
    pub job_type: String,
    pub status: String,
    pub payload: String,
}
