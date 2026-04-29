#!/bin/bash
# Deploy script for Kartvizit application on AWS EC2
# Run this on the EC2 instance after SSH-ing in

set -e

echo "=== Kartvizit AWS Deploy Script ==="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker bulunamadi. Yukleniyor..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "Docker yuklendi. Lutfen scripti tekrar calistirin (logout/login gerekebilir)."
    exit 0
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "Docker Compose bulunamadi. Yukleniyor..."
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
fi

# Create project directory
PROJECT_DIR="$HOME/kartvizit"
mkdir -p $PROJECT_DIR

echo "=== Proje dosyalari hazirlaniyor ==="

# Build and start containers
cd $PROJECT_DIR

if [ -f "docker-compose.yml" ]; then
    echo "Docker container'lar baslatiliyor..."
    docker compose down 2>/dev/null || true
    docker compose build --no-cache
    docker compose up -d
    
    echo ""
    echo "=== Deploy tamamlandi! ==="
    echo "Frontend: http://$(curl -s http://checkip.amazonaws.com)"
    echo "Backend API: http://$(curl -s http://checkip.amazonaws.com):5002"
    echo ""
    echo "Loglari gormek icin:"
    echo "  docker compose logs -f"
    echo ""
    echo "Durdurmak icin:"
    echo "  docker compose down"
else
    echo "HATA: docker-compose.yml bulunamadi!"
    echo "Lutfen proje dosyalarini $PROJECT_dir dizinine kopyalayin."
    exit 1
fi
