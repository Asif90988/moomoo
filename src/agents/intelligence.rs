//! Market Intelligence Agent - Real-time market analysis and signal generation

use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tokio::time::{interval, Duration};
use tracing::{info, warn, error};

use crate::core::config::{IntelligenceConfig, ApiConfig};
use crate::core::errors::TradingResult;
use crate::core::types::{
    AgentCapability, AgentId, AgentMessage, SystemContext, 
    PerformanceMetrics, TradingSignal, SignalType, MarketData
};
use crate::agents::traits::{
    AutonomousAgent, BaseAgent, AgentResult, SystemFeedback, 
    EvolutionResult, Requirements, CodeGeneration, MarketAnalyzer, MarketAnalysis
};

/// Market Intelligence Agent for real-time market analysis
#[derive(Clone)]
pub struct MarketIntelligenceAgent {
    base: BaseAgent,
    config: IntelligenceConfig,
    api_config: ApiConfig,
}

impl MarketIntelligenceAgent {
    /// Create a new market intelligence agent
    pub async fn new(
        config: IntelligenceConfig,
        api_config: ApiConfig,
        message_sender: mpsc::UnboundedSender<AgentMessage>,
    ) -> TradingResult<Self> {
        let capabilities = vec![
            AgentCapability::MarketAnalysis,
            AgentCapability::StrategyGeneration,
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
    
    /// Analyze market data and generate signals
    async fn analyze_and_signal(&self) -> TradingResult<Vec<TradingSignal>> {
        info!("📊 Analyzing market data...");
        
        // Simulate market data analysis
        let market_data = self.fetch_market_data().await?;
        let analysis = self.analyze_market_data(&market_data).await?;
        let signals = self.generate_trading_signals(&analysis).await?;
        
        info!("📊 Generated {} trading signals", signals.len());
        Ok(signals)
    }
    
    /// Fetch market data from configured sources
    async fn fetch_market_data(&self) -> TradingResult<Vec<MarketData>> {
        // Simulate fetching market data
        // In a real implementation, this would connect to Moomoo API or other data sources
        
        let symbols = vec!["AAPL", "TSLA", "MSFT", "GOOGL"];
        let mut market_data = Vec::new();
        
        for symbol in symbols {
            let data = MarketData {
                symbol: symbol.to_string(),
                timestamp: chrono::Utc::now(),
                price: rust_decimal::Decimal::from_f64_retain(150.0 + rand::random::<f64>() * 50.0).unwrap(),
                volume: (1000000.0 + rand::random::<f64>() * 500000.0) as u64,
                bid: Some(rust_decimal::Decimal::from_f64_retain(149.95).unwrap()),
                ask: Some(rust_decimal::Decimal::from_f64_retain(150.05).unwrap()),
                bid_size: Some(1000),
                ask_size: Some(1000),
            };
            market_data.push(data);
        }
        
        Ok(market_data)
    }
    
    /// Analyze market data using technical indicators
    async fn analyze_market_data(&self, data: &[MarketData]) -> TradingResult<MarketAnalysis> {
        // Simulate technical analysis
        let volatility = 0.2 + rand::random::<f64>() * 0.3; // 20-50% volatility
        let trend_strength = rand::random::<f64>(); // 0-1 trend strength
        let sentiment_score = rand::random::<f64>() * 2.0 - 1.0; // -1 to 1
        
        Ok(MarketAnalysis {
            regime: if volatility > 0.4 {
                crate::core::types::MarketRegime::HighVolatility
            } else if trend_strength > 0.7 {
                crate::core::types::MarketRegime::Bull
            } else {
                crate::core::types::MarketRegime::Sideways
            },
            volatility,
            trend_strength,
            support_levels: vec![145.0, 140.0, 135.0],
            resistance_levels: vec![155.0, 160.0, 165.0],
            sentiment_score,
            volume_profile: crate::agents::traits::VolumeProfile {
                total_volume: data.iter().map(|d| d.volume).sum(),
                average_volume: data.iter().map(|d| d.volume).sum::<u64>() / data.len() as u64,
                volume_trend: if rand::random::<f64>() > 0.5 { 1.0 } else { -1.0 },
                high_volume_nodes: vec![150.0, 152.0, 148.0],
            },
        })
    }
    
    /// Generate trading signals based on analysis
    async fn generate_trading_signals(&self, analysis: &MarketAnalysis) -> TradingResult<Vec<TradingSignal>> {
        let mut signals = Vec::new();
        
        // Generate signals based on market analysis
        if analysis.trend_strength > 0.7 && analysis.sentiment_score > 0.3 {
            signals.push(TradingSignal {
                symbol: "AAPL".to_string(),
                signal_type: SignalType::Buy,
                strength: analysis.trend_strength,
                confidence: 0.8,
                timestamp: chrono::Utc::now(),
                reasoning: "Strong upward trend with positive sentiment".to_string(),
            });
        }
        
        if analysis.volatility > 0.4 {
            signals.push(TradingSignal {
                symbol: "TSLA".to_string(),
                signal_type: SignalType::StrongBuy,
                strength: analysis.volatility,
                confidence: 0.7,
                timestamp: chrono::Utc::now(),
                reasoning: "High volatility presents trading opportunities".to_string(),
            });
        }
        
        Ok(signals)
    }
}

#[async_trait]
impl AutonomousAgent for MarketIntelligenceAgent {
    async fn execute_mission(&self, _context: &SystemContext) -> TradingResult<AgentResult> {
        info!("📊 Market Intelligence executing mission...");
        
        let signals = self.analyze_and_signal().await?;
        
        Ok(AgentResult {
            success: true,
            signals,
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
                average_execution_time_ms: self.config.update_interval_ms as f64,
            },
            recommendations: vec!["Monitor high volatility periods".to_string()],
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
            average_execution_time_ms: self.config.update_interval_ms as f64,
        })
    }
    
    async fn evolve_strategy(&mut self, feedback: &SystemFeedback) -> TradingResult<EvolutionResult> {
        info!("🧬 Intelligence agent evolving strategy...");
        
        let mut new_parameters = std::collections::HashMap::new();
        
        if feedback.performance_score < 0.6 {
            // Increase update frequency for better market tracking
            new_parameters.insert(
                "update_interval_ms".to_string(),
                serde_json::Value::Number(serde_json::Number::from(50)),
            );
        }
        
        Ok(EvolutionResult {
            strategy_updated: !new_parameters.is_empty(),
            new_parameters,
            performance_improvement: feedback.performance_score * 0.15,
            confidence: 0.8,
        })
    }
    
    async fn generate_code(&self, requirements: &Requirements) -> TradingResult<CodeGeneration> {
        info!("🔧 Intelligence agent generating code for: {}", requirements.functionality);
        
        let code = format!(
            "// Market analysis code for: {}\nuse ta::indicators::*;\n\npub fn analyze_{}() -> f64 {{\n    // Technical analysis implementation\n    0.0\n}}",
            requirements.functionality,
            requirements.functionality.to_lowercase().replace(' ', "_")
        );
        
        Ok(CodeGeneration {
            code,
            language: "rust".to_string(),
            tests: vec!["#[test] fn test_analysis() { assert!(analyze_test() >= 0.0); }".to_string()],
            documentation: format!("Market analysis function for {}", requirements.functionality),
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
        info!("📊 Market Intelligence starting execution loop...");
        
        let mut update_interval = interval(Duration::from_millis(self.config.update_interval_ms));
        
        loop {
            tokio::select! {
                _ = update_interval.tick() => {
                    if let Err(e) = self.analyze_and_signal().await {
                        error!("Market analysis error: {}", e);
                    }
                }
                _ = tokio::time::sleep(Duration::from_millis(10)) => {
                    if self.base.should_shutdown().await {
                        break;
                    }
                }
            }
        }
        
        info!("📊 Market Intelligence execution loop ended");
        Ok(())
    }
    
    async fn shutdown(&mut self) -> TradingResult<()> {
        info!("🛑 Market Intelligence shutting down...");
        self.base.request_shutdown().await;
        Ok(())
    }
}

#[async_trait]
impl MarketAnalyzer for MarketIntelligenceAgent {
    async fn analyze_market(&self) -> TradingResult<MarketAnalysis> {
        let market_data = self.fetch_market_data().await?;
        self.analyze_market_data(&market_data).await
    }
    
    async fn generate_signals(&self, analysis: &MarketAnalysis) -> TradingResult<Vec<TradingSignal>> {
        self.generate_trading_signals(analysis).await
    }
}
