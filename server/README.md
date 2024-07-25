# youoke server

a websocket server for handling a queue of requests, calling yt-dlp cli command, and an example video player

...written in Rust! 🤘

### devel

```sh
cargo install
cargo test
RUST_LOG=info cargo run
cargo build
```

### docker

go at yr own risk; used this for building arm binary to run on raspberry pi (`--target=armv7-unknown-linux-gnueabihf`)

mileage may vary `:/`
