# 🚀 Production Deployment Guide

## Email Verification Fix - Production Setup

### Issue Resolution Summary
- **Problem**: Approval emails contained `localhost:5004` URLs that don't work outside local machine
- **Solution**: Unified API server that consolidates all services under one public endpoint
- **Result**: Email links like `https://your-domain.com/auth/approve/123` work globally

## Quick Start (Development)

### 1. Install Dependencies
```powershell
# Install unified server dependencies
npm install express http-proxy-middleware axios

# Or copy provided package file
cp unified-package.json package.json
npm install
```

### 2. Configure Environment Variables
```powershell
# Create auth service .env file
cp "backend\Organizer_Dashboard-main\backend-new\services\auth-service\.env.example" "backend\Organizer_Dashboard-main\backend-new\services\auth-service\.env"

# Edit the .env file:
# BASE_URL=http://localhost:8080
# CORS_ORIGIN=http://localhost:8080
# ... other settings
```

### 3. Start All Services
```powershell
# Option 1: Use PowerShell script
.\start-all-services.ps1

# Option 2: Manual start
# Terminal 1: Auth Service
cd "backend\Organizer_Dashboard-main\backend-new\services\auth-service"
npm start

# Terminal 2: Other services...
# Terminal 7: Unified Server
node unified-server.js
```

### 4. Test the Setup
```powershell
# Run test script
node test-email-verification.js

# Or manually test
# Visit: http://localhost:8080/health
```

## Production Deployment

### 1. Server Setup
```bash
# On your production server
git clone your-repo
cd your-repo

# Install dependencies
npm install
cd backend/Organizer_Dashboard-main/backend-new/services/auth-service
npm install
# ... install for other services

# Install PM2 for process management
npm install -g pm2
```

### 2. Environment Configuration
```bash
# Create production .env for auth service
nano backend/Organizer_Dashboard-main/backend-new/services/auth-service/.env

# Set production values:
BASE_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret
DB_HOST=your-production-db-host
ADMIN_EMAIL=your-production-admin@email.com
# ... other production settings
```

### 3. SSL/HTTPS Setup
```bash
# Option 1: Using Nginx (Recommended)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/your-domain.com

# Nginx config:
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site and get SSL
sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Process Management with PM2
```bash
# Create ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'unified-server',
      script: 'unified-server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      }
    },
    {
      name: 'auth-service',
      script: 'backend/Organizer_Dashboard-main/backend-new/services/auth-service/src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    // Add other services...
  ]
};

# Start all services
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Database Setup
```bash
# Ensure PostgreSQL is running and configured
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create production database and user
sudo -u postgres psql
CREATE DATABASE peraverse_prod;
CREATE USER prod_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE peraverse_prod TO prod_user;
\q
```

### 6. Firewall Configuration
```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw --force enable

# Block direct access to service ports (optional security)
# Services only accessible through unified server
```

## Frontend Integration

Update your frontend configuration:

```javascript
// config/api.js
const config = {
  development: {
    API_BASE: 'http://localhost:8080',
    AUTH_API: 'http://localhost:8080/auth',
    EVENTS_API: 'http://localhost:8080/events-api',
    // ... other APIs
  },
  production: {
    API_BASE: 'https://your-domain.com',
    AUTH_API: 'https://your-domain.com/auth',
    EVENTS_API: 'https://your-domain.com/events-api',
    // ... other APIs
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

## Monitoring & Maintenance

### Health Checks
```bash
# Check if all services are running
pm2 status

# Monitor logs
pm2 logs

# Health check endpoint
curl https://your-domain.com/health
```

### Backup Strategy
```bash
# Database backup
pg_dump -h localhost -U prod_user peraverse_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Code backup
git push origin main
```

### Updates
```bash
# Update code
git pull origin main

# Restart services
pm2 restart all

# Or restart specific service
pm2 restart unified-server
```

## Troubleshooting

### Common Issues

1. **Email links still not working**
   - Check `BASE_URL` in auth service .env
   - Ensure it matches your production domain
   - Restart auth service after changes

2. **502 Bad Gateway**
   - Check if all backend services are running
   - Verify port configurations in unified-server.js
   - Check PM2 status

3. **CORS Errors**
   - Update `CORS_ORIGIN` in all services
   - Ensure frontend domain is whitelisted

4. **Database Connection Issues**
   - Check database credentials in .env
   - Ensure PostgreSQL is running
   - Test connection manually

### Logs and Debugging
```bash
# PM2 logs
pm2 logs unified-server --lines 100
pm2 logs auth-service --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## Security Checklist

- [ ] JWT secrets are secure and different in production
- [ ] Database credentials are secure
- [ ] CORS origins are restricted to your domain
- [ ] SSL/HTTPS is properly configured
- [ ] Direct service ports are not exposed
- [ ] Regular backups are scheduled
- [ ] Log monitoring is in place
- [ ] Security updates are applied

## Performance Optimization

1. **Enable Gzip compression in Nginx**
2. **Set up Redis for session management** (if needed)
3. **Configure PM2 clustering** for high traffic
4. **Set up CDN** for static assets
5. **Database indexing** for frequently queried fields

Your email verification system is now production-ready! 🎉