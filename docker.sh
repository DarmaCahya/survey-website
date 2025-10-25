#!/bin/bash

# Docker Management Script for Survey Website

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to build and start containers
start() {
    print_status "Starting Survey Website with Docker..."
    
    check_docker
    
    # Build and start containers
    docker compose up --build -d
    
    print_success "Containers started successfully!"
    print_status "Application will be available at: http://localhost:3000"
    print_status "Database will be available at: localhost:5434"
    
    # Show container status
    echo ""
    print_status "Container Status:"
    docker compose ps
}

# Function to stop containers
stop() {
    print_status "Stopping Survey Website containers..."
    
    docker compose down
    
    print_success "Containers stopped successfully!"
}

# Function to restart containers
restart() {
    print_status "Restarting Survey Website containers..."
    
    stop
    start
}

# Function to view logs
logs() {
    print_status "Showing logs..."
    
    docker compose logs -f
}

# Function to clean up everything
clean() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        
        docker compose down -v --remove-orphans
        docker system prune -f
        
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to run database migrations
migrate() {
    print_status "Running database migrations..."
    
    docker compose exec app npx prisma migrate deploy
    
    print_success "Migrations completed!"
}

# Function to seed database
seed() {
    print_status "Seeding database..."
    
    docker compose exec app npx prisma db seed
    
    print_success "Database seeded successfully!"
}

# Function to show help
show_help() {
    echo "Survey Website Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Build and start all containers"
    echo "  stop      Stop all containers"
    echo "  restart   Restart all containers"
    echo "  logs      Show container logs"
    echo "  migrate   Run database migrations"
    echo "  seed      Seed the database"
    echo "  clean     Remove all containers, volumes, and images"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs"
    echo "  $0 migrate"
}

# Main script logic
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    migrate)
        migrate
        ;;
    seed)
        seed
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

