# Survey API Makefile

.PHONY: help build run test clean deps dev docker-build docker-run

# Default target
help:
	@echo "Survey API - Available commands:"
	@echo "  make deps      - Download Go dependencies"
	@echo "  make build     - Build the application"
	@echo "  make run       - Run the application"
	@echo "  make dev       - Run with hot reload (requires air)"
	@echo "  make test      - Run tests"
	@echo "  make test-api  - Test API endpoints"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run   - Run with Docker Compose"

# Download dependencies
deps:
	@echo "📦 Downloading dependencies..."
	go mod download
	go mod tidy

# Build the application
build:
	@echo "🔨 Building application..."
	go build -o bin/survey-api main.go

# Run the application
run:
	@echo "🚀 Starting server..."
	go run main.go

# Run with hot reload (requires air)
dev:
	@echo "🔥 Starting with hot reload..."
	@if ! command -v air >/dev/null 2>&1; then \
		echo "Installing air for hot reload..."; \
		go install github.com/cosmtrek/air@latest; \
	fi
	air

# Run tests
test:
	@echo "🧪 Running tests..."
	go test ./...

# Test API endpoints
test-api:
	@echo "🧪 Testing API endpoints..."
	@if ! command -v jq >/dev/null 2>&1; then \
		echo "❌ jq is required for API testing. Please install jq first."; \
		exit 1; \
	fi
	./test-api.sh

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf bin/
	go clean

# Build Docker image
docker-build:
	@echo "🐳 Building Docker image..."
	docker build -t survey-api .

# Run with Docker Compose
docker-run:
	@echo "🐳 Starting with Docker Compose..."
	docker-compose up -d

# Stop Docker Compose
docker-stop:
	@echo "🛑 Stopping Docker Compose..."
	docker-compose down

# View logs
logs:
	@echo "📋 Viewing logs..."
	docker-compose logs -f api

# Database commands
db-migrate:
	@echo "🗄️ Running database migration..."
	go run main.go migrate

# Install development tools
install-tools:
	@echo "🛠️ Installing development tools..."
	go install github.com/cosmtrek/air@latest
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Lint code
lint:
	@echo "🔍 Linting code..."
	golangci-lint run

# Format code
fmt:
	@echo "✨ Formatting code..."
	go fmt ./...
	go mod tidy
