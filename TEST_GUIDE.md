# 🚀 Autonomous Trading System - Testing Guide

## How to Access and Test the Application

### 📁 System Location
Your autonomous trading system is located at:
```
/Users/asif/Desktop/moomoo/autonomous_trading_system/
```

### 🔧 Prerequisites
1. **Rust Environment**: Make sure Rust is installed and sourced
2. **OpenD Running**: Your moomoo OpenD should be running on `127.0.0.1:11111`
3. **Account**: Your account `71456526` should be authenticated

## 🎯 Testing Methods

### Method 1: Direct Cargo Run (Recommended)
```bash
cd /Users/asif/Desktop/moomoo/autonomous_trading_system
source "$HOME/.cargo/env"
cargo run
```

### Method 2: With Environment Variables
```bash
cd /Users/asif/Desktop/moomoo/autonomous_trading_system
source "$HOME/.cargo/env"
MOOMOO_API_KEY="live_connection_71456526" cargo run
```

### Method 3: Build and Run Binary
```bash
cd /Users/asif/Desktop/moomoo/autonomous_trading_system
source "$HOME/.cargo/env"
cargo build --release
./target/release/trading_agent
```

### Method 4: Test Mode (Safe Testing)
```bash
cd /Users/asif/Desktop/moomoo/autonomous_trading_system
source "$HOME/.cargo/env"
PAPER_TRADING=true MOOMOO_API_KEY="test_mode" cargo run
```

## 📊 What You'll See When Running

### Successful Startup Sequence:
```
🚀 Starting Autonomous AI Trading Platform
📊 Target: 25% daily returns with microsecond execution
🦀 Powered by Rust for maximum performance
📁 Loading configuration from config.toml...
⚙️  Configuration loaded successfully
🔑 API Key: SET
📄 Paper Trading: false
🤖 Trading system initialized
🎯 All agents started - system is operational
```

### Agent Activity:
```
[INFO] Master Coordinator: Strategic planning initiated
[INFO] Market Intelligence: Analyzing market conditions
[INFO] Risk Management: Portfolio monitoring active
[INFO] Execution Engine: Order routing optimized
[INFO] Learning Engine: Model training in progress
```

## 🔍 System Components You Can Test

### 1. Configuration System
- **File**: `config.toml`
- **Test**: Modify trading parameters and restart
- **Location**: `/Users/asif/Desktop/moomoo/autonomous_trading_system/config.toml`

### 2. Agent System
- **Master Coordinator**: Strategic decision making
- **Market Intelligence**: Real-time market analysis
- **Risk Management**: Portfolio risk monitoring
- **Execution Engine**: Trade execution
- **Learning Engine**: AI model training

### 3. API Integration
- **OpenD Connection**: Connects to your live OpenD at `127.0.0.1:11111`
- **Account**: Uses your authenticated account `71456526`
- **Market Data**: Real-time HK market data access

### 4. Monitoring System
- **Metrics**: Prometheus metrics on port `9090`
- **Logs**: Structured logging with tracing
- **Performance**: Real-time performance analytics

## 🛠️ Troubleshooting

### Issue: "Moomoo API key is required"
**Solution 1**: Set environment variable
```bash
export MOOMOO_API_KEY="live_connection_71456526"
cargo run
```

**Solution 2**: Edit config.toml directly
```toml
[api.moomoo]
api_key = "live_connection_71456526"
```

### Issue: "cargo: command not found"
**Solution**: Source Rust environment
```bash
source "$HOME/.cargo/env"
```

### Issue: OpenD connection failed
**Solution**: Ensure OpenD is running
```bash
# Check if OpenD is running
lsof -i :11111
```

## 📈 Testing Scenarios

### 1. Configuration Test
```bash
# Test different capital amounts
INITIAL_CAPITAL=1000 cargo run
```

### 2. Paper Trading Test
```bash
# Safe testing mode
PAPER_TRADING=true cargo run
```

### 3. Risk Management Test
```bash
# Test with conservative settings
# Edit config.toml: max_daily_loss = 1.0
cargo run
```

### 4. Agent Performance Test
```bash
# Monitor agent activity
cargo run | grep -E "(Coordinator|Intelligence|Risk|Execution|Learning)"
```

## 🔧 Advanced Testing

### 1. Build Optimized Version
```bash
cargo build --release
time ./target/release/trading_agent
```

### 2. Run with Detailed Logging
```bash
RUST_LOG=debug cargo run
```

### 3. Performance Profiling
```bash
cargo build --release
perf record ./target/release/trading_agent
```

### 4. Memory Usage Monitoring
```bash
cargo run &
PID=$!
top -p $PID
```

## 📊 Monitoring Endpoints

Once running, you can access:

### 1. Prometheus Metrics
```
http://localhost:9090/metrics
```

### 2. System Health
```bash
curl http://localhost:9090/health
```

### 3. Agent Status
```bash
curl http://localhost:9090/agents/status
```

## 🎯 Expected Performance

### Startup Time
- **Cold Start**: ~2-3 seconds
- **Warm Start**: ~1-2 seconds

### Memory Usage
- **Initial**: ~50-100 MB
- **Running**: ~100-200 MB

### CPU Usage
- **Idle**: ~1-5%
- **Active Trading**: ~10-30%

### Latency
- **Order Execution**: <1ms target
- **Market Data**: <100ms
- **Risk Calculations**: <50ms

## 🚨 Safety Features

### 1. Circuit Breakers
- Automatic trading halt on excessive losses
- Emergency stop mechanisms

### 2. Risk Controls
- Position size limits
- Daily loss limits
- Portfolio heat monitoring

### 3. Monitoring
- Real-time performance tracking
- Alert system for critical events
- Comprehensive logging

## 📝 Next Steps

1. **Start with Paper Trading**: Test safely first
2. **Monitor Performance**: Watch the logs and metrics
3. **Adjust Configuration**: Tune parameters as needed
4. **Scale Gradually**: Increase capital slowly
5. **Monitor Risk**: Always watch risk metrics

## 🆘 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify OpenD is running and accessible
3. Ensure your account has proper permissions
4. Test with paper trading mode first

The system is designed to be robust and self-monitoring, but always start with small amounts and paper trading for safety.
