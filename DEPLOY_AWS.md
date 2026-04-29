# Kartvizit Uygulaması - AWS EC2 Deploy Rehberi

Bu rehber, Kartvizit (Dijital Kartvizit) uygulamasını AWS EC2 Ubuntu sunucusuna deploy etmek için adım adım talimatlar içerir.

---

## Hızlı Deploy (AWS CloudShell)

Aşağıdaki script'i AWS CloudShell'e yapıştırıp çalıştırın. Her şeyi otomatik yapar:

```bash
#!/bin/bash
set -e

REGION="eu-north-1"
INSTANCE_NAME="kartvizit-server"
KEY_NAME="kartvizit-key-$(date +%s)"
SG_NAME="kartvizit-sg-$(date +%s)"
INSTANCE_TYPE="t3.small"
REPO_URL="https://github.com/gsavasci539/BussinessCard.git"

echo "🚀 Kartvizit EC2 deploy başlıyor..."

# Get latest Ubuntu 24.04 AMI
AMI_ID=$(aws ssm get-parameters \
  --names /aws/service/canonical/ubuntu/server/24.04/stable/current/amd64/hvm/ebs-gp3/ami-id \
  --region $REGION \
  --query "Parameters[0].Value" \
  --output text)

echo "📦 AMI: $AMI_ID"

# Create SSH key pair
aws ec2 create-key-pair \
  --key-name "$KEY_NAME" \
  --region "$REGION" \
  --query 'KeyMaterial' \
  --output text > "${KEY_NAME}.pem"

chmod 400 "${KEY_NAME}.pem"
echo "🔑 Key pair oluşturuldu: ${KEY_NAME}.pem"

# Get default VPC
VPC_ID=$(aws ec2 describe-vpcs \
  --region "$REGION" \
  --query "Vpcs[?IsDefault==\`true\`].VpcId | [0]" \
  --output text)

# Create security group
SG_ID=$(aws ec2 create-security-group \
  --group-name "$SG_NAME" \
  --description "Kartvizit EC2 Security Group" \
  --vpc-id "$VPC_ID" \
  --region "$REGION" \
  --query 'GroupId' \
  --output text)

echo "🛡️ Security Group: $SG_ID"

# Allow SSH
aws ec2 authorize-security-group-ingress \
  --group-id "$SG_ID" \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0 \
  --region "$REGION"

# Allow HTTP
aws ec2 authorize-security-group-ingress \
  --group-id "$SG_ID" \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0 \
  --region "$REGION"

# Allow HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id "$SG_ID" \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0 \
  --region "$REGION"

# Create user-data script (runs on first boot)
cat > userdata.sh <<'USERDATA'
#!/bin/bash
set -e

# Update system
apt-get update -y
apt-get upgrade -y

# Install Docker
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

usermod -aG docker ubuntu
systemctl enable docker
systemctl start docker

# Install nginx on host (reverse proxy)
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx

# Clone repo
rm -rf /home/ubuntu/kartvizit
git clone https://github.com/gsavasci539/BussinessCard.git /home/ubuntu/kartvizit
cd /home/ubuntu/kartvizit

# Create .env file
cat > .env <<'ENVFILE'
SECRET_KEY=super-secret-key-change-me-2024
ODBC_CONN=DRIVER={ODBC Driver 17 for SQL Server};SERVER=104.247.167.130,57673;DATABASE=yazil112_meeting;UID=yazil112_test2;PWD=GURkan5391;charset=UTF-8
CORS_ORIGINS=
ENVFILE

# Build and start Docker containers
cd /home/ubuntu/kartvizit
docker compose up -d --build

# Wait for containers to start
sleep 10

# Get the instance public IP for CORS
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Update .env with CORS origins for this instance
cat > /home/ubuntu/kartvizit/.env <<ENVEOF
SECRET_KEY=super-secret-key-change-me-2024
ODBC_CONN=DRIVER={ODBC Driver 17 for SQL Server};SERVER=104.247.167.130,57673;DATABASE=yazil112_meeting;UID=yazil112_test2;PWD=GURkan5391;charset=UTF-8
CORS_ORIGINS=http://${PUBLIC_IP},https://${PUBLIC_IP},http://${PUBLIC_IP}:5002
ENVEOF

# Restart backend with updated CORS
docker compose up -d

# Configure host nginx as reverse proxy
cat > /etc/nginx/sites-available/default <<'NGINXCONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    client_max_body_size 50M;

    # API requests -> backend (preserve /api/ prefix!)
    location /api/ {
        proxy_pass http://127.0.0.1:5002/api/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (for future use)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Media files -> backend
    location /media/ {
        proxy_pass http://127.0.0.1:5002/media/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Everything else -> frontend
    location / {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGINXCONF

nginx -t
systemctl restart nginx

echo "✅ Kartvizit deploy tamamlandi!" > /home/ubuntu/deploy-status.txt
USERDATA

USER_DATA=$(base64 -w 0 userdata.sh)

# Launch EC2 instance
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SG_ID" \
  --user-data "$USER_DATA" \
  --block-device-mappings '[{"DeviceName":"/dev/sda1","Ebs":{"VolumeSize":25,"VolumeType":"gp3"}}]' \
  --region "$REGION" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]" \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "⏳ EC2 açılıyor... Instance: $INSTANCE_ID"
aws ec2 wait instance-running \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION"

# Wait a bit more for IP assignment
sleep 15

PUBLIC_DNS=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query 'Reservations[0].Instances[0].PublicDnsName' \
  --output text)

PUBLIC_IP=$(aws ec2 describe-instances \
  --instance-ids "$INSTANCE_ID" \
  --region "$REGION" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)

echo ""
echo "✅ EC2 INSTANCE OLUŞTURULDU"
echo "=========================================="
echo "Instance ID:  $INSTANCE_ID"
echo "Public IP:    $PUBLIC_IP"
echo "Public DNS:   $PUBLIC_DNS"
echo "SSH Key:      ${KEY_NAME}.pem"
echo ""
echo "🌐 Uygulama (2-3 dk sonra erişilebilir):"
echo "   http://$PUBLIC_IP"
echo "   http://$PUBLIC_DNS"
echo ""
echo "🔐 SSH Bağlantısı:"
echo "   ssh -i ${KEY_NAME}.pem ubuntu@$PUBLIC_DNS"
echo ""
echo "⚠️  NOT: User-data script Docker build yapıyor,"
echo "   uygulamanın ayağa kalkması 3-5 dakika sürebilir."
echo "   SSH ile bağlanıp 'docker compose logs -f' ile takip edebilirsiniz."
echo "=========================================="
```

---

## Manuel Deploy (Adım Adım)

### 1. AWS EC2 Instance Oluşturma

1. AWS Console'a giriş yapın: https://console.aws.amazon.com
2. **EC2** > **Launch Instance** tıklayın
3. Ayarlar:
   - **Name**: kartvizit-server
   - **OS**: Ubuntu 24.04 LTS
   - **Instance Type**: t3.small (2GB RAM minimum)
   - **Key Pair**: Yeni SSH key oluşturun
   - **Storage**: En az 25GB SSD
   - **Security Group**: Port 22, 80, 443 açın

### 2. SSH ile Bağlanma

```bash
chmod 400 kartvizit-key.pem
ssh -i kartvizit-key.pem ubuntu@SUNUCU_IP
```

### 3. Docker Yükleme

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

### 4. Proje Dosyalarını Kopyalama

```bash
git clone https://github.com/gsavasci539/BussinessCard.git ~/kartvizit
cd ~/kartvizit
```

### 5. .env Dosyası Oluşturma

```bash
cat > ~/kartvizit/.env << 'EOF'
SECRET_KEY=buraya-guclu-bir-secret-key-yazin
ODBC_CONN=DRIVER={ODBC Driver 17 for SQL Server};SERVER=104.247.167.130,57673;DATABASE=yazil112_meeting;UID=yazil112_test2;PWD=GURkan5391;charset=UTF-8
CORS_ORIGINS=http://SUNUCU_IP,https://SUNUCU_IP
EOF
```

### 6. Docker ile Başlatma

```bash
cd ~/kartvizit
docker compose up -d --build
```

### 7. Host Nginx Reverse Proxy

```bash
sudo apt-get install -y nginx

sudo tee /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    client_max_body_size 50M;

    location /api/ {
        proxy_pass http://127.0.0.1:5002/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /media/ {
        proxy_pass http://127.0.0.1:5002/media/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

sudo nginx -t && sudo systemctl restart nginx
```

---

## HTTPS (Opsiyonel)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kartvizit.sizin-domain.com
```

---

## Faydalı Komutlar

```bash
docker compose logs -f              # Logları izle
docker compose logs -f backend      # Sadece backend
docker compose restart              # Yeniden başlat
docker compose down                 # Durdur
docker compose build --no-cache && docker compose up -d   # Yeni deploy
docker system prune -f              # Temizlik
```

---

## Mimari

```
Internet → [EC2 Security Group :80/:443]
                ↓
         [Host Nginx :80] (Reverse Proxy)
          /api/*  →  [FastAPI :5002] (Backend Docker container)
          /media/* → [FastAPI :5002]
          /*      →  [Nginx :3000]  (Frontend Docker container - static files)
                              ↓
         [SQL Server 104.247.167.130:57673] (Harici veritabanı)
```
