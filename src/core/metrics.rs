//! Performance metrics and monitoring

use lazy_static::lazy_static;
use prometheus::{Counter, Histogram, Gauge, register_counter, register_histogram, register_gauge};
use std::time::Instant;
use rust_decimal::Decimal;
use rust_decimal::prelude::ToPrimitive;

lazy_static! {
    // Trading metrics
    pub static ref TRADES_EXECUTED: Counter = register_counter!(
        "trades_executed_total", 
        "Total number of trades executed"
    ).unwrap();
    
    pub static ref TRADES_SUCCESSFUL: Counter = register_counter!(
        "trades_successful_total", 
        "Total number of successful trades"
    ).unwrap();
    
    pub static ref TRADES_FAILED: Counter = register_counter!(
        "trades_failed_total", 
        "Total number of failed trades"
    ).unwrap();
    
    // Execution performance metrics
    pub static ref EXECUTION_LATENCY: Histogram = register_histogram!(
        "trade_execution_latency_seconds", 
        "Trade execution latency in seconds"
    ).unwrap();
    
    pub static ref ORDER_PROCESSING_TIME: Histogram = register_histogram!(
        "order_processing_time_seconds", 
        "Time to process orders in seconds"
    ).unwrap();
    
    pub static ref MARKET_DATA_LATENCY: Histogram = register_histogram!(
        "market_data_latency_seconds", 
        "Market data processing latency in seconds"
    ).unwrap();
    
    // Financial metrics
    pub static ref PORTFOLIO_VALUE: Gauge = register_gauge!(
        "portfolio_value_usd", 
        "Current portfolio value in USD"
    ).unwrap();
    
    pub static ref DAILY_PNL: Gauge = register_gauge!(
        "daily_pnl_usd", 
        "Daily profit and loss in USD"
    ).unwrap();
    
    pub static ref TOTAL_PNL: Gauge = register_gauge!(
        "total_pnl_usd", 
        "Total profit and loss in USD"
    ).unwrap();
    
    pub static ref CASH_BALANCE: Gauge = register_gauge!(
        "cash_balance_usd", 
        "Available cash balance in USD"
    ).unwrap();
    
    pub static ref ACTIVE_POSITIONS: Gauge = register_gauge!(
        "active_positions_count", 
        "Number of active positions"
    ).unwrap();
    
    // Risk metrics
    pub static ref PORTFOLIO_HEAT: Gauge = register_gauge!(
        "portfolio_heat_ratio", 
        "Portfolio heat ratio (0.0 to 1.0)"
    ).unwrap();
    
    pub static ref MAX_DRAWDOWN: Gauge = register_gauge!(
        "max_drawdown_usd", 
        "Maximum drawdown in USD"
    ).unwrap();
    
    pub static ref VAR_95: Gauge = register_gauge!(
        "var_95_usd", 
        "Value at Risk (95% confidence) in USD"
    ).unwrap();
    
    // System metrics
    pub static ref AGENT_MESSAGES: Counter = register_counter!(
        "agent_messages_total", 
        "Total number of agent messages processed"
    ).unwrap();
    
    pub static ref SYSTEM_ERRORS: Counter = register_counter!(
        "system_errors_total", 
        "Total number of system errors"
    ).unwrap();
    
    pub static ref CIRCUIT_BREAKER_TRIPS: Counter = register_counter!(
        "circuit_breaker_trips_total", 
        "Total number of circuit breaker activations"
    ).unwrap();
    
    // AI/ML metrics
    pub static ref MODEL_PREDICTIONS: Counter = register_counter!(
        "model_predictions_total", 
        "Total number of AI model predictions"
    ).unwrap();
    
    pub static ref MODEL_ACCURACY: Gauge = register_gauge!(
        "model_accuracy_ratio", 
        "Current model accuracy ratio"
    ).unwrap();
    
    pub static ref STRATEGY_PERFORMANCE: Gauge = register_gauge!(
        "strategy_performance_ratio", 
        "Current strategy performance ratio"
    ).unwrap();
}

/// Timer for measuring execution latency
pub struct LatencyTimer {
    start: Instant,
    histogram: &'static Histogram,
}

impl LatencyTimer {
    pub fn new(histogram: &'static Histogram) -> Self {
        Self {
            start: Instant::now(),
            histogram,
        }
    }
    
    pub fn observe(self) {
        let duration = self.start.elapsed();
        self.histogram.observe(duration.as_secs_f64());
    }
}

/// Metrics collector for the trading system
pub struct MetricsCollector;

impl MetricsCollector {
    /// Update portfolio metrics
    pub fn update_portfolio_metrics(
        total_value: Decimal,
        cash_balance: Decimal,
        daily_pnl: Decimal,
        total_pnl: Decimal,
        active_positions: u32,
    ) {
        PORTFOLIO_VALUE.set(total_value.to_f64().unwrap_or(0.0));
        CASH_BALANCE.set(cash_balance.to_f64().unwrap_or(0.0));
        DAILY_PNL.set(daily_pnl.to_f64().unwrap_or(0.0));
        TOTAL_PNL.set(total_pnl.to_f64().unwrap_or(0.0));
        ACTIVE_POSITIONS.set(active_positions as f64);
    }
    
    /// Update risk metrics
    pub fn update_risk_metrics(
        portfolio_heat: f64,
        max_drawdown: Decimal,
        var_95: Decimal,
    ) {
        PORTFOLIO_HEAT.set(portfolio_heat);
        MAX_DRAWDOWN.set(max_drawdown.to_f64().unwrap_or(0.0));
        VAR_95.set(var_95.to_f64().unwrap_or(0.0));
    }
    
    /// Record a successful trade
    pub fn record_successful_trade() {
        TRADES_EXECUTED.inc();
        TRADES_SUCCESSFUL.inc();
    }
    
    /// Record a failed trade
    pub fn record_failed_trade() {
        TRADES_EXECUTED.inc();
        TRADES_FAILED.inc();
    }
    
    /// Record system error
    pub fn record_system_error() {
        SYSTEM_ERRORS.inc();
    }
    
    /// Record circuit breaker activation
    pub fn record_circuit_breaker() {
        CIRCUIT_BREAKER_TRIPS.inc();
    }
    
    /// Record agent message
    pub fn record_agent_message() {
        AGENT_MESSAGES.inc();
    }
    
    /// Record model prediction
    pub fn record_model_prediction() {
        MODEL_PREDICTIONS.inc();
    }
    
    /// Update model accuracy
    pub fn update_model_accuracy(accuracy: f64) {
        MODEL_ACCURACY.set(accuracy);
    }
    
    /// Update strategy performance
    pub fn update_strategy_performance(performance: f64) {
        STRATEGY_PERFORMANCE.set(performance);
    }
    
    /// Start measuring execution latency
    pub fn start_execution_timer() -> LatencyTimer {
        LatencyTimer::new(&EXECUTION_LATENCY)
    }
    
    /// Start measuring order processing time
    pub fn start_order_timer() -> LatencyTimer {
        LatencyTimer::new(&ORDER_PROCESSING_TIME)
    }
    
    /// Start measuring market data latency
    pub fn start_market_data_timer() -> LatencyTimer {
        LatencyTimer::new(&MARKET_DATA_LATENCY)
    }
}

/// Performance statistics calculator
pub struct PerformanceCalculator;

impl PerformanceCalculator {
    /// Calculate win rate from trade statistics
    pub fn calculate_win_rate(winning_trades: u64, total_trades: u64) -> f64 {
        if total_trades == 0 {
            0.0
        } else {
            winning_trades as f64 / total_trades as f64
        }
    }
    
    /// Calculate profit factor
    pub fn calculate_profit_factor(total_profit: Decimal, total_loss: Decimal) -> f64 {
        if total_loss == Decimal::ZERO {
            if total_profit > Decimal::ZERO {
                f64::INFINITY
            } else {
                0.0
            }
        } else {
            (total_profit / total_loss.abs()).to_f64().unwrap_or(0.0)
        }
    }
    
    /// Calculate Sharpe ratio
    pub fn calculate_sharpe_ratio(returns: &[f64], risk_free_rate: f64) -> Option<f64> {
        if returns.is_empty() {
            return None;
        }
        
        let mean_return = returns.iter().sum::<f64>() / returns.len() as f64;
        let excess_return = mean_return - risk_free_rate;
        
        if returns.len() < 2 {
            return None;
        }
        
        let variance = returns
            .iter()
            .map(|r| (r - mean_return).powi(2))
            .sum::<f64>() / (returns.len() - 1) as f64;
        
        let std_dev = variance.sqrt();
        
        if std_dev == 0.0 {
            None
        } else {
            Some(excess_return / std_dev)
        }
    }
    
    /// Calculate maximum drawdown
    pub fn calculate_max_drawdown(equity_curve: &[Decimal]) -> Decimal {
        if equity_curve.is_empty() {
            return Decimal::ZERO;
        }
        
        let mut max_drawdown = Decimal::ZERO;
        let mut peak = equity_curve[0];
        
        for &value in equity_curve.iter().skip(1) {
            if value > peak {
                peak = value;
            } else {
                let drawdown = peak - value;
                if drawdown > max_drawdown {
                    max_drawdown = drawdown;
                }
            }
        }
        
        max_drawdown
    }
}
