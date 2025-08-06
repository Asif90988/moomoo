# 🦙 ALPACA API INTEGRATION GUIDE
## Real Trading Setup for Multi-Broker Platform

⚠️ **IMPORTANT**: This guide covers **REAL TRADING** setup. Please read carefully and start with **Paper Trading** first.

---

## 📋 PREREQUISITES

1. **Alpaca Account**: Sign up at [alpaca.markets](https://alpaca.markets)
2. **Account Verification**: Complete KYC verification for live trading
3. **Funding**: Deposit funds for live trading (minimum $500 recommended)
4. **Paper Trading**: Test with paper trading first before going live

---

## 🔑 STEP 1: GET YOUR ALPACA API KEYS

### For Paper Trading (RECOMMENDED FIRST):
1. Go to [Alpaca Paper Trading Dashboard](https://app.alpaca.markets/paper/dashboard/overview)
2. Navigate to **"Your API Keys"** section
3. Click **"Generate New Key"**
4. **Save both keys securely**:
   - `API Key ID` (public key)
   - `Secret Key` (private key - never share this!)

### For Live Trading (AFTER TESTING):
1. Go to [Alpaca Live Trading Dashboard](https://app.alpaca.markets/live/dashboard/overview)
2. Navigate to **"Your API Keys"** section
3. Click **"Generate New Key"**
4. **Save both keys securely**

---

## 🛠️ STEP 2: CONFIGURE ENVIRONMENT VARIABLES

### Create `.env.local` file:
```bash
cd web/premium-dashboard
cp .env.local.example .env.local
```

### Edit `.env.local` with your keys:
```bash
# Alpaca Trading API Configuration
NEXT_PUBLIC_ALPACA_API_KEY=PKTEST_your_paper_key_here
ALPACA_SECRET_KEY=your_paper_secret_key_here

# Trading Mode - CRITICAL SETTING
NEXT_PUBLIC_ALPACA_PAPER_TRADING=true  # Set to 'false' for LIVE trading

# MooMoo Configuration (existing)
NEXT_PUBLIC_MOOMOO_API_URL=http://localhost:11111
NEXT_PUBLIC_MOOMOO_ENABLED=true
```

### 🚨 **TRADING MODE SETTINGS**:

**For Paper Trading (Safe Testing)**:
```bash
NEXT_PUBLIC_ALPACA_PAPER_TRADING=true
NEXT_PUBLIC_ALPACA_API_KEY=PKTEST_...  # Paper trading key starts with PKTEST
```

**For Live Trading (Real Money)**:
```bash
NEXT_PUBLIC_ALPACA_PAPER_TRADING=false
NEXT_PUBLIC_ALPACA_API_KEY=AKFZ...     # Live trading key starts with AKFZ
```

---

## 🧪 STEP 3: TEST THE CONNECTION

### Run the connection test:
```bash
cd web/premium-dashboard
npm run dev
```

### Check the Multi-Broker Dashboard:
1. Open browser to `http://localhost:3000`
2. Navigate to the Multi-Broker panel
3. Look for Alpaca status:
   - ✅ **Connected**: API keys working
   - ❌ **Disconnected**: Check your keys/configuration

### Test with curl (optional):
```bash
# Test Paper Trading API
curl -X GET https://paper-api.alpaca.markets/v2/account \
  -H "APCA-API-KEY-ID: YOUR_PAPER_KEY" \
  -H "APCA-API-SECRET-KEY: YOUR_PAPER_SECRET"

# Test Live Trading API (when ready)
curl -X GET https://api.alpaca.markets/v2/account \
  -H "APCA-API-KEY-ID: YOUR_LIVE_KEY" \
  -H "APCA-API-SECRET-KEY: YOUR_LIVE_SECRET"
```

---

## 🎯 STEP 4: CONFIGURE TRADING PARAMETERS

### Paper Trading Limits (Safe Testing):
- **Portfolio Value**: $100,000 (virtual)
- **Max Position Size**: $10,000 per trade
- **Daily Trade Limit**: 100 trades
- **Risk Level**: Medium

### Live Trading Limits (Real Money):
- **Portfolio Value**: Your actual account balance
- **Max Position Size**: 5-10% of portfolio per trade
- **Daily Trade Limit**: 25-50 trades (avoid PDT rules)
- **Risk Level**: Conservative to start

---

## 🛡️ STEP 5: SAFETY CONFIGURATIONS

### Pattern Day Trading (PDT) Protection:
```javascript
// In your Alpaca account settings:
- Enable PDT Protection: YES
- Day Trading Buying Power: Monitor closely
- Account Minimum: Keep above $25,000 for day trading
```

### Risk Management Settings:
```javascript
// Recommended settings for live trading:
const RISK_SETTINGS = {
  maxPositionSize: 0.05,        // 5% of portfolio per position
  maxDailyLoss: 0.02,          // 2% max daily loss
  maxDrawdown: 0.10,           // 10% max drawdown
  stopLossPercent: 0.03,       // 3% stop loss
  takeProfitPercent: 0.06      // 6% take profit
};
```

---

## 🚀 STEP 6: LAUNCH SEQUENCE

### Phase 1: Paper Trading (1-2 weeks)
```bash
# Set paper trading mode
NEXT_PUBLIC_ALPACA_PAPER_TRADING=true

# Start the dashboard
cd web/premium-dashboard
npm run dev
```

**Monitor for**:
- ✅ Successful connections
- ✅ Order executions
- ✅ Portfolio updates
- ✅ Risk management triggers
- ✅ AI decision accuracy

### Phase 2: Live Trading (When Ready)
```bash
# Switch to live trading mode
NEXT_PUBLIC_ALPACA_PAPER_TRADING=false

# Update API keys to live keys
NEXT_PUBLIC_ALPACA_API_KEY=AKFZ...  # Live key
ALPACA_SECRET_KEY=your_live_secret

# Restart the application
npm run dev
```

---

## 📊 STEP 7: MONITORING & VERIFICATION

### Real-Time Monitoring:
1. **Multi-Broker Dashboard**: Check broker status
2. **Portfolio Panel**: Monitor positions and P&L
3. **Orders Panel**: Track order executions
4. **AI Brain Panel**: Watch AI decision making

### Key Metrics to Watch:
- **Connection Status**: Both brokers connected
- **Order Fill Rate**: >95% successful fills
- **Slippage**: <0.1% average slippage
- **Latency**: <100ms order execution
- **P&L**: Track daily/weekly performance

### Console Logs to Monitor:
```bash
# Look for these success messages:
✅ [ALPACA] Connected to Alpaca Paper Trading
✅ [MULTI-BROKER] Alpaca broker activated
✅ [ALPACA] PAPER TRADING: Placing buy order for AAPL
✅ [ALPACA] Order placed successfully: 12345
```

---

## ⚠️ CRITICAL SAFETY REMINDERS

### Before Going Live:
- [ ] Test thoroughly with paper trading for at least 1 week
- [ ] Verify all risk management systems are working
- [ ] Confirm stop-loss and take-profit orders execute properly
- [ ] Test with small position sizes first ($100-500 per trade)
- [ ] Monitor AI decision accuracy and profitability

### Live Trading Checklist:
- [ ] Account funded with risk capital only
- [ ] PDT protection enabled (if account < $25k)
- [ ] Risk limits configured and tested
- [ ] Emergency stop procedures in place
- [ ] Regular monitoring schedule established

### Emergency Procedures:
```bash
# To immediately stop all trading:
1. Set NEXT_PUBLIC_ALPACA_PAPER_TRADING=true
2. Restart the application
3. Cancel all open orders manually in Alpaca dashboard
4. Review positions and close if necessary
```

---

## 🔧 TROUBLESHOOTING

### Common Issues:

**"API keys not configured"**:
- Check `.env.local` file exists and has correct keys
- Restart the development server
- Verify keys are not expired

**"Connection failed"**:
- Check internet connection
- Verify API keys are correct
- Check Alpaca service status

**"Orders not executing"**:
- Verify market hours (9:30 AM - 4:00 PM ET)
- Check account buying power
- Verify stock is tradeable

**"Paper trading not working"**:
- Ensure `NEXT_PUBLIC_ALPACA_PAPER_TRADING=true`
- Use paper trading API keys (PKTEST...)
- Check paper account balance

---

## 📞 SUPPORT & RESOURCES

### Alpaca Resources:
- **Documentation**: [alpaca.markets/docs](https://alpaca.markets/docs)
- **API Reference**: [alpaca.markets/docs/api-references](https://alpaca.markets/docs/api-references)
- **Support**: [alpaca.markets/support](https://alpaca.markets/support)
- **Status Page**: [status.alpaca.markets](https://status.alpaca.markets)

### Platform Support:
- **Dashboard Issues**: Check browser console for errors
- **API Integration**: Review service logs in developer tools
- **Trading Issues**: Monitor both Alpaca and MooMoo connections

---

## 🎯 NEXT STEPS

1. **Set up Paper Trading** following this guide
2. **Test for 1-2 weeks** with virtual money
3. **Monitor AI performance** and adjust parameters
4. **Gradually transition to live trading** with small amounts
5. **Scale up** as confidence and profitability increase

---

**Remember**: Start small, test thoroughly, and never risk more than you can afford to lose. The AI is powerful, but markets are unpredictable. Always maintain proper risk management! 🛡️
