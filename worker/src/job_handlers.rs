use shared::models::Job;
use tokio::time::{sleep, Duration};

pub async fn process_job(job: Job) -> Result<(), String> {
    match job.job_type.as_str() {
        "auth" => process_auth(job).await,
        "chat" => process_chat(job).await,
        "email" => process_email(job).await,
        "fook" => process_fook(job).await,
        other => Err(format!("Unknown job_type: {}", other)),
    }
}

async fn process_auth(job: Job) -> Result<(), String> {
    println!("auth job {}: {}", job.id, job.payload);
    sleep(Duration::from_secs(1)).await;
    Ok(())
}

async fn process_chat(job: Job) -> Result<(), String> {
    println!("chat job {}: {}", job.id, job.payload);
    sleep(Duration::from_secs(2)).await;
    Ok(())
}

async fn process_email(job: Job) -> Result<(), String> {
    println!("email job {}: {}", job.id, job.payload);
    sleep(Duration::from_secs(3)).await;
    Ok(())
}

async fn process_fook(job: Job) -> Result<(), String> {
    println!("fook job {}: {}", job.id, job.payload);
    sleep(Duration::from_secs(3)).await;
    Ok(())
}
