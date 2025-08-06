# 🚀 **NEURAL CORE ALPHA-7 MIGRATION WHITE PAPER**
## Production Deployment Guide for VPS (145.223.79.90:2222)

---

## 📋 **EXECUTIVE SUMMARY**

This comprehensive white paper outlines the complete migration strategy for deploying the Neural Core Alpha-7 multi-broker autonomous trading platform from local development to production VPS environment. The migration involves environment configuration, security hardening, API key management, and production optimization.

**Target Environment**: Ubuntu/CentOS VPS at `145.223.79.90:2222`  
**Migration Method**: GitHub Repository → VPS Deployment  
**Deployment Strategy**: Docker containerization with reverse proxy  

---

## 🔍 **CRITICAL HARDCODED VALUES AUDIT**

### **1. Network Configuration**
```bash
# Files requiring network changes:
src/services/moomoo-tcp.ts:26          → host: '127.0.0.1' 
src/services/moomoo-tcp.ts:27          → port: 11111
src/services/moomoo-websocket.ts:15    → host: '127.0.0.1'
src/services/moomoo-websocket.ts:16    → port: 11111
src/services/websocket.ts:20           → 'ws://localhost:3001'
```

### **2. Application URLs**
```bash
# Production URLs need to be updated:
.env.example → NEXT_PUBLIC_APP_URL=http://localhost:3000
.env.example → NEXTAUTH_URL=http://localhost:3000
.env.example → NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### **3. Port Configurations**
```bash
# Default ports across the application:
- Next.js Application: 3000
- AI Engine WebSocket: 3001
- MooMoo OpenD: 11111
- Health Checks: Various
```

---

## 🔧 **ENVIRONMENT CONFIGURATION MATRIX**

### **Development vs Production Environment Variables**

| Variable | Development | Production VPS |
|----------|-------------|----------------|
| `NODE_ENV` | `development` | `production` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://145.223.79.90` |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://145.223.79.90` |
| `MOOMOO_HOST` | `127.0.0.1` | `145.223.79.90` |
| `ALPACA_BASE_URL` | `https://paper-api.alpaca.markets` | `https://paper-api.alpaca.markets` |
| `PORT` | `3000` | `3000` |
| `SSL_ENABLED` | `false` | `true` |

---

## 🛡️ **SECURITY HARDENING REQUIREMENTS**

### **1. Environment Variables Security**
```bash
# Generate secure secrets on VPS:
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For SESSION_SECRET
openssl rand -hex 32  # For ENCRYPTION_KEY
```

### **2. API Key Management**
```env
# Production API Keys (NEVER commit to git):
ALPACA_API_KEY=PKXXXXXXXXXXXXXXXX
ALPACA_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MOOMOO_API_KEY=your_production_moomoo_key
MOOMOO_SECRET=your_production_moomoo_secret
```

### **3. Network Security**
```bash
# Firewall configuration:
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw allow 2222/tcp   # Custom SSH
ufw enable
```

---

## 📦 **MIGRATION METHODOLOGY**

### **Phase 1: Repository Preparation**

#### **1.1 Create Production Configuration Files**

```bash
# Create production environment file
cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://145.223.79.90
PORT=3000
NEXT_PUBLIC_PAPER_TRADING_MODE=true
NEXT_PUBLIC_DEFAULT_PORTFOLIO_VALUE=300.00

# API Configuration (REPLACE WITH ACTUAL VALUES)
ALPACA_API_KEY=PKXXXXXXXXXXXXXXXX
ALPACA_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MOOMOO_HOST=145.223.79.90
MOOMOO_PORT=11111

# Security (GENERATE ON VPS)
JWT_SECRET=GENERATE_ON_VPS_WITH_OPENSSL
SESSION_SECRET=GENERATE_ON_VPS_WITH_OPENSSL
ENCRYPTION_KEY=GENERATE_ON_VPS_WITH_OPENSSL
EOF
```

#### **1.2 Update .gitignore**
```bash
echo "
# Production Environment
.env.production
.env.local
*.pem
*.key
deploy-logs/
" >> .gitignore
```

#### **1.3 Create Production Dockerfile**
```dockerfile
# Dockerfile.production
FROM node:18-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

CMD ["node", "server.js"]
```

### **Phase 2: Code Modifications for Production**

#### **2.1 Fix Hardcoded Network Values**

**File: `src/services/moomoo-tcp.ts`**
```typescript
// Before:
private host: string = '127.0.0.1';
private port: number = 11111;

// After:
private host: string = process.env.MOOMOO_HOST || '127.0.0.1';
private port: number = parseInt(process.env.MOOMOO_PORT || '11111');
```

**File: `src/services/websocket.ts`**
```typescript
// Before:
constructor(private url: string = 'ws://localhost:3001') {

// After:
constructor(private url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001') {
```

#### **2.2 Create Production Configuration Service**

**File: `src/lib/production-config.ts`**
```typescript
export const ProductionConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  apiUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  moomooHost: process.env.MOOMOO_HOST || '127.0.0.1',
  moomooPort: parseInt(process.env.MOOMOO_PORT || '11111'),
  paperTradingMode: process.env.NEXT_PUBLIC_PAPER_TRADING_MODE === 'true',
  maxTradeSize: parseFloat(process.env.NEXT_PUBLIC_MAX_TRADE_SIZE_PERCENT || '25'),
};
```

### **Phase 3: GitHub Repository Setup**

#### **3.1 Initialize Git Repository**
```bash
cd /Users/asif/Desktop/moomoo/autonomous_trading_system/web/premium-dashboard

# Initialize if not already done
git init

# Add all files
git add .

# Commit current state
git commit -m "Initial commit: Neural Core Alpha-7 multi-broker trading platform"

# Add remote repository
git remote add origin https://github.com/yourusername/neural-core-alpha7.git

# Push to GitHub
git push -u origin main
```

#### **3.2 Create Production Branch**
```bash
# Create production branch
git checkout -b production

# Add production-specific files
git add .env.production.example
git add Dockerfile.production
git add docker-compose.production.yml

# Commit production configuration
git commit -m "Add production deployment configuration"

# Push production branch
git push -u origin production
```

---

## 🖥️ **VPS INSTALLATION & SETUP**

### **Phase 4: VPS Environment Preparation**

#### **4.1 Connect to VPS**
```bash
ssh -p 2222 root@145.223.79.90
```

#### **4.2 System Updates & Dependencies**
```bash
# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create deployment directory
mkdir -p /opt/neural-core-alpha7
cd /opt/neural-core-alpha7
```

#### **4.3 Clone Repository**
```bash
# Clone from GitHub
git clone https://github.com/yourusername/neural-core-alpha7.git .

# Switch to production branch
git checkout production

# Set permissions
chown -R www-data:www-data /opt/neural-core-alpha7
chmod -R 755 /opt/neural-core-alpha7
```

### **Phase 5: Production Configuration**

#### **5.1 Create Production Environment File**
```bash
# Generate secure secrets
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# Create production environment
cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://145.223.79.90
NEXTAUTH_URL=https://145.223.79.90
PORT=3000

# Trading Configuration
NEXT_PUBLIC_PAPER_TRADING_MODE=true
NEXT_PUBLIC_DEFAULT_PORTFOLIO_VALUE=300.00
NEXT_PUBLIC_MAX_TRADE_SIZE_PERCENT=25

# API Configuration
ALPACA_API_KEY=YOUR_ALPACA_PAPER_KEY_HERE
ALPACA_SECRET_KEY=YOUR_ALPACA_PAPER_SECRET_HERE
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# MooMoo Configuration
MOOMOO_HOST=145.223.79.90
MOOMOO_PORT=11111
MOOMOO_API_KEY=YOUR_MOOMOO_KEY_HERE
MOOMOO_SECRET=YOUR_MOOMOO_SECRET_HERE

# Security
JWT_SECRET=$JWT_SECRET
SESSION_SECRET=$SESSION_SECRET
ENCRYPTION_KEY=$ENCRYPTION_KEY

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=wss://145.223.79.90/ws

# Monitoring
LOG_LEVEL=info
HEALTH_CHECK_ENABLED=true
EOF

# Secure the environment file
chmod 600 .env.production
```

#### **5.2 Create Docker Compose Configuration**
```yaml
# docker-compose.production.yml
version: '3.8'

services:
  neural-core-app:
    build:
      context: .
      dockerfile: Dockerfile.production
    container_name: neural-core-alpha7
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
    networks:
      - neural-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  nginx:
    image: nginx:alpine
    container_name: neural-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - neural-core-app
    networks:
      - neural-network

networks:
  neural-network:
    driver: bridge
```

#### **5.3 Create Nginx Configuration**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream neural_app {
        server neural-core-app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;
        server_name 145.223.79.90;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name 145.223.79.90;

        # SSL Configuration (to be updated with actual certificates)
        ssl_certificate /etc/letsencrypt/live/145.223.79.90/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/145.223.79.90/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://neural_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket support
        location /ws {
            proxy_pass http://neural_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Main application
        location / {
            proxy_pass http://neural_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### **Phase 6: Deployment Execution**

#### **6.1 Build and Deploy**
```bash
# Build the application
docker-compose -f docker-compose.production.yml build

# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

#### **6.2 SSL Certificate Setup**
```bash
# Obtain SSL certificate (if using domain)
certbot --nginx -d your-domain.com

# For IP-based deployment, create self-signed certificate
mkdir -p /opt/neural-core-alpha7/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /opt/neural-core-alpha7/ssl/nginx-selfsigned.key \
    -out /opt/neural-core-alpha7/ssl/nginx-selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=145.223.79.90"
```

#### **6.3 Firewall Configuration**
```bash
# Configure UFW firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 2222/tcp  # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 11111/tcp # MooMoo OpenD
ufw enable
```

---

## 📊 **MONITORING & MAINTENANCE**

### **Phase 7: Production Monitoring**

#### **7.1 Health Check Endpoints**
```bash
# Test application health
curl -f https://145.223.79.90/api/health

# Test API endpoints
curl -f https://145.223.79.90/api/alpaca/portfolio
curl -f https://145.223.79.90/api/moomoo/connection
```

#### **7.2 Log Management**
```bash
# Create log rotation
cat > /etc/logrotate.d/neural-core << 'EOF'
/opt/neural-core-alpha7/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        docker-compose -f /opt/neural-core-alpha7/docker-compose.production.yml restart neural-core-app
    endscript
}
EOF
```

#### **7.3 Backup Strategy**
```bash
# Create backup script
cat > /opt/neural-core-alpha7/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/neural-core"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup environment and configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
    .env.production \
    docker-compose.production.yml \
    nginx.conf

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz logs/

# Keep only last 7 backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/neural-core-alpha7/backup.sh

# Add to cron
echo "0 2 * * * /opt/neural-core-alpha7/backup.sh" | crontab -
```

---

## 🔄 **ROLLBACK STRATEGY**

### **Phase 8: Disaster Recovery**

#### **8.1 Rollback Preparation**
```bash
# Create rollback script
cat > /opt/neural-core-alpha7/rollback.sh << 'EOF'
#!/bin/bash
set -e

echo "🔄 Starting Neural Core Alpha-7 rollback..."

# Stop current services
docker-compose -f docker-compose.production.yml down

# Switch to previous version
git checkout HEAD~1

# Restore previous environment
cp .env.production.backup .env.production

# Rebuild and restart
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

echo "✅ Rollback completed successfully"
EOF

chmod +x /opt/neural-core-alpha7/rollback.sh
```

#### **8.2 Version Management**
```bash
# Tag current version before deployment
git tag -a v1.0.0 -m "Production deployment v1.0.0"
git push origin v1.0.0

# Create version backup
cp .env.production .env.production.backup
```

---

## ✅ **DEPLOYMENT CHECKLIST**

### **Pre-Deployment Verification**
- [ ] All hardcoded localhost/127.0.0.1 references updated
- [ ] Environment variables configured for production
- [ ] API keys obtained and secured
- [ ] SSL certificates prepared
- [ ] Firewall rules configured
- [ ] Docker and Docker Compose installed
- [ ] Nginx configuration tested

### **Post-Deployment Verification**
- [ ] Application accessible via HTTPS
- [ ] Health check endpoints responding
- [ ] Trading APIs connecting successfully
- [ ] WebSocket connections working
- [ ] Log files being created
- [ ] Backup system operational
- [ ] Monitoring alerts configured

### **Security Verification**
- [ ] No sensitive data in logs
- [ ] API keys not exposed in client-side code
- [ ] HTTPS redirect working
- [ ] Security headers present
- [ ] Rate limiting functional
- [ ] Firewall rules active

---

## 🚨 **CRITICAL PRODUCTION NOTES**

### **API Key Management**
1. **NEVER** commit actual API keys to GitHub
2. Use VPS environment variables for sensitive data
3. Rotate API keys regularly
4. Monitor API usage and limits

### **MooMoo OpenD Requirements**
```bash
# Ensure MooMoo OpenD is running on VPS
# Update connection settings in production:
MOOMOO_HOST=145.223.79.90  # VPS IP instead of localhost
MOOMOO_PORT=11111          # Default port
```

### **Paper Trading Safety**
```env
# ALWAYS enable paper trading in production initially
NEXT_PUBLIC_PAPER_TRADING_MODE=true
```

### **Performance Optimization**
```bash
# Enable production optimizations
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Use PM2 for process management (alternative to Docker)
npm install -g pm2
pm2 start ecosystem.config.js --env production
```

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **Connection Issues**
```bash
# Test network connectivity
telnet 145.223.79.90 11111  # MooMoo OpenD
curl -I https://paper-api.alpaca.markets  # Alpaca API
```

#### **Container Issues**
```bash
# Debug container
docker exec -it neural-core-alpha7 /bin/sh
docker logs neural-core-alpha7 --tail 100
```

#### **SSL Issues**
```bash
# Test SSL certificate
openssl s_client -connect 145.223.79.90:443
```

### **Emergency Contacts**
- **Repository**: https://github.com/yourusername/neural-core-alpha7
- **VPS Provider**: [Your VPS Provider Support]
- **API Support**: Alpaca Markets, MooMoo Technical Support

---

## 🎯 **CONCLUSION**

This white paper provides a comprehensive migration strategy for deploying Neural Core Alpha-7 to production. The key success factors are:

1. **Thorough environment configuration** - All hardcoded values properly externalized
2. **Security-first approach** - API keys secured, HTTPS enabled, firewall configured  
3. **Monitoring and maintenance** - Health checks, logging, and backup systems in place
4. **Rollback capability** - Quick recovery options available

Following this guide ensures a secure, scalable, and maintainable production deployment of your autonomous trading platform.

---

**Document Version**: 1.0  
**Last Updated**: $(date)  
**Author**: Claude (AI Assistant)  
**Review Status**: Ready for Implementation