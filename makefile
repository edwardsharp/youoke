# === Variables ===
CARGO := cargo
SERVER := youoke-server
WORKER := youoke-worker
PLAYER := youoke-player
DB := queue.db

# === Help (default target) ===
.PHONY: help
help:
	@echo "📦 Usage: make [target]"
	@echo ""
	@echo "🛠️  Build & Run:"
	@echo "  make build          - Build all workspace binaries"
	@echo "  make run-server     - Run the WebSocket/HTTP server"
	@echo "  make run-pub-server - Run the WebSocket/HTTP server on 0.0.0.0"
	@echo "  make run-worker     - Run the job worker processor"
	@echo "  make run-player     - Run the player thing"
	@echo ""
	@echo "🧹 Dev Utilities:"
	@echo "  make fmt            - Format code using rustfmt"
	@echo "  make lint           - Lint all targets with clippy"
	@echo "  make clean          - Clean target artifacts"
	@echo "  make reset-db       - Delete SQLite database (queue.db)"
	@echo ""

# Default to help if no target is specified
.DEFAULT_GOAL := help

# === Build All Binaries ===
.PHONY: build
build:
	$(CARGO) build --workspace

# === Run Server ===
.PHONY: run-server
run-server:
	LIB_DIR=./server/library PLAYER_DIR=./player/public HANDSHAKE_CODE=666666 $(CARGO) run --bin $(SERVER)

# === Run Pub Server ===
.PHONY: run-pub-server
run-pub-server:
	WS_ADDRESS=0.0.0.0:9001 HTTP_ADDRESS=0.0.0.0:9002 LIB_DIR=./server/library PLAYER_DIR=./player/public HANDSHAKE_CODE=666666 $(CARGO) run --bin $(SERVER)

# === Run Worker ===
.PHONY: run-worker
run-worker:
	$(CARGO) run --bin $(WORKER)

# === Run Player ===
.PHONY: run-player
run-player:
	$(CARGO) run --bin $(PLAYER)

# === Format Code ===
.PHONY: fmt
fmt:
	$(CARGO) fmt --all

# === Lint ===
.PHONY: lint
lint:
	$(CARGO) clippy --all-targets --all-features -- -D warnings

# === Clean ===
.PHONY: clean
clean:
	$(CARGO) clean

# === Reset DB ===
.PHONY: reset-db
reset-db:
	rm -f $(DB)
