# Production Deployment Guide

Complete guide for deploying Biel's Service Center to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Requirements](#server-requirements)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [WebSocket Server Setup](#websocket-server-setup)
7. [Security Checklist](#security-checklist)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring and Logging](#monitoring-and-logging)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- PHP 8.2 or higher
- Composer 2.x
- Node.js 18.x or higher
- npm or yarn
- MySQL 8.0 or higher
- Web server (Nginx recommended, or Apache)
- SSL certificate for HTTPS

### Required Knowledge
- Basic Linux command line
- SSH access to your server
- Domain name and DNS configuration

---

## Server Requirements

### Minimum Server Specifications
- **CPU**: 2 cores
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum
- **OS**: Ubuntu 22.04 LTS or similar

### PHP Extensions Required
```bash
php -m | grep -E 'pdo_mysql|mbstring|xml|ctype|json|bcmath|fileinfo|tokenizer'
```

Ensure these are installed:
- php8.2-cli
- php8.2-fpm
- php8.2-mysql
- php8.2-mbstring
- php8.2-xml
- php8.2-curl
- php8.2-zip
- php8.2-bcmath

---

## Database Setup

### 1. Create MySQL Database and User

```bash
# Login to MySQL as root
mysql -u root -p

# Create database
CREATE DATABASE helpdesk_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user with strong password
CREATE USER 'helpdesk_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON helpdesk_production.* TO 'helpdesk_user'@'localhost';

# Apply changes
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### 2. Verify Connection

```bash
mysql -u helpdesk_user -p helpdesk_production
```

---

## Backend Deployment

### 1. Upload Files to Server

```bash
# Via SCP
scp -r helpdesk_sistema/api user@your-server:/var/www/

# Or clone from Git repository
cd /var/www
git clone https://your-repo/helpdesk.git
cd helpdesk/api
```

### 2. Set Proper Permissions

```bash
cd /var/www/helpdesk/api

# Set ownership
sudo chown -R www-data:www-data storage bootstrap/cache

# Set permissions
sudo chmod -R 775 storage bootstrap/cache
```

### 3. Install Dependencies

```bash
cd /var/www/helpdesk/api

# Install Composer dependencies (production only, optimized)
composer install --no-dev --optimize-autoloader
```

### 4. Configure Environment

```bash
# Copy production environment template
cp .env.production.example .env

# Edit environment file
nano .env
```

**Critical settings to update:**
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://yourdomain.com`
- `DB_DATABASE=helpdesk_production`
- `DB_USERNAME=helpdesk_user`
- `DB_PASSWORD=your_strong_password_here`
- `FRONTEND_URL=https://yourdomain.com`
- `SANCTUM_STATEFUL_DOMAINS=yourdomain.com`

### 5. Generate Application Key

```bash
php artisan key:generate
```

### 6. Run Database Migrations

```bash
# Run migrations
php artisan migrate --force

# Optional: Seed initial data if you have seeders
php artisan db:seed --force
```

### 7. Optimize Laravel

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

### 8. Configure Web Server (Nginx)

Create Nginx configuration:

```nginx
# /etc/nginx/sites-available/helpdesk
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/helpdesk/api/public;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Increase timeout for long-running requests
    fastcgi_read_timeout 300;
    proxy_read_timeout 300;
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/helpdesk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 9. Setup Queue Worker (Optional but Recommended)

Create systemd service:

```bash
sudo nano /etc/systemd/system/helpdesk-worker.service
```

```ini
[Unit]
Description=Helpdesk Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/helpdesk/api
ExecStart=/usr/bin/php /var/www/helpdesk/api/artisan queue:work --tries=3 --timeout=300
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable helpdesk-worker
sudo systemctl start helpdesk-worker
```

---

## Frontend Deployment

### 1. Configure Environment

```bash
cd /path/to/helpdesk_sistema/app

# Copy production environment
cp .env.production .env

# Edit with your production values
nano .env
```

Update these values:
- `VITE_API_BASE_URL=https://api.yourdomain.com/api`
- `VITE_API_AUTH_URL=https://api.yourdomain.com`
- `VITE_REVERB_HOST=yourdomain.com`
- `VITE_REVERB_PORT=443`
- `VITE_REVERB_SCHEME=https`

### 2. Build for Production

```bash
# Install dependencies
npm install

# Build production bundle
npm run build
```

This creates an optimized build in the `dist/` directory.

### 3. Deploy Built Files

**Option A: Same server as API**

```bash
# Copy built files to Nginx web root
sudo cp -r dist/* /var/www/helpdesk/frontend/
```

Add frontend configuration to Nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    root /var/www/helpdesk/frontend;
    
    # SSL configuration (same as backend)
    
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass https://api.yourdomain.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Option B: CDN or Static Hosting (Vercel, Netlify, etc.)**

Upload the contents of `dist/` to your hosting provider.

---

## WebSocket Server Setup

### 1. Configure Laravel Reverb

Ensure your backend `.env` has:

```bash
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=helpdesk_key
REVERB_APP_SECRET=your_secure_secret
REVERB_HOST=yourdomain.com
REVERB_PORT=443
REVERB_SCHEME=https
```

### 2. Start Reverb Server

Create systemd service:

```bash
sudo nano /etc/systemd/system/helpdesk-reverb.service
```

```ini
[Unit]
Description=Helpdesk Reverb WebSocket Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/helpdesk/api
ExecStart=/usr/bin/php /var/www/helpdesk/api/artisan reverb:start --host=0.0.0.0 --port=8080
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable helpdesk-reverb
sudo systemctl start helpdesk-reverb
```

### 3. Configure Nginx WebSocket Proxy

Add to your Nginx configuration:

```nginx
# WebSocket proxy
location /app {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
}
```

---

## Security Checklist

- [ ] Set `APP_DEBUG=false` in production
- [ ] Use HTTPS everywhere (SSL certificate installed)
- [ ] Set `SESSION_SECURE_COOKIE=true`
- [ ] Configure firewall (UFW or iptables)
- [ ] Restrict database user permissions
- [ ] Use strong passwords for all services
- [ ] Keep server and dependencies updated
- [ ] Configure fail2ban for SSH protection
- [ ] Set proper file permissions (775 for storage, 644 for files)
- [ ] Disable directory listing in web server
- [ ] Set up CORS properly
- [ ] Use environment variables for all secrets
- [ ] Regular backups of database and files

---

## Performance Optimization

### Database Optimization

```bash
# Add indexes to frequently queried columns
php artisan db:index

# Enable query caching in MySQL
# Edit /etc/mysql/my.cnf
```

### Laravel Optimization

```bash
# Cache everything
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Use OPcache (edit php.ini)
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
```

### Nginx Optimization

Enable gzip compression and browser caching in Nginx config:

```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/json application/xml+rss;

# Browser caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Monitoring and Logging

### Application Logs

```bash
# Laravel logs location
tail -f /var/www/helpdesk/api/storage/logs/laravel.log

# Nginx access log
tail -f /var/log/nginx/access.log

# Nginx error log
tail -f /var/log/nginx/error.log
```

### Setup Log Rotation

```bash
sudo nano /etc/logrotate.d/helpdesk
```

```
/var/www/helpdesk/api/storage/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

---

## Troubleshooting

### 500 Internal Server Error

1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify file permissions: `sudo chmod -R 775 storage bootstrap/cache`
3. Clear and recache: `php artisan cache:clear && php artisan config:cache`

### Database Connection Error

1. Verify MySQL is running: `sudo systemctl status mysql`
2. Check credentials in `.env`
3. Test connection: `php artisan tinker` then `DB::connection()->getPdo();`

### WebSocket Connection Failed

1. Check Reverb is running: `sudo systemctl status helpdesk-reverb`
2. Verify firewall allows port 8080
3. Check Nginx WebSocket proxy configuration
4. Verify `REVERB_APP_KEY` matches in backend and frontend

### CORS Errors

1. Verify `FRONTEND_URL` in backend `.env`
2. Check `SANCTUM_STATEFUL_DOMAINS` includes your domain
3. Restart services: `sudo systemctl reload nginx && sudo systemctl restart php8.2-fpm`

### Performance Issues

1. Enable Laravel caching: `php artisan config:cache`
2. Check slow query log in MySQL
3. Monitor server resources: `htop`, `free -m`, `df -h`
4. Enable OPcache for PHP

### API Authentication Failing

1. Clear application cache: `php artisan cache:clear`
2. Regenerate key: `php artisan key:generate`
3. Check CORS configuration
4. Verify frontend is using correct API URL

---

## Post-Deployment

### Verify Everything Works

1. Visit your domain in browser
2. Test employee login
3. Create a test ticket
4. Verify real-time updates (WebSocket)
5. Test email notifications
6. Check error logs

### Regular Maintenance

- **Daily**: Monitor logs for errors
- **Weekly**: Review server performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Review and optimize database
- **As needed**: Database backups (recommend daily automated backups)

---

## Quick Reference Commands

```bash
# Restart all services
sudo systemctl restart nginx php8.2-fpm helpdesk-worker helpdesk-reverb

# Clear Laravel cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Rebuild Laravel cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Check service status
sudo systemctl status nginx
sudo systemctl status helpdesk-worker
sudo systemctl status helpdesk-reverb

# View logs
tail -f storage/logs/laravel.log
tail -f /var/log/nginx/error.log

# Database backup
mysqldump -u helpdesk_user -p helpdesk_production > backup_$(date +%Y%m%d).sql
```

---

## Support and Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Laravel Reverb Documentation](https://laravel.com/docs/reverb)
- [Nginx Documentation](https://nginx.org/en/docs/)

For deployment to specific platforms (AWS, DigitalOcean, Vercel, etc.), consult their respective documentation for platform-specific configurations.
