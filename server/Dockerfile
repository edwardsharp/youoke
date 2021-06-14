FROM debian:stable-slim

# general dependencies
RUN apt-get update -y
RUN apt-get install -y curl


# install target toolchain
RUN apt-get update --fix-missing
ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=America/New_York
RUN apt-get install -y build-essential gcc-arm-linux-gnueabihf openssl libssl-dev pkg-config

# install Rust
WORKDIR /root
RUN curl https://sh.rustup.rs -sSf > rustup.sh
RUN chmod +x rustup.sh
RUN /bin/sh -c './rustup.sh -y'
RUN echo 'export PATH="$HOME/.cargo/bin:$PATH"' > /root/.bashrc

# install cross-compiled standard crates
RUN /root/.cargo/bin/rustup target add armv7-unknown-linux-gnueabihf

# configure cargo for cross compilation
RUN mkdir -p /root/.cargo
RUN printf '[target.armv7-unknown-linux-gnueabihf] \n\
  linker = "arm-linux-gnueabihf-gcc"' >> /root/.cargo/config

# copy stuff
WORKDIR /root/youoke
ENV USER root
ENV PATH $PATH:/root/.cargo/bin
COPY ./Cargo.toml Cargo.toml
# COPY ./Cargo.lock Cargo.lock
COPY ./src/main.rs src/main.rs

RUN cargo build --release --target=armv7-unknown-linux-gnueabihf

ENTRYPOINT /bin/bash