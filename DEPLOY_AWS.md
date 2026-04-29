# Kartvizit Uygulaması - AWS EC2 Deploy Rehberi

Bu rehber, Kartvizit (Dijital Kartvizit) uygulamasını AWS EC2 Ubuntu sunucusuna deploy etmek için adım adım talimatlar içerir.

---

## 1. AWS EC2 Instance Oluşturma

1. AWS Console'a giriş yapın: https://console.aws.amazon.com
2. **EC2** > **Launch Instance** tıklayın
3. Ayarlar:
   - **Name**: kartvizit-server
   - **OS**: Ubuntu 24.04 LTS (Free Tier uygun)
   - **Instance Type**: t3.small (2GB RAM minimum, t3.medium önerilir)
   - **Key Pair**: Yeni bir SSH key oluşturun ve `.pem` dosyasını indirin
   - **Storage**: En az 20GB SSD
   - **Security Group**: Aşağıdaki portları açın:

| Port | Kaynak | Açıklama |
|------|--------|----------|
| 22 | IP'niz | SSH erişimi |
| 80 | 0.0.0.0/0 | HTTP (Frontend) |
| 443 | 0.0.0.0/0 | HTTPS (opsiyonel) |
| 5002 | 0.0.0.0/0 | Backend API (opsiyonel, nginx proxy kullanılacaksa gerekmez) |

4. **Launch Instance** tıklayın
5. Instance'ın **Public IPv4 Address**'ini not edin

---

## 2. SSH ile Sunucuya Bağlanma

```bash
# .pem dosyasına izin verin
chmod 400 ~/Downloads/kartvizit-key.pem

# SSH ile bağlanın (IP'yi değiştirin)
ssh -i ~/Downloads/kartvizit-key.pem ubuntu@SUNUCU_IP
```

---

## 3. Sunucu Hazırlığı

Sunucuya bağlandıktan sonra:

```bash
# Sistemi güncelle
sudo apt-get update && sudo apt-get upgrade -y

# Docker yükle
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Kullanıcıyı docker grubuna ekle
sudo usermod -aG docker $USER

# Logout/login yapın (veya newgrp docker)
newgrp docker
```

---

## 4. Proje Dosyalarını Sunucuya Kopyalama

**Yerel bilgisayarınızda** (Windows PowerShell):

```powershell
# SCP ile dosyaları kopyalayın (projeyi .zip olarak sıkıştırın önce)
# Yöntem 1: SCP ile kopyalama
scp -i ~/Downloads/kartvizit-key.pem -r "C:\Users\gurs01tr\Downloads\BussinessCard-main" ubuntu@SUNUCU_IP:~/kartvizit

# Yöntem 2: Git kullanıyorsanız, sunucuda clone yapın
# SSH ile sunucuya bağlanın ve:
# git clone <repo-url> ~/kartvizit
```

---

## 5. Docker ile Deploy

**Sunucuda** SSH ile bağlanıp:

```bash
cd ~/kartvizit

# Container'ları build et ve başlat
docker compose build --no-cache
docker compose up -d

# Çalışıp çalışmadığını kontrol et
docker compose ps
docker compose logs -f
```

Uygulama şu adrestlerde çalışacak:
- **Frontend**: `http://SUNUCU_IP`
- **Backend API**: `http://SUNUCU_IP:5002` (veya nginx üzerinden `http://SUNUCU_IP/api/`)

---

## 6. HTTPS (Opsiyonel - Önerilir)

Let's Encrypt ile ücretsiz SSL sertifikası:

```bash
# Certbot yükle
sudo apt-get install -y certbot python3-certbot-nginx

# Domain'iniz varsa (DNS'i sunucu IP'sine yönlendirin):
sudo certbot --nginx -d kartvizit.sizin-domain.com
```

Domain yerine IP kullanıyorsanız, Cloudflare gibi bir servis ile ücretsiz SSL kullanabilirsiniz.

---

## 7. Güvenlik Önlemleri

```bash
# Firewall ayarları (sadece gerekli portları açın)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Backend portunu dışarıya kapatmak isterseniz (nginx proxy yeterli):
# Security Group'tan 5002 portunu kaldırın
```

**Önemli**: `database.py` ve `auth.py` içindeki hassas bilgileri (veritabanı şifresi, SECRET_KEY) environment variable olarak ayarlayın:

```bash
# .env dosyası oluşturun (sunucuda)
cat > ~/kartvizit/.env << 'EOF'
SECRET_KEY=buraya-guclu-bir-secret-key-yazin
ODBC_CONN=DRIVER={ODBC Driver 17 for SQL Server};SERVER=104.247.167.130,57673;DATABASE=yazil112_meeting;UID=yazil112_test2;PWD=GURkan5391;charset=UTF-8
EOF
```

---

## 8. Faydalı Komutlar

```bash
# Logları görüntüle
docker compose logs -f

# Sadece backend logları
docker compose logs -f backend

# Uygulamayı yeniden başlat
docker compose restart

# Uygulamayı durdur
docker compose down

# Yeni deploy (kod değişikliğinden sonra)
docker compose build --no-cache && docker compose up -d

# Disk kullanımı
docker system df

# Temizlik (dangling images, stopped containers)
docker system prune -f
```

---

## Mimari

```
Internet → [EC2 Security Group]
                ↓
         [Nginx :80] (Frontend container)
          ↓          ↓
    /api/* → [FastAPI :5002] (Backend container)
    /media/* → [FastAPI :5002]
    /* → [React SPA]
                ↓
         [SQL Server 104.247.167.130:57673] (Harici veritabanı)
```
