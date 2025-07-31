//! Common traits for autonomous trading agents

use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};

use crate::core::errors::TradingResult;
use crate::core::types::{
    AgentCapability, AgentId, AgentMessage, SystemContext, 
    PerformanceMetrics, TradingSignal
};

/// Core trait for all autonomous agents
#[async_trait]
pub trait AutonomousAgent: Send + Sync + Clone {
    /// Execute the agent's main mission/task
    async fn execute_mission(&self, context: &SystemContext) -> TradingResult<AgentResult>;
    
    /// Self-evaluate performance and capabilities
    async fn self_evaluate(&self) -> TradingResult<PerformanceMetrics>;
    
    /// Evolve strategy based on feedback
    async fn evolve_strategy(&mut self, feedback: &SystemFeedback) -> TradingResult<EvolutionResult>;
    
    /// Generate code for new capabilities (self-modification)
    async fn generate_code(&self, requirements: &Requirements) -> TradingResult<CodeGeneration>;
    
    /// Get agent capabilities
    fn capabilities(&self) -> Vec<AgentCapability>;
    
    /// Get unique agent identifier
    fn agent_id(&self) -> AgentId;
    
    /// Start the agent's main execution loop
    async fn run(&mut self) -> TradingResult<()>;
    
    /// Shutdown the agent gracefully
    async fn shutdown(&mut self) -> TradingResult<()>;
}

/// Result of agent mission execution
#[derive(Debug, Clone)]
pub struct AgentResult {
    pub success: bool,
    pub signals: Vec<TradingSignal>,
    pub metrics: PerformanceMetrics,
    pub recommendations: Vec<String>,
    pub errors: Vec<String>,
}

/// System feedback for agent evolution
#[derive(Debug, Clone)]
pub struct SystemFeedback {
    pub performance_score: f64,
    pub market_conditions: String,
    pub recent_trades: Vec<TradeOutcome>,
    pub risk_metrics: crate::core::types::RiskMetrics,
    pub suggestions: Vec<String>,
}

/// Trade outcome for learning
#[derive(Debug, Clone)]
pub struct TradeOutcome {
    pub signal_strength: f64,
    pub actual_return: f64,
    pub execution_time_ms: u64,
    pub slippage: f64,
    pub success: bool,
}

/// Result of strategy evolution
#[derive(Debug, Clone)]
pub struct EvolutionResult {
    pub strategy_updated: bool,
    pub new_parameters: std::collections::HashMap<String, serde_json::Value>,
    pub performance_improvement: f64,
    pub confidence: f64,
}

/// Requirements for code generation
#[derive(Debug, Clone)]
pub struct Requirements {
    pub functionality: String,
    pub performance_targets: PerformanceTargets,
    pub constraints: Vec<String>,
    pub dependencies: Vec<String>,
}

/// Performance targets for generated code
#[derive(Debug, Clone)]
pub struct PerformanceTargets {
    pub max_latency_ms: u64,
    pub min_accuracy: f64,
    pub max_memory_mb: u64,
    pub min_throughput: u64,
}

/// Generated code result
#[derive(Debug, Clone)]
pub struct CodeGeneration {
    pub code: String,
    pub language: String,
    pub tests: Vec<String>,
    pub documentation: String,
    pub performance_estimate: PerformanceTargets,
}

/// Base agent implementation with common functionality
#[derive(Clone)]
pub struct BaseAgent {
    pub id: AgentId,
    pub capabilities: Vec<AgentCapability>,
    pub message_sender: mpsc::UnboundedSender<AgentMessage>,
    pub system_context: Arc<RwLock<SystemContext>>,
    pub shutdown_signal: Arc<RwLock<bool>>,
}

impl BaseAgent {
    /// Create a new base agent
    pub fn new(
        capabilities: Vec<AgentCapability>,
        message_sender: mpsc::UnboundedSender<AgentMessage>,
        system_context: Arc<RwLock<SystemContext>>,
    ) -> Self {
        Self {
            id: uuid::Uuid::new_v4(),
            capabilities,
            message_sender,
            system_context,
            shutdown_signal: Arc::new(RwLock::new(false)),
        }
    }
    
    /// Send a message to other agents
    pub async fn send_message(&self, message: AgentMessage) -> TradingResult<()> {
        self.message_sender
            .send(message)
            .map_err(|_| crate::core::errors::TradingError::agent_communication("Failed to send message"))?;
        Ok(())
    }
    
    /// Check if shutdown has been requested
    pub async fn should_shutdown(&self) -> bool {
        let shutdown = self.shutdown_signal.read().await;
        *shutdown
    }
    
    /// Request shutdown
    pub async fn request_shutdown(&self) {
        let mut shutdown = self.shutdown_signal.write().await;
        *shutdown = true;
    }
    
    /// Get current system context
    pub async fn get_system_context(&self) -> SystemContext {
        let context = self.system_context.read().await;
        context.clone()
    }
}

/// Trait for agents that can analyze market data
#[async_trait]
pub trait MarketAnalyzer: AutonomousAgent {
    /// Analyze current market conditions
    async fn analyze_market(&self) -> TradingResult<MarketAnalysis>;
    
    /// Generate trading signals based on analysis
    async fn generate_signals(&self, analysis: &MarketAnalysis) -> TradingResult<Vec<TradingSignal>>;
}

/// Market analysis result
#[derive(Debug, Clone)]
pub struct MarketAnalysis {
    pub regime: crate::core::types::MarketRegime,
    pub volatility: f64,
    pub trend_strength: f64,
    pub support_levels: Vec<f64>,
    pub resistance_levels: Vec<f64>,
    pub sentiment_score: f64,
    pub volume_profile: VolumeProfile,
}

/// Volume profile analysis
#[derive(Debug, Clone)]
pub struct VolumeProfile {
    pub total_volume: u64,
    pub average_volume: u64,
    pub volume_trend: f64,
    pub high_volume_nodes: Vec<f64>,
}

/// Trait for agents that can manage risk
#[async_trait]
pub trait RiskManager: AutonomousAgent {
    /// Calculate portfolio risk metrics
    async fn calculate_risk(&self) -> TradingResult<crate::core::types::RiskMetrics>;
    
    /// Validate a trading decision against risk limits
    async fn validate_trade(&self, signal: &TradingSignal) -> TradingResult<RiskValidation>;
    
    /// Generate hedging recommendations
    async fn generate_hedges(&self) -> TradingResult<Vec<HedgeRecommendation>>;
}

/// Risk validation result
#[derive(Debug, Clone)]
pub struct RiskValidation {
    pub approved: bool,
    pub risk_score: f64,
    pub position_size_adjustment: f64,
    pub warnings: Vec<String>,
    pub required_hedges: Vec<HedgeRecommendation>,
}

/// Hedge recommendation
#[derive(Debug, Clone)]
pub struct HedgeRecommendation {
    pub instrument: String,
    pub action: String, // "buy", "sell"
    pub quantity: f64,
    pub reasoning: String,
    pub urgency: f64, // 0.0 to 1.0
}

/// Trait for agents that can execute trades
#[async_trait]
pub trait TradeExecutor: AutonomousAgent {
    /// Execute a trading signal
    async fn execute_trade(&self, signal: &TradingSignal) -> TradingResult<crate::core::types::ExecutionResult>;
    
    /// Optimize order execution
    async fn optimize_execution(&self, order: &crate::core::types::Order) -> TradingResult<ExecutionPlan>;
    
    /// Monitor order status
    async fn monitor_orders(&self) -> TradingResult<Vec<OrderStatus>>;
}

/// Execution plan for optimal order routing
#[derive(Debug, Clone)]
pub struct ExecutionPlan {
    pub algorithm: String,
    pub time_horizon: std::time::Duration,
    pub slice_size: f64,
    pub price_improvement_target: f64,
    pub contingency_plans: Vec<String>,
}

/// Order status information
#[derive(Debug, Clone)]
pub struct OrderStatus {
    pub order_id: crate::core::types::OrderId,
    pub status: crate::core::types::OrderStatus,
    pub filled_quantity: rust_decimal::Decimal,
    pub average_price: rust_decimal::Decimal,
    pub remaining_quantity: rust_decimal::Decimal,
    pub estimated_completion: Option<chrono::DateTime<chrono::Utc>>,
}

/// Trait for learning and adaptive agents
#[async_trait]
pub trait LearningAgent: AutonomousAgent {
    /// Learn from recent trading outcomes
    async fn learn_from_outcomes(&mut self, outcomes: &[TradeOutcome]) -> TradingResult<LearningResult>;
    
    /// Update model parameters
    async fn update_model(&mut self, data: &ModelUpdateData) -> TradingResult<ModelUpdateResult>;
    
    /// Generate new trading strategies
    async fn generate_strategies(&self) -> TradingResult<Vec<GeneratedStrategy>>;
}

/// Learning result
#[derive(Debug, Clone)]
pub struct LearningResult {
    pub accuracy_improvement: f64,
    pub new_patterns_discovered: u32,
    pub model_confidence: f64,
    pub recommended_actions: Vec<String>,
}

/// Model update data
#[derive(Debug, Clone)]
pub struct ModelUpdateData {
    pub market_data: Vec<crate::core::types::MarketData>,
    pub trade_outcomes: Vec<TradeOutcome>,
    pub performance_metrics: PerformanceMetrics,
}

/// Model update result
#[derive(Debug, Clone)]
pub struct ModelUpdateResult {
    pub success: bool,
    pub performance_change: f64,
    pub new_model_version: String,
    pub rollback_available: bool,
}

/// Generated trading strategy
#[derive(Debug, Clone)]
pub struct GeneratedStrategy {
    pub name: String,
    pub description: String,
    pub parameters: std::collections::HashMap<String, serde_json::Value>,
    pub expected_performance: PerformanceTargets,
    pub risk_profile: String,
    pub market_conditions: Vec<String>,
}
