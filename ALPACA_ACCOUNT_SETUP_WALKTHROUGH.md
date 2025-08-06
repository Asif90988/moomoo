# 🦙 ALPACA ACCOUNT SETUP WALKTHROUGH
## Step-by-Step Guide for Real Trading Setup

⚠️ **IMPORTANT**: This is for **REAL MONEY** trading setup. Follow carefully!

---

## 🎯 **STEP 1: CLICK THE CORRECT LINK**

From the Alpaca welcome page, click:
**"Stock trading for individuals and business accounts. Built for retail, algorithmic and proprietary traders. - Start here"**

This takes you to the individual/retail account setup.

---

## 📝 **STEP 2: ACCOUNT REGISTRATION**

You'll see a registration form. Fill out:

### **Personal Information:**
- **Full Name**: Your legal name (must match ID)
- **Email**: Use a secure email you check regularly
- **Phone**: Your mobile number for 2FA
- **Password**: Strong password (save in password manager)

### **Account Type Selection:**
- Choose: **"Individual Account"** (for personal trading)
- NOT business account unless you're trading for a company

---

## 🆔 **STEP 3: IDENTITY VERIFICATION (KYC)**

### **Required Documents:**
- **Government ID**: Driver's license or passport
- **Social Security Number**: For US tax reporting
- **Address Verification**: Bank statement or utility bill

### **Employment Information:**
- **Employment Status**: Employed/Self-employed/Retired/Student
- **Employer Name**: Your current employer
- **Annual Income**: Be honest - affects trading limits
- **Net Worth**: Estimate your total assets

### **Investment Experience:**
- **Trading Experience**: Beginner/Intermediate/Advanced
- **Investment Objectives**: Growth/Income/Speculation
- **Risk Tolerance**: Conservative/Moderate/Aggressive

---

## 💰 **STEP 4: ACCOUNT FUNDING**

### **Funding Options:**
1. **Bank Transfer (ACH)**: 3-5 business days, no fees
2. **Wire Transfer**: Same day, $25-50 fee
3. **Check Deposit**: 5-7 business days

### **Minimum Amounts:**
- **Paper Trading**: $0 (virtual money)
- **Live Trading**: No minimum, but $500+ recommended
- **Day Trading**: $25,000 minimum (PDT rule)

### **⚠️ CRITICAL: Start Small!**
- Begin with $500-1000 for testing
- Never risk money you can't afford to lose
- Test thoroughly with paper trading first

---

## 🔑 **STEP 5: GET YOUR API KEYS**

### **After Account Approval:**

1. **Log into your account**
2. **Go to**: Account Settings → API Keys
3. **Generate Paper Trading Keys FIRST**:
   - Click "Generate New Key"
   - Select "Paper Trading"
   - Save both keys securely:
     - `API Key ID` (starts with PKTEST...)
     - `Secret Key` (long random string)

### **⚠️ SECURITY CRITICAL:**
- **Never share your secret key**
- **Store keys in secure password manager**
- **Don't commit keys to code repositories**
- **Regenerate keys if compromised**

---

## 🧪 **STEP 6: TEST WITH PAPER TRADING**

### **Configure Your Environment:**
```bash
cd web/premium-dashboard
cp .env.local.example .env.local
```

### **Edit `.env.local`:**
```bash
# Alpaca Paper Trading (SAFE TESTING)
NEXT_PUBLIC_ALPACA_API_KEY=PKTEST_your_paper_key_here
ALPACA_SECRET_KEY=your_paper_secret_key_here
NEXT_PUBLIC_ALPACA_PAPER_TRADING=true

# MooMoo (existing)
NEXT_PUBLIC_MOOMOO_API_URL=http://localhost:11111
NEXT_PUBLIC_MOOMOO_ENABLED=true
```

### **Test Connection:**
```bash
# Test your paper trading setup
ALPACA_PAPER_API_KEY=PKTEST_your_key ALPACA_PAPER_SECRET_KEY=your_secret node test-alpaca-connection.js
```

### **Launch Dashboard:**
```bash
npm run dev
# Open: http://localhost:3000
```

---

## 🚨 **STEP 7: TRANSITION TO LIVE TRADING (WHEN READY)**

### **⚠️ ONLY AFTER THOROUGH PAPER TESTING:**

1. **Generate Live Trading Keys**:
   - Go to Account Settings → API Keys
   - Generate "Live Trading" keys
   - Keys will start with AKFZ...

2. **Update Environment:**
```bash
# Switch to live trading (REAL MONEY!)
NEXT_PUBLIC_ALPACA_API_KEY=AKFZ_your_live_key_here
ALPACA_SECRET_KEY=your_live_secret_key_here
NEXT_PUBLIC_ALPACA_PAPER_TRADING=false
```

3. **Start Small:**
   - Begin with $100-500 per trade
   - Monitor every trade closely
   - Have emergency stop procedures ready

---

## 🛡️ **SAFETY CHECKLIST BEFORE GOING LIVE:**

### **Paper Trading Validation:**
- [ ] Tested for at least 1 week with paper trading
- [ ] AI making profitable decisions consistently
- [ ] Risk management systems working properly
- [ ] Stop-loss orders executing correctly
- [ ] Portfolio tracking accurate
- [ ] No technical issues or bugs

### **Live Trading Preparation:**
- [ ] Account funded with risk capital only
- [ ] API keys secured and tested
- [ ] Emergency stop procedures documented
- [ ] Position size limits configured (5-10% max per trade)
- [ ] Daily loss limits set (2-3% of portfolio)
- [ ] Monitoring schedule established

### **Risk Management:**
- [ ] Never risk more than you can afford to lose
- [ ] Start with very small position sizes
- [ ] Monitor AI decisions closely
- [ ] Have manual override capabilities
- [ ] Keep detailed trading logs

---

## 🚨 **EMERGENCY PROCEDURES:**

### **If Something Goes Wrong:**
1. **Immediate Stop**: Set `NEXT_PUBLIC_ALPACA_PAPER_TRADING=true`
2. **Cancel Orders**: Log into Alpaca dashboard, cancel all open orders
3. **Review Positions**: Close any unwanted positions manually
4. **Check Logs**: Review console logs for errors
5. **Contact Support**: Alpaca support if needed

### **Emergency Contacts:**
- **Alpaca Support**: [support@alpaca.markets](mailto:support@alpaca.markets)
- **Phone**: Check your account dashboard for phone support

---

## 📞 **SUPPORT RESOURCES:**

### **Alpaca Resources:**
- **Help Center**: [alpaca.markets/support](https://alpaca.markets/support)
- **API Docs**: [alpaca.markets/docs](https://alpaca.markets/docs)
- **Community**: [forum.alpaca.markets](https://forum.alpaca.markets)
- **Status Page**: [status.alpaca.markets](https://status.alpaca.markets)

### **Your Setup Files:**
- **Setup Guide**: `ALPACA_SETUP_GUIDE.md`
- **Connection Test**: `test-alpaca-connection.js`
- **Environment Template**: `.env.local.example`

---

## 🎯 **NEXT STEPS AFTER ACCOUNT SETUP:**

1. **Complete KYC verification** (may take 1-3 business days)
2. **Fund your account** (start small!)
3. **Generate paper trading API keys**
4. **Configure your environment** with the keys
5. **Test connection** using the test script
6. **Launch your dashboard** and verify integration
7. **Test with paper trading** for 1-2 weeks minimum
8. **Gradually transition to live trading** with small amounts

---

## ⚠️ **FINAL REMINDERS:**

- **Start with paper trading** - no exceptions!
- **Test thoroughly** before risking real money
- **Start small** when you go live
- **Monitor closely** - AI is powerful but markets are unpredictable
- **Have exit strategies** ready at all times
- **Never risk more than you can afford to lose**

**Good luck with your autonomous trading system! 🚀**

---

*Remember: The AI is a tool to assist your trading, but you are ultimately responsible for all trading decisions and their outcomes.*
