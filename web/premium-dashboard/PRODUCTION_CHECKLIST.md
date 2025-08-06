# 🚀 **NEURAL CORE ALPHA-7 PRODUCTION DEPLOYMENT CHECKLIST**

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **Repository Setup**
- [ ] Create GitHub repository: `https://github.com/yourusername/neural-core-alpha7`
- [ ] Update `deploy-to-vps.sh` with correct GitHub repository URL
- [ ] Commit all changes to main branch
- [ ] Create production branch with production-specific configurations
- [ ] Tag release version: `git tag -a v1.0.0 -m "Production release v1.0.0"`

### **Environment Configuration**
- [ ] Create `.env.production` with production values
- [ ] Obtain Alpaca Paper Trading API keys
- [ ] Obtain MooMoo API credentials (if available)
- [ ] Generate secure JWT secrets using `openssl rand -hex 32`
- [ ] Verify all hardcoded localhost/127.0.0.1 references are externalized

### **Security Setup**
- [ ] Ensure `.env.production` is in `.gitignore`
- [ ] Verify no API keys are committed to repository
- [ ] Set up firewall rules for VPS
- [ ] Plan SSL certificate strategy

## 🖥️ **VPS PREPARATION CHECKLIST**

### **Access & Connectivity**
- [ ] SSH access verified: `ssh -p 2222 root@145.223.79.90`
- [ ] VPS has sufficient resources (min 2GB RAM, 20GB storage)
- [ ] Domain/IP pointing configured (if using domain)

### **System Dependencies**
- [ ] Ubuntu/CentOS updated: `apt update && apt upgrade -y`
- [ ] Node.js 18+ installed
- [ ] Docker and Docker Compose installed
- [ ] Nginx installed
- [ ] UFW firewall available
- [ ] Git installed

## 🚀 **DEPLOYMENT EXECUTION CHECKLIST**

### **Automated Deployment**
```bash
# Make deployment script executable
chmod +x deploy-to-vps.sh

# Run deployment
./deploy-to-vps.sh
```

### **Manual Verification Steps**
- [ ] SSH connection successful
- [ ] Dependencies installed correctly
- [ ] Firewall configured and enabled
- [ ] Application cloned to `/opt/neural-core-alpha7`
- [ ] Docker containers built successfully
- [ ] Nginx proxy configured
- [ ] SSL certificates in place (if applicable)

## ✅ **POST-DEPLOYMENT VERIFICATION**

### **Application Health**
- [ ] Health check responds: `curl -f http://145.223.79.90/api/health`
- [ ] Main application loads: `http://145.223.79.90`
- [ ] No console errors in browser
- [ ] WebSocket connections working

### **Trading Functionality**
- [ ] Alpaca API connection successful
- [ ] MooMoo connection tested (if available)
- [ ] Paper trading mode enabled and working
- [ ] AI trading engines can be started/stopped
- [ ] Portfolio tracking functional

### **Performance & Monitoring**
- [ ] Application startup time acceptable (<60 seconds)
- [ ] Memory usage within expected range
- [ ] Log files being created in `/opt/neural-core-alpha7/logs/`
- [ ] Container restart policies working

### **Security Verification**
- [ ] Only required ports open in firewall
- [ ] API endpoints protected with rate limiting
- [ ] No sensitive data exposed in client-side code
- [ ] Security headers present in responses
- [ ] HTTPS redirect working (if SSL configured)

## 🔧 **CONFIGURATION UPDATES**

### **API Keys Setup**
```bash
# SSH to VPS
ssh -p 2222 root@145.223.79.90

# Edit production environment
cd /opt/neural-core-alpha7
nano .env.production

# Update these values:
ALPACA_API_KEY=PKXXXXXXXXXXXXXXXX
ALPACA_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MOOMOO_API_KEY=your_actual_moomoo_key
MOOMOO_SECRET=your_actual_moomoo_secret

# Restart application
./restart.sh
```

### **Trading Configuration**
- [ ] Default portfolio value set appropriately
- [ ] Paper trading mode enabled: `NEXT_PUBLIC_PAPER_TRADING_MODE=true`
- [ ] Max trade size limits configured
- [ ] Risk levels set correctly

## 📊 **MONITORING SETUP**

### **Log Monitoring**
```bash
# View application logs
cd /opt/neural-core-alpha7
./logs.sh

# Check specific container logs
docker logs neural-core-alpha7 --tail 100
docker logs neural-nginx --tail 50
```

### **System Monitoring**
- [ ] CPU usage monitoring in place
- [ ] Memory usage monitoring
- [ ] Disk space monitoring
- [ ] Network connectivity monitoring
- [ ] Application uptime monitoring

### **Trading Monitoring**
- [ ] API rate limit monitoring
- [ ] Trade execution success/failure rates
- [ ] Portfolio value changes tracking
- [ ] AI decision accuracy monitoring

## 🚨 **TROUBLESHOOTING CHECKLIST**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check container status
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs

# Rebuild if necessary
docker-compose -f docker-compose.production.yml build --no-cache
```

#### **Can't Access Application**
```bash
# Check firewall
ufw status

# Check nginx
systemctl status nginx
nginx -t  # Test configuration

# Check port binding
netstat -tlnp | grep :80
```

#### **API Connection Issues**
```bash
# Test Alpaca API
curl -H "APCA-API-KEY-ID: YOUR_KEY" -H "APCA-API-SECRET-KEY: YOUR_SECRET" https://paper-api.alpaca.markets/v2/account

# Test MooMoo connection
telnet 145.223.79.90 11111
```

### **Emergency Procedures**

#### **Rollback Deployment**
```bash
cd /opt/neural-core-alpha7
git checkout HEAD~1  # Previous version
./restart.sh
```

#### **Complete Reset**
```bash
cd /opt/neural-core-alpha7
docker-compose -f docker-compose.production.yml down
docker system prune -a -f
git pull origin main
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

## 📞 **SUPPORT CONTACTS**

### **Emergency Contacts**
- **VPS Provider**: [Your VPS provider support]
- **Domain Provider**: [If using custom domain]
- **Alpaca Support**: https://alpaca.markets/support
- **MooMoo Support**: [MooMoo technical support]

### **Key Resources**
- **Repository**: https://github.com/yourusername/neural-core-alpha7
- **Documentation**: `/opt/neural-core-alpha7/MIGRATION_WHITEPAPER.md`
- **Logs Location**: `/opt/neural-core-alpha7/logs/`
- **Config Location**: `/opt/neural-core-alpha7/.env.production`

## 🎯 **SUCCESS CRITERIA**

### **Deployment Successful When:**
- [ ] Application accessible via browser at `http://145.223.79.90`
- [ ] Health check returns 200 status
- [ ] AI trading engines can be started and show activity
- [ ] Portfolio tracking displays correct values
- [ ] No critical errors in application logs
- [ ] System resources within acceptable limits
- [ ] API connections to Alpaca working
- [ ] Paper trading mode active and protecting real funds

### **Performance Benchmarks**
- [ ] Application loads in <5 seconds
- [ ] Health check responds in <1 second
- [ ] AI decisions generated every 5-13 seconds when active
- [ ] Memory usage <1GB under normal load
- [ ] CPU usage <50% under normal load

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Version**: v1.0.0  
**Status**: [ ] Success [ ] Partial [ ] Failed  

**Notes**: 
_____________________________________
_____________________________________
_____________________________________