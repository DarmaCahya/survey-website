# 🚀 Deployment Guide

## Prerequisites

- VPS dengan Ubuntu 20.04+ atau Debian 11+
- Domain (opsional, bisa pakai IP)
- GitHub account dengan repository ini

## 📋 Quick Setup

### 1. Setup VPS (One-Time)

SSH ke VPS Anda dan jalankan:

```bash
# Download dan jalankan setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/scripts/setup-vps-simple.sh -o setup.sh
chmod +x setup.sh
./setup.sh

# Log out dan log in kembali
exit
```

### 2. Setup GitHub Secrets

Di GitHub repository Anda, buka **Settings → Secrets and variables → Actions**, tambahkan:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VPS_HOST` | IP atau domain VPS | `123.45.67.89` |
| `VPS_USERNAME` | Username SSH | `ubuntu` |
| `VPS_PASSWORD` | Password SSH | `your-password` |

### 3. Setup Environment Variables di VPS

SSH ke VPS dan buat file `.env`:

```bash
cd /var/www/survey-web
nano .env
```

Isi dengan:

```env
# Database
DATABASE_URL="postgresql://user:password@db:5432/survey_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Admin
ADMIN_PIN="1234"

# Next.js
NEXT_PUBLIC_API_URL="http://your-domain.com"
```

## 🔄 Automatic Deployment

Setiap kali Anda push ke branch `main`:

1. ✅ Code akan di-build dan test
2. ✅ Docker image akan dibuat
3. ✅ Image akan di-push ke GitHub Container Registry
4. ✅ VPS akan pull image terbaru
5. ✅ Services akan restart otomatis
6. ✅ Health check akan dijalankan

## 🛠️ Manual Deployment

Jika perlu deploy manual:

```bash
# SSH ke VPS
ssh user@your-vps

# Navigate ke project
cd /var/www/survey-web

# Pull latest code
git pull origin main

# Pull latest image
docker compose pull

# Restart services
docker compose up -d

# Check logs
docker compose logs -f
```

## 📊 Monitoring

### Check Status

```bash
# Check running containers
docker compose ps

# Check logs
docker compose logs -f

# Check specific service
docker compose logs -f web
```

### Health Check

```bash
# Manual health check
curl http://localhost:3000/api/health
```

## 🔧 Troubleshooting

### Container tidak start

```bash
# Check logs
docker compose logs

# Restart services
docker compose restart

# Full restart
docker compose down && docker compose up -d
```

### Database issues

```bash
# Check database logs
docker compose logs db

# Run migrations
docker compose exec web npx prisma migrate deploy
```

### Permission issues

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/survey-web
```

## 🔐 Security Checklist

- [ ] Change default `ADMIN_PIN`
- [ ] Use strong `JWT_SECRET`
- [ ] Setup firewall (UFW)
- [ ] Use SSH keys instead of password
- [ ] Setup SSL/TLS with Nginx/Caddy
- [ ] Regular backups of database
- [ ] Keep system updated

## 📝 Notes

- Default port: `3000`
- Database port: `5432` (internal only)
- Logs location: Docker logs (use `docker compose logs`)
- Data persistence: Docker volumes

## 🆘 Support

Jika ada masalah:
1. Check logs: `docker compose logs`
2. Check GitHub Actions workflow
3. Verify environment variables
4. Check VPS resources (disk, memory)

