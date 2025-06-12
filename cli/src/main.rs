// main.rs
use clap::{Parser, Subcommand};
use rand::Rng;
use std::collections::HashMap;
use std::env;
use std::io::{self, Write};
use std::process::Command;
use std::process::Stdio;
use std::sync::Arc;

#[derive(Parser, Debug)]
#[command(
    name = "Youoke CLI Launcher",
    about = "🚀 Youoke multi-process dev launcher",
    version
)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,

    /// Show debug logs from all child processes
    #[arg(long, default_value_t = false)]
    verbose: bool,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Launch server(s) with configured environment
    Launch,

    /// Show the environment variables to be used
    Env,
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    show_banner();

    let mut envs = default_envs();
    prompt_env_vars(&mut envs)?;

    match &cli.command {
        Some(Commands::Env) => {
            println!("\n🔧 Using environment variables:");
            for (k, v) in &envs {
                println!("  {} = {}", k, v);
            }
        }
        Some(Commands::Launch) | None => {
            println!("\n🚀 Launching youoke processes...");
            run_commands(&envs, cli.verbose)?;
        }
    }

    Ok(())
}

fn show_banner() {
    println!(
        r#"
__   _____  _   _  ___  _  _______
\ \ / / _ \| | | |/ _ \| |/ / ____|
  \ V / | | | | | | | | | ' /|  _|
  | || |_| | |_| | |_| | . \| |___
  |_| \___/ \___/ \___/|_|\_\_____|
"#
    );
}

fn default_envs() -> HashMap<String, String> {
    let mut map = HashMap::new();
    map.insert("WS_ADDRESS".into(), "127.0.0.1:9001".into());
    map.insert("HTTP_ADDRESS".into(), "127.0.0.1:9002".into());
    map.insert("LIB_DIR".into(), "./library".into());
    map.insert("PLAYER_DIR".into(), "player/public/".into());
    map.insert("HANDSHAKE_CODE".into(), generate_code());
    map
}

fn prompt_env_vars(envs: &mut HashMap<String, String>) -> anyhow::Result<()> {
    println!("\n🔧 Configure environment (press Enter to use default):");
    for (key, default) in envs.clone() {
        print!("{} [{}]: ", key, default);
        io::stdout().flush()?;
        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        let input = input.trim();
        if !input.is_empty() {
            if key == "HANDSHAKE_CODE"
                && (input.len() != 6 || !input.chars().all(|c| c.is_digit(10)))
            {
                println!("❌ HANDSHAKE_CODE must be exactly 6 digits. Using auto-generated.");
            } else {
                envs.insert(key, input.to_string());
            }
        }
    }
    Ok(())
}

fn run_commands(envs: &HashMap<String, String>, verbose: bool) -> anyhow::Result<()> {
    let mut commands = vec![
        ("youoke-server", vec!["--bin", "youoke-server"]),
        ("youoke-worker", vec!["--bin", "youoke-worker"]),
    ];

    for (name, args) in commands.drain(..) {
        let mut cmd = Command::new("cargo");
        cmd.args(args);
        for (key, val) in envs {
            cmd.env(key, val);
        }
        if verbose {
            cmd.stdout(Stdio::inherit()).stderr(Stdio::inherit());
        } else {
            cmd.stdout(Stdio::null()).stderr(Stdio::null());
        }
        println!("▶️  Starting: {}...", name);
        let _child = cmd.spawn()?;
    }
    Ok(())
}

fn generate_code() -> String {
    let mut rng = rand::thread_rng();
    format!("{:06}", rng.gen_range(0..1_000_000))
}
