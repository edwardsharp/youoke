mod job_handlers;

use job_handlers::process_job;
use shared::db_worker::DbWorker;

use tokio::time::sleep;

#[tokio::main]
async fn main() {
    let db = DbWorker::start("queue.db");

    for _ in 0..4 {
        let db = db.clone();
        tokio::spawn(async move {
            loop {
                let jobs = db.fetch_pending(1);
                for job in jobs {
                    db.update_status(job.id, "in_progress");

                    match process_job(job.clone()).await {
                        Ok(_) => db.update_status(job.id, "done"),
                        Err(e) => {
                            eprintln!("Job {} failed: {}", job.id, e);
                            db.update_status(job.id, "failed");
                        }
                    }
                }

                sleep(std::time::Duration::from_millis(300)).await;
            }
        });
    }

    loop {
        sleep(std::time::Duration::from_secs(60)).await;
    }
}
