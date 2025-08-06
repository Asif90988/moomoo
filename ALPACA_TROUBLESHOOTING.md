# 🚨 ALPACA API TROUBLESHOOTING GUIDE

## **Current Issue: 403 Forbidden Error**

**Request ID for Support**: `3dfac524a3ebb0cb7b13827824dab0ac`

---

## 🔍 **IMMEDIATE CHECKS**

### **1. Verify Your API Keys**
Your current keys:
- **API Key**: `CKBWCD5IWE4PD4W9988N`
- **Secret Key**: `cBatN3D9DkXpw8uYDxDJVPDLdXELxxI9gdsVU8mo`

**Key Format Analysis**:
- Keys starting with `CK` are typically **live trading keys**
- Keys starting with `PKTEST` are **paper trading keys**
- Keys starting with `AKFZ` are also **live trading keys**

### **2. Check Your Alpaca Account Status**

**Log into your Alpaca account and verify**:
1. **Account Status**: Is your account approved and active?
2. **KYC Status**: Is your identity verification complete?
3. **Funding Status**: Is your account funded (required for some API access)?
4. **API Keys**: Are the keys you provided exactly what's shown in your dashboard?

---

## 🛠️ **TROUBLESHOOTING STEPS**

### **Step 1: Verify Account Setup**
1. Go to [alpaca.markets](https://alpaca.markets)
2. Log into your account
3. Check account status in dashboard
4. Verify all required information is complete

### **Step 2: Check API Key Generation**
1. Go to **Account Settings** → **API Keys**
2. Verify the keys match exactly what you provided
3. Check if keys are **Active** (not disabled/expired)
4. Note whether they're **Paper** or **Live** trading keys

### **Step 3: Account Verification Status**
Common reasons for 403 errors:
- ❌ **Account not fully verified** (KYC incomplete)
- ❌ **Account not approved** for trading
- ❌ **Account suspended** or restricted
- ❌ **API access not enabled**
- ❌ **Keys copied incorrectly**

### **Step 4: Generate New Keys**
If verification looks good:
1. **Delete current API keys** in your Alpaca dashboard
2. **Generate new keys**:
   - For testing: Generate **Paper Trading** keys
   - For live trading: Generate **Live Trading** keys
3. **Copy keys exactly** (no extra spaces/characters)
4. **Update your `.env.local` file**

---

## 🧪 **RECOMMENDED TESTING APPROACH**

### **1. Start with Paper Trading**
```bash
# Generate Paper Trading keys first (safer)
# Keys should start with PKTEST
NEXT_PUBLIC_ALPACA_API_KEY=PKTEST_your_paper_key
ALPACA_SECRET_KEY=your_paper_secret
NEXT_PUBLIC_ALPACA_PAPER_TRADING=true
```

### **2. Test Connection**
```bash
cd web/premium-dashboard
ALPACA_PAPER_API_KEY=PKTEST_your_key ALPACA_PAPER_SECRET_KEY=your_secret node ../../test-alpaca-connection.js
```

### **3. Only Move to Live Trading After Paper Works**
```bash
# After paper trading works, generate live keys
NEXT_PUBLIC_ALPACA_API_KEY=AKFZ_your_live_key
ALPACA_SECRET_KEY=your_live_secret
NEXT_PUBLIC_ALPACA_PAPER_TRADING=false
```

---

## 📞 **GETTING HELP**

### **Contact Alpaca Support**
- **Email**: [support@alpaca.markets](mailto:support@alpaca.markets)
- **Help Center**: [alpaca.markets/support](https://alpaca.markets/support)
- **Community**: [forum.alpaca.markets](https://forum.alpaca.markets)

### **Provide This Information**:
1. **Request ID**: `3dfac524a3ebb0cb7b13827824dab0ac`
2. **Account Email**: Your Alpaca account email
3. **Error Description**: "403 Forbidden when accessing /v2/account endpoint"
4. **API Key ID**: `CKBWCD5IWE4PD4W9988N` (safe to share)
5. **Account Status**: What you see in your dashboard

---

## 🎯 **NEXT STEPS**

### **Immediate Actions**:
1. **Log into Alpaca dashboard** and check account status
2. **Verify API keys** are correct and active
3. **Check account verification** status
4. **Generate new paper trading keys** if needed
5. **Test with paper trading first**

### **If Account Issues**:
- Complete any pending verification steps
- Fund account if required
- Contact Alpaca support with Request ID

### **If Keys Work**:
- Update `.env.local` with correct keys
- Test connection again
- Launch your trading dashboard

---

## ⚠️ **IMPORTANT REMINDERS**

- **Never share your secret key** publicly
- **Always test with paper trading first**
- **Start with small amounts** when going live
- **Monitor your account closely** during initial testing
- **Have emergency stop procedures** ready

---

**Once your keys are working, your AI trading system will be ready to go! 🚀**
