#!/bin/bash

# VPS Setup Script for Survey Website
# Run this script on the VPS to prepare the environment

set -e

echo "🚀 Setting up VPS for Survey Website deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose already installed"
fi

# Install Git
echo "📁 Installing Git..."
sudo apt install -y git

# Install curl for health checks
echo "🌐 Installing curl..."
sudo apt install -y curl

# Create project directory
echo "📂 Creating project directory..."
sudo mkdir -p /var/www/survey-web
sudo chown ubuntu:ubuntu /var/www/survey-web
cd /var/www/survey-web

# Clone repository (if not exists)
if [ ! -d ".git" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/your-username/survey-website.git .
else
    echo "✅ Repository already exists"
fi

# Create environment file
echo "⚙️ Creating environment file..."
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/survey_database
JWT_SECRET=8bee05d9f05b1d367ed47f9da766521c
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
ADMIN_PIN=akanselesai2025
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
EOF
            
# Create cleanup script
echo "🧹 Creating cleanup script..."
cat > cleanup.sh << 'EOF'
#!/bin/bash
# Cleanup script to remove old Docker images and containers

echo "🧹 Cleaning up Docker resources..."

# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f

echo "✅ Cleanup completed!"
EOF

chmod +x cleanup.sh

# Setup cron job for cleanup (daily at 2 AM)
echo "⏰ Setting up daily cleanup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/survey-web/cleanup.sh") | crontab -

# Create systemd service for auto-start
echo "🔄 Creating systemd service..."
sudo tee /etc/systemd/system/survey-website.service > /dev/null << EOF
[Unit]
Description=Survey Website Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/www/survey-web
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl enable survey-website.service

# Setup firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 5434/tcp
sudo ufw --force enable

echo "✅ VPS setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Add GitHub repository secrets:"
echo "   - VPS_HOST: 43.173.30.94"
echo "   - VPS_USERNAME: ubuntu"
echo "   - VPS_PASSWORD: s&yA)S=98dL?zu)DS"
echo ""
echo "2. Push to main branch to trigger deployment"
echo ""
echo "3. Application will be available at: http://43.173.30.94:3000"
echo ""
echo "🔧 Useful commands:"
echo "   - Check status: docker compose ps"
echo "   - View logs: docker compose logs -f"
echo "   - Manual cleanup: ./cleanup.sh"
echo "   - Restart service: sudo systemctl restart survey-website"
