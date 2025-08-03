'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { useTradingStore, useSelectedSymbol, useChartData } from '@/stores/trading-store';
import { TrendingUp, BarChart3, Zap, Settings } from 'lucide-react';

export function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  
  const selectedSymbol = useSelectedSymbol();
  const chartData = useChartData();
  const { selectedTimeframe, setSelectedTimeframe } = useTradingStore();
  
  const [isLoading, setIsLoading] = useState(true);

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#d1d5db',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: 'rgba(59, 130, 246, 0.1)' },
        horzLines: { color: 'rgba(59, 130, 246, 0.1)' },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
        vertLine: {
          color: 'rgba(0, 212, 255, 0.5)',
          width: 1,
          style: 2, // LineStyle.Dashed
        },
        horzLine: {
          color: 'rgba(0, 212, 255, 0.5)',
          width: 1,
          style: 2, // LineStyle.Dashed
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(59, 130, 246, 0.3)',
        textColor: '#d1d5db',
      },
      timeScale: {
        borderColor: 'rgba(59, 130, 246, 0.3)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#00ff88',
      wickDownColor: '#ef4444',
      wickUpColor: '#00ff88',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: 'rgba(59, 130, 246, 0.5)',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Generate initial data if no real data available
    if (!chartData) {
      const data = generateSampleData();
      candlestickSeries.setData(data.candles);
      volumeSeries.setData(data.volume);
      setIsLoading(false);
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data when chartData changes
  useEffect(() => {
    if (chartData && candlestickSeriesRef.current && volumeSeriesRef.current) {
      const candles: CandlestickData[] = chartData.data.map(item => ({
        time: item.timestamp as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      const volume = chartData.data.map(item => ({
        time: item.timestamp as Time,
        value: item.volume,
        color: item.close >= item.open ? 'rgba(0, 255, 136, 0.5)' : 'rgba(239, 68, 68, 0.5)',
      }));

      candlestickSeriesRef.current.setData(candles);
      volumeSeriesRef.current.setData(volume);
      setIsLoading(false);
    }
  }, [chartData]);

  const generateSampleData = () => {
    const candles: CandlestickData[] = [];
    const volume = [];
    let basePrice = 189.47;
    const now = Math.floor(Date.now() / 1000);

    for (let i = 100; i >= 0; i--) {
      const time = (now - i * 3600) as Time; // 1 hour intervals
      const open = basePrice + (Math.random() - 0.5) * 8;
      const volatility = Math.random() * 6;
      const high = open + Math.random() * volatility;
      const low = open - Math.random() * volatility;
      const close = low + Math.random() * (high - low);
      const vol = Math.floor(Math.random() * 2000000) + 500000;

      candles.push({
        time,
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
      });

      volume.push({
        time,
        value: vol,
        color: close >= open ? 'rgba(0, 255, 136, 0.5)' : 'rgba(239, 68, 68, 0.5)',
      });

      basePrice = close;
    }

    return { candles, volume };
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Header */}
      <div className="p-4 border-b border-neural-border flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-neon-blue" />
            <h2 className="text-lg font-bold text-white">
              {selectedSymbol || 'AAPL'}
            </h2>
            <span className="text-sm text-gray-400">Apple Inc.</span>
          </div>
          
          {/* Current Price */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-mono font-bold text-white">$189.47</span>
            <div className="flex flex-col">
              <span className="text-sm font-mono text-neon-green">+2.34</span>
              <span className="text-xs font-mono text-neon-green">(+1.25%)</span>
            </div>
          </div>
        </div>
        
        {/* Chart Controls */}
        <div className="flex items-center space-x-3">
          {/* Timeframes */}
          <div className="flex items-center space-x-1 bg-neural-panel rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-neon-blue text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          
          {/* Chart Tools */}
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Zap className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Chart Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neural-dark/50">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-neon-blue border-t-transparent rounded-full"
            />
          </div>
        )}
        
        <div
          ref={chartContainerRef}
          className="w-full h-full chart-container"
        />
        
        {/* Chart Overlay - AI Signals */}
        <div className="absolute top-4 left-4 space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-neon-green/10 border border-neon-green/20 rounded-lg px-3 py-1.5 flex items-center space-x-2"
          >
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-xs font-medium text-neon-green">AI BUY Signal</span>
            <span className="text-xs text-gray-400">87% confidence</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}