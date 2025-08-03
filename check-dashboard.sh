#!/bin/bash

echo "🚀 Neural Core AI Trading Dashboard Status Check"
echo "=============================================="

# Check if Next.js process is running
if pgrep -f "next dev" > /dev/null; then
    echo "✅ Next.js development server is running"
else
    echo "❌ Next.js development server is not running"
    echo "Starting the server..."
    cd /Users/asif/Desktop/moomoo/autonomous_trading_system/web/premium-dashboard
    npm run dev &
    echo "🔄 Server starting... wait a moment"
    sleep 3
fi

echo ""
echo "📊 Dashboard Information:"
echo "   URL: http://localhost:3000"
echo "   Status: Ready"
echo "   Features:"
echo "   - 🧠 AI Thought Stream (Real-time transparency)"
echo "   - 🏆 Trust & Truth Metrics"
echo "   - 📊 Honest Performance Tracking"
echo "   - 💰 $300 Deposit Limit System"
echo "   - 📈 Educational Trading Interface"
echo ""
echo "🔧 Development Mode: Mock data enabled for testing"
echo "💡 Try accessing: http://localhost:3000"
echo ""
echo "Keyboard shortcuts:"
echo "   Ctrl+1: Trading Panel"
echo "   Ctrl+2: Portfolio"
echo "   Ctrl+3: AI Brain Process"
echo "   Ctrl+4: Analytics"

# Test if port 3000 is responding
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Dashboard is accessible at http://localhost:3000"
else
    echo "⚠️  Dashboard may still be starting up - check http://localhost:3000 in a moment"
fi