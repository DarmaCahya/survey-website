#!/bin/bash

# Simple VPS Setup Script for Survey Website
# Run this script on your VPS to prepare it for deployment

set -e

echo "=== Survey Website VPS Setup ==="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Run as regular user with sudo access.${NC}"
   exit 1
fi

echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${YELLOW}Step 2: Installing required packages...${NC}"
sudo apt install -y curl git

echo -e "${YELLOW}Step 3: Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker installed successfully${NC}"
    echo -e "${YELLOW}Note: You may need to log out and back in for docker group changes to take effect${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

echo -e "${YELLOW}Step 4: Installing Docker Compose...${NC}"
if ! command -v docker compose &> /dev/null; then
    sudo apt install -y docker-compose-plugin
    echo -e "${GREEN}✓ Docker Compose installed successfully${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

echo -e "${YELLOW}Step 5: Creating project directory...${NC}"
PROJECT_DIR="/var/www/survey-web"
if [ ! -d "$PROJECT_DIR" ]; then
    sudo mkdir -p "$PROJECT_DIR"
    sudo chown $USER:$USER "$PROJECT_DIR"
    echo -e "${GREEN}✓ Project directory created: $PROJECT_DIR${NC}"
else
    echo -e "${GREEN}✓ Project directory already exists${NC}"
fi

echo -e "${YELLOW}Step 6: Setting up firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 3000/tcp
    echo -e "${GREEN}✓ Firewall rules configured${NC}"
else
    echo -e "${YELLOW}! UFW not found, skipping firewall setup${NC}"
fi

echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo "Next steps:"
echo "1. Log out and log back in (or run: newgrp docker)"
echo "2. Verify Docker: docker --version"
echo "3. Verify Docker Compose: docker compose version"
echo "4. Your deployment will automatically clone the repository"
echo ""
echo "The GitHub Actions workflow will handle the rest!"

