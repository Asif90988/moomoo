//! Execution Engine Agent - High-speed trade execution

use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tokio::time::{interval, Duration};
use tracing::{info, warn, error};

use crate::core::config::{ExecutionConfig, ApiConfig};
use crate::core::errors::TradingResult;
use crate::core::types::{
    AgentCapability, AgentId, AgentMessage, SystemContext, 
    PerformanceMetrics, TradingSignal, Order, OrderType, OrderSide, OrderStatus, ExecutionResult
};
use crate::agents::traits::{
    AutonomousAgent, BaseAgent, AgentResult, SystemFeedback, 
    EvolutionResult, Requirements, CodeGeneration, TradeExecutor,
    ExecutionPlan, OrderStatus as TraitOrderStatus
};

/// Execution Engine Agent for high-speed trade execution
#[derive(Clone)]
pub struct ExecutionEngineAgent {
    base: BaseAgent,
    config: ExecutionConfig,
    api_config: ApiConfig,
}

impl ExecutionEngineAgent {
    /// Create a new execution engine agent
    pub async fn new(
        config: ExecutionConfig,
        api_config: ApiConfig,
        message_sender: mpsc::UnboundedSender<AgentMessage>,
    ) -> TradingResult<Self> {
        let capabilities = vec![
            AgentCapability::ExecutionOptimization,
        ];
        
        // Create a dummy system context for the base agent
        let system_context = Arc::new(RwLock::new(SystemContext {
            market_regime: crate::core::types::MarketRegime::Sideways,
            portfolio: crate::core::types::Portfolio {
                total_value: rust_decimal::Decimal::from(100),
                cash_balance: rust_decimal::Decimal::from(100),
                positions: Default::default(),
                daily_pnl: Default::default(),
                total_pnl: Default::default(),
                max_drawdown: Default::default(),
                sharpe_ratio: None,
                last_updated: chrono::Utc::now(),
            },
            risk_metrics: crate::core::types::RiskMetrics {
                var_95: Default::default(),
                var_99: Default::default(),
                expected_shortfall: Default::default(),
                max_position_size: rust_decimal::Decimal::from(20),
                daily_loss_limit: rust_decimal::Decimal::from(2),
                portfolio_heat: 0.0,
            },
            performance_metrics: crate::core::types::PerformanceMetrics {
                total_trades: 0,
                winning_trades: 0,
                losing_trades: 0,
                win_rate: 0.0,
                average_win: Default::default(),
                average_loss: Default::default(),
                profit_factor: 0.0,
                max_consecutive_wins: 0,
                max_consecutive_losses: 0,
                average_execution_time_ms: 0.0,
            },
            active_positions: 0,
            available_capital: rust_decimal::Decimal::from(100),
            system_health: crate::core::types::SystemHealth::Healthy,
        }));
        
        let base = BaseAgent::new(capabilities, message_sender, system_context);
        
        Ok(Self {
            base,
            config,
            api_config,
        })
    }
    
    /// Execute a trading signal with optimal routing
    async fn execute_signal(&self, signal: &TradingSignal) -> TradingResult<ExecutionResult> {
        info!("⚡ Executing trade for {} - {:?}", signal.symbol, signal.signal_type);
        
        let start_time = std::time::Instant::now();
        
        // Create order from signal
        let order = self.create_order_from_signal(signal).await?;
        
        // Optimize execution
        let execution_plan = self.create_execution_plan(&order).await?;
        
        // Simulate order execution
        let result = self.simulate_order_execution(&order, &execution_plan).await?;
        
        let execution_time = start_time.elapsed().as_millis() as u64;
        
        info!("✅ Trade executed in {}ms", execution_time);
        
        Ok(ExecutionResult {
            order_id: result.order_id,
            executed_quantity: result.executed_quantity,
            executed_price: result.executed_price,
            execution_time_ms: execution_time,
            slippage: result.slippage,
            commission: result.commission,
            success: result.success,
            error_message: result.error_message,
        })
    }
    
    /// Create order from trading signal
    async fn create_order_from_signal(&self, signal: &TradingSignal) -> TradingResult<Order> {
        let order_side = match signal.signal_type {
            crate::core::types::SignalType::Buy | crate::core::types::SignalType::StrongBuy => OrderSide::Buy,
            crate::core::types::SignalType::Sell | crate::core::types::SignalType::StrongSell => OrderSide::Sell,
            crate::core::types::SignalType::Hold => return Err(crate::core::errors::TradingError::execution("Cannot execute hold signal")),
        };
        
        // Calculate position size based on signal strength
        let base_size = rust_decimal::Decimal::from(10); // $10 base position
        let quantity = base_size * rust_decimal::Decimal::from_f64_retain(signal.strength).unwrap();
        
        Ok(Order {
            id: uuid::Uuid::new_v4(),
            symbol: signal.symbol.clone(),
            order_type: OrderType::Market, // Use market orders for speed
            side: order_side,
            quantity,
            price: None, // Market order
            timestamp: chrono::Utc::now(),
            status: OrderStatus::Pending,
        })
    }
    
    /// Create optimal execution plan
    async fn create_execution_plan(&self, order: &Order) -> TradingResult<ExecutionPlan> {
        // Simple execution plan - in reality this would be much more sophisticated
        let algorithm = if order.quantity > rust_decimal::Decimal::from(100) {
            "TWAP".to_string() // Time-weighted average price for large orders
        } else {
            "MARKET".to_string() // Direct market execution for small orders
        };
        
        Ok(ExecutionPlan {
            algorithm,
            time_horizon: Duration::from_millis(self.config.max_latency_ms),
            slice_size: 0.1, // 10% slices
            price_improvement_target: 0.001, // 0.1% improvement target
            contingency_plans: vec!["CANCEL_ON_TIMEOUT".to_string()],
        })
    }
    
    /// Simulate order execution (in real system, this would call Moomoo API)
    async fn simulate_order_execution(&self, order: &Order, _plan: &ExecutionPlan) -> TradingResult<ExecutionResult> {
        // Simulate execution with random slippage and latency
        let slippage = rust_decimal::Decimal::from_f64_retain(rand::random::<f64>() * 0.001).unwrap(); // 0-0.1% slippage
        let commission = order.quantity * rust_decimal::Decimal::from_f64_retain(0.001).unwrap(); // 0.1% commission
        
        // Simulate market price
        let market_price = rust_decimal::Decimal::from_f64_retain(150.0 + rand::random::<f64>() * 10.0).unwrap();
        let executed_price = match order.side {
            OrderSide::Buy => market_price + slippage,
            OrderSide::Sell => market_price - slippage,
        };
        
        Ok(ExecutionResult {
            order_id: order.id,
            executed_quantity: order.quantity,
            executed_price,
            execution_time_ms: (rand::random::<f64>() * self.config.max_latency_ms as f64) as u64,
            slippage,
            commission,
            success: true,
            error_message: None,
        })
    }
}

#[async_trait]
impl AutonomousAgent for ExecutionEngineAgent {
    async fn execute_mission(&self, _context: &SystemContext) -> TradingResult<AgentResult> {
        info!("⚡ Execution Engine executing mission...");
        
        // Execution engine waits for signals from other agents
        Ok(AgentResult {
            success: true,
            signals: Vec::new(), // Execution engine doesn't generate signals
            metrics: PerformanceMetrics {
                total_trades: 0,
                winning_trades: 0,
                losing_trades: 0,
                win_rate: 0.0,
                average_win: Default::default(),
                average_loss: Default::default(),
                profit_factor: 0.0,
                max_consecutive_wins: 0,
                max_consecutive_losses: 0,
                average_execution_time_ms: self.config.max_latency_ms as f64,
            },
            recommendations: vec!["Ready for trade execution".to_string()],
            errors: Vec::new(),
        })
    }
    
    async fn self_evaluate(&self) -> TradingResult<PerformanceMetrics> {
        Ok(PerformanceMetrics {
            total_trades: 0,
            winning_trades: 0,
            losing_trades: 0,
            win_rate: 0.0,
            average_win: Default::default(),
            average_loss: Default::default(),
            profit_factor: 0.0,
            max_consecutive_wins: 0,
            max_consecutive_losses: 0,
            average_execution_time_ms: self.config.max_latency_ms as f64,
        })
    }
    
    async fn evolve_strategy(&mut self, feedback: &SystemFeedback) -> TradingResult<EvolutionResult> {
        info!("🧬 Execution engine evolving strategy...");
        
        let mut new_parameters = std::collections::HashMap::new();
        
        if feedback.performance_score > 0.8 {
            // Increase aggressiveness for better performance
            new_parameters.insert(
                "max_latency_ms".to_string(),
                serde_json::Value::Number(serde_json::Number::from_f64(0.5).unwrap()),
            );
        }
        
        Ok(EvolutionResult {
            strategy_updated: !new_parameters.is_empty(),
            new_parameters,
            performance_improvement: feedback.performance_score * 0.1,
            confidence: 0.85,
        })
    }
    
    async fn generate_code(&self, requirements: &Requirements) -> TradingResult<CodeGeneration> {
        info!("🔧 Execution engine generating code for: {}", requirements.functionality);
        
        let code = format!(
            "// Execution optimization code for: {}\nuse tokio::time::Instant;\n\npub async fn optimize_{}() -> Result<f64, Box<dyn std::error::Error>> {{\n    let start = Instant::now();\n    // Execution optimization implementation\n    Ok(start.elapsed().as_secs_f64())\n}}",
            requirements.functionality,
            requirements.functionality.to_lowercase().replace(' ', "_")
        );
        
        Ok(CodeGeneration {
            code,
            language: "rust".to_string(),
            tests: vec!["#[tokio::test] async fn test_optimization() { assert!(optimize_test().await.is_ok()); }".to_string()],
            documentation: format!("Execution optimization function for {}", requirements.functionality),
            performance_estimate: requirements.performance_targets.clone(),
        })
    }
    
    fn capabilities(&self) -> Vec<AgentCapability> {
        self.base.capabilities.clone()
    }
    
    fn agent_id(&self) -> AgentId {
        self.base.id
    }
    
    async fn run(&mut self) -> TradingResult<()> {
        info!("⚡ Execution Engine starting execution loop...");
        
        let mut health_check = interval(Duration::from_secs(1));
        
        loop {
            tokio::select! {
                _ = health_check.tick() => {
                    // Perform health checks and maintain connections
                    info!("⚡ Execution engine healthy - ready for trades");
                }
                _ = tokio::time::sleep(Duration::from_millis(10)) => {
                    if self.base.should_shutdown().await {
                        break;
                    }
                }
            }
        }
        
        info!("⚡ Execution Engine execution loop ended");
        Ok(())
    }
    
    async fn shutdown(&mut self) -> TradingResult<()> {
        info!("🛑 Execution Engine shutting down...");
        self.base.request_shutdown().await;
        Ok(())
    }
}

#[async_trait]
impl TradeExecutor for ExecutionEngineAgent {
    async fn execute_trade(&self, signal: &TradingSignal) -> TradingResult<ExecutionResult> {
        self.execute_signal(signal).await
    }
    
    async fn optimize_execution(&self, order: &Order) -> TradingResult<ExecutionPlan> {
        self.create_execution_plan(order).await
    }
    
    async fn monitor_orders(&self) -> TradingResult<Vec<TraitOrderStatus>> {
        // Simulate order monitoring
        Ok(vec![
            TraitOrderStatus {
                order_id: uuid::Uuid::new_v4(),
                status: OrderStatus::Filled,
                filled_quantity: rust_decimal::Decimal::from(10),
                average_price: rust_decimal::Decimal::from(150),
                remaining_quantity: rust_decimal::Decimal::ZERO,
                estimated_completion: Some(chrono::Utc::now()),
            }
        ])
    }
}
