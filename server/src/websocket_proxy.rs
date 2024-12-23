use futures_util::stream::StreamExt;
use futures_util::SinkExt;
use rustls_pemfile::{certs, pkcs8_private_keys};
use std::fs::File;
use std::io::{self, BufReader};
use std::sync::Arc;
use tokio::net::{TcpListener, TcpStream};
use tokio_rustls::rustls::{Certificate, PrivateKey, ServerConfig};
use tokio_rustls::TlsAcceptor;
use tokio_tungstenite::accept_async;
use tokio_tungstenite::connect_async;
// use tokio_tungstenite::tungstenite::protocol::Message;
// use tokio_rustls::rustls::server::AllowAnyAuthenticatedClient;
// use rustls::server::AllowAnyAuthenticatedClient;

pub async fn handle_connection(
    stream: tokio_rustls::server::TlsStream<TcpStream>,
    target_addr: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let ws_stream = accept_async(stream).await?;
    let (mut ws_sender, mut ws_receiver) = ws_stream.split();

    let (target_ws_stream, _) = connect_async(target_addr).await?;
    let (mut target_ws_sender, mut target_ws_receiver) = target_ws_stream.split();

    let ws_to_target = async {
        while let Some(message) = ws_receiver.next().await {
            let message = message?;
            target_ws_sender.send(message).await?;
        }
        Ok::<(), Box<dyn std::error::Error>>(())
    };

    let target_to_ws = async {
        while let Some(message) = target_ws_receiver.next().await {
            let message = message?;
            ws_sender.send(message).await?;
        }
        Ok::<(), Box<dyn std::error::Error>>(())
    };

    tokio::select! {
        res = ws_to_target => res?,
        res = target_to_ws => res?,
    }

    Ok(())
}

fn load_certs(path: &str) -> io::Result<Vec<Certificate>> {
    let certfile = File::open(path)?;
    let mut reader = BufReader::new(certfile);
    let certs = certs(&mut reader)
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidData, "Failed to load certificates"))?
        .into_iter()
        .map(Certificate)
        .collect();
    Ok(certs)
}

fn load_private_key(path: &str) -> io::Result<PrivateKey> {
    let keyfile = File::open(path)?;
    let mut reader = BufReader::new(keyfile);
    let keys = pkcs8_private_keys(&mut reader)
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidData, "Failed to load private key"))?;
    if keys.is_empty() {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "No private keys found",
        ));
    }
    Ok(PrivateKey(keys[0].clone()))
}

pub async fn start_proxy_server(
    cert_path: &str,
    key_path: &str,
    listen_addr: &str,
    target_addr: &str,
) -> io::Result<()> {
    let certs = load_certs(cert_path)?;
    let key = load_private_key(key_path)?;

    // use tokio_rustls::rustls::server::AllowAnyAuthenticatedClient;
    let mut config = ServerConfig::new(tokio_rustls::rustls::NoClientAuth::new());
    config
        .set_single_cert(certs, key)
        .map_err(|e| io::Error::new(io::ErrorKind::InvalidData, e))?;

    let acceptor = TlsAcceptor::from(Arc::new(config));

    let listener = TcpListener::bind(listen_addr).await?;
    println!("Listening on {}", listen_addr);

    loop {
        let (stream, _) = listener.accept().await?;
        let acceptor = acceptor.clone();
        let target_addr = target_addr.to_string();

        tokio::spawn(async move {
            let tls_stream = acceptor.accept(stream).await.unwrap();
            if let Err(e) = handle_connection(tls_stream, &target_addr).await {
                eprintln!("Error handling connection: {}", e);
            }
        });
    }
}
