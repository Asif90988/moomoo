# ⚡ **QUICK MIGRATION GUIDE - Neural Core Alpha-7**
## 5-Minute VPS Deployment Summary

---

## 🚀 **IMMEDIATE ACTION STEPS**

### **1. Update Repository URL (2 minutes)**
```bash
# Edit the deployment script
nano deploy-to-vps.sh

# Change line 13:
GITHUB_REPO="https://github.com/YOUR_USERNAME/neural-core-alpha7.git"
```

### **2. Push to GitHub (1 minute)**
```bash
git add .
git commit -m "Production deployment ready"
git remote add origin https://github.com/YOUR_USERNAME/neural-core-alpha7.git
git push -u origin main
```

### **3. Deploy to VPS (2 minutes)**
```bash
# Make executable and run
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

---

## 🔑 **CRITICAL FILES CREATED**

| File | Purpose | Status |
|------|---------|---------|
| `MIGRATION_WHITEPAPER.md` | Complete migration guide | ✅ Created |
| `deploy-to-vps.sh` | Automated deployment script | ✅ Created |
| `Dockerfile.production` | Production container config | ✅ Exists |
| `docker-compose.production.yml` | Production orchestration | ✅ Exists |
| `.env.production.example` | Environment template | ✅ Created |
| `PRODUCTION_CHECKLIST.md` | Deployment verification | ✅ Created |
| `src/app/api/health/route.ts` | Health check endpoint | ✅ Created |

---

## ⚙️ **ENVIRONMENT VARIABLES TO UPDATE**

After deployment, SSH to VPS and update these in `.env.production`:

```bash
# SSH to VPS
ssh -p 2222 root@145.223.79.90

# Edit environment
cd /opt/neural-core-alpha7
nano .env.production

# UPDATE THESE VALUES:
ALPACA_API_KEY=PKXXXXXXXXXXXXXXXX                    # Your Alpaca paper key
ALPACA_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX   # Your Alpaca paper secret
MOOMOO_API_KEY=your_actual_moomoo_key               # Your MooMoo key
MOOMOO_SECRET=your_actual_moomoo_secret             # Your MooMoo secret

# Restart application
./restart.sh
```

---

## 🌐 **HARDCODED VALUES FIXED**

✅ **Network Configuration**
- `127.0.0.1` → `process.env.MOOMOO_HOST`
- `localhost:3001` → `process.env.NEXT_PUBLIC_WS_URL`
- Port configurations externalized

✅ **URL References**  
- Development URLs → Production environment variables
- API endpoints → Configurable base URLs

✅ **Application Settings**
- Paper trading mode controlled by environment
- Portfolio values configurable
- Risk levels externalized

---

## 📱 **POST-DEPLOYMENT ACCESS**

### **Application URLs**
- **Main App**: `http://145.223.79.90`
- **Health Check**: `http://145.223.79.90/api/health` 
- **API Base**: `http://145.223.79.90/api/`

### **Management Commands**
```bash
cd /opt/neural-core-alpha7

./start.sh      # Start application
./stop.sh       # Stop application  
./restart.sh    # Restart application
./logs.sh       # View logs
./update.sh     # Update from GitHub
```

---

## 🔍 **VERIFICATION CHECKLIST**

**Quick Tests** (30 seconds each):
- [ ] `curl -f http://145.223.79.90/api/health` returns 200
- [ ] Main page loads without errors
- [ ] AI trading buttons are functional
- [ ] Portfolio displays correctly
- [ ] No console errors in browser

---

## 🚨 **EMERGENCY FIXES**

### **If Application Won't Start**
```bash
cd /opt/neural-core-alpha7
docker-compose -f docker-compose.production.yml logs
docker-compose -f docker-compose.production.yml restart
```

### **If Can't Access via Browser**
```bash
# Check firewall
ufw status

# Restart nginx
docker restart neural-nginx
```

### **If API Keys Not Working**
```bash
# Test Alpaca connection
curl -H "APCA-API-KEY-ID: YOUR_KEY" https://paper-api.alpaca.markets/v2/account
```

---

## 📞 **IMMEDIATE SUPPORT**

### **Deployment Issues**
1. Check `/opt/neural-core-alpha7/logs/` for errors
2. Verify `.env.production` has correct values
3. Ensure GitHub repository URL is correct in `deploy-to-vps.sh`

### **Trading Issues**
1. Confirm paper trading mode: `NEXT_PUBLIC_PAPER_TRADING_MODE=true`
2. Verify API keys are valid and have paper trading permissions
3. Check MooMoo OpenD is running on port 11111

---

## ✨ **SUCCESS INDICATORS**

**🎉 Deployment Successful When:**
- Health check responds with status 200
- Application loads at `http://145.223.79.90`
- AI trading engines show "STANDBY" state
- Portfolio displays $300 baseline
- No critical errors in logs

**🚀 Ready for Trading When:**
- Alpaca API connection successful
- Portfolio tracking active
- AI decision generation working
- Trade execution simulation functional

---

**Total Migration Time**: ~5 minutes  
**Downtime**: None (new deployment)  
**Rollback Time**: ~2 minutes if needed

**🎯 Result**: Production-ready autonomous trading platform accessible at `http://145.223.79.90`