//! Master Coordinator Agent - Strategic planning and agent orchestration

use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tokio::time::{interval, Duration};
use tracing::{info, warn, error};

use crate::core::config::CoordinatorConfig;
use crate::core::errors::TradingResult;
use crate::core::types::{
    AgentCapability, AgentId, AgentMessage, SystemContext, 
    PerformanceMetrics, TradingSignal, MessageType
};
use crate::agents::traits::{
    AutonomousAgent, BaseAgent, AgentResult, SystemFeedback, 
    EvolutionResult, Requirements, CodeGeneration
};

/// Master Coordinator Agent for strategic planning and system orchestration
#[derive(Clone)]
pub struct MasterCoordinatorAgent {
    base: BaseAgent,
    config: CoordinatorConfig,
}

impl MasterCoordinatorAgent {
    /// Create a new master coordinator agent
    pub async fn new(
        config: CoordinatorConfig,
        message_sender: mpsc::UnboundedSender<AgentMessage>,
        system_context: Arc<RwLock<SystemContext>>,
    ) -> TradingResult<Self> {
        let capabilities = config.capabilities.clone();
        let base = BaseAgent::new(capabilities, message_sender, system_context);
        
        Ok(Self {
            base,
            config,
        })
    }
    
    /// Perform strategic planning
    async fn strategic_planning(&self) -> TradingResult<()> {
        info!("🎯 Executing strategic planning...");
        
        let context = self.base.get_system_context().await;
        
        // Analyze current performance
        let performance_score = self.calculate_performance_score(&context).await?;
        
        // Generate strategic recommendations
        let recommendations = self.generate_strategic_recommendations(&context).await?;
        
        // Send recommendations to other agents
        for recommendation in recommendations {
            let message = AgentMessage {
                from: self.base.id,
                to: uuid::Uuid::nil(), // Broadcast
                message_type: MessageType::SystemCommand,
                payload: serde_json::to_value(&recommendation)?,
                timestamp: chrono::Utc::now(),
            };
            
            self.base.send_message(message).await?;
        }
        
        info!("✅ Strategic planning completed with score: {:.2}", performance_score);
        Ok(())
    }
    
    /// Calculate overall system performance score
    async fn calculate_performance_score(&self, context: &SystemContext) -> TradingResult<f64> {
        let metrics = &context.performance_metrics;
        
        // Simple performance scoring based on win rate and profit factor
        let win_rate_score = metrics.win_rate * 0.4;
        let profit_factor_score = (metrics.profit_factor / 2.0).min(1.0) * 0.4;
        let execution_speed_score = if metrics.average_execution_time_ms < 1000.0 {
            0.2
        } else {
            0.1
        };
        
        Ok(win_rate_score + profit_factor_score + execution_speed_score)
    }
    
    /// Generate strategic recommendations
    async fn generate_strategic_recommendations(&self, context: &SystemContext) -> TradingResult<Vec<String>> {
        let mut recommendations = Vec::new();
        
        // Analyze portfolio performance
        if context.portfolio.daily_pnl.is_sign_negative() {
            recommendations.push("Reduce position sizes due to negative daily P&L".to_string());
        }
        
        // Analyze risk metrics
        if context.risk_metrics.portfolio_heat > 0.8 {
            recommendations.push("Implement defensive strategies due to high portfolio heat".to_string());
        }
        
        // Analyze market regime
        match context.market_regime {
            crate::core::types::MarketRegime::HighVolatility => {
                recommendations.push("Switch to volatility-based strategies".to_string());
            }
            crate::core::types::MarketRegime::Crisis => {
                recommendations.push("Activate emergency risk protocols".to_string());
            }
            _ => {}
        }
        
        Ok(recommendations)
    }
}

#[async_trait]
impl AutonomousAgent for MasterCoordinatorAgent {
    async fn execute_mission(&self, context: &SystemContext) -> TradingResult<AgentResult> {
        info!("🎯 Master Coordinator executing mission...");
        
        // Perform strategic analysis
        let performance_score = self.calculate_performance_score(context).await?;
        let recommendations = self.generate_strategic_recommendations(context).await?;
        
        Ok(AgentResult {
            success: true,
            signals: Vec::new(), // Coordinator doesn't generate trading signals
            metrics: context.performance_metrics.clone(),
            recommendations,
            errors: Vec::new(),
        })
    }
    
    async fn self_evaluate(&self) -> TradingResult<PerformanceMetrics> {
        let context = self.base.get_system_context().await;
        Ok(context.performance_metrics)
    }
    
    async fn evolve_strategy(&mut self, feedback: &SystemFeedback) -> TradingResult<EvolutionResult> {
        info!("🧬 Coordinator evolving strategy based on feedback...");
        
        // Simple strategy evolution based on performance
        let mut new_parameters = std::collections::HashMap::new();
        
        if feedback.performance_score < 0.5 {
            // Reduce decision timeout for faster responses
            new_parameters.insert(
                "decision_timeout_ms".to_string(),
                serde_json::Value::Number(serde_json::Number::from(50)),
            );
        }
        
        Ok(EvolutionResult {
            strategy_updated: !new_parameters.is_empty(),
            new_parameters,
            performance_improvement: feedback.performance_score * 0.1,
            confidence: 0.7,
        })
    }
    
    async fn generate_code(&self, requirements: &Requirements) -> TradingResult<CodeGeneration> {
        info!("🔧 Coordinator generating code for: {}", requirements.functionality);
        
        // Simple code generation placeholder
        let code = format!(
            "// Generated code for: {}\n// TODO: Implement {}\npub fn generated_function() {{\n    // Implementation here\n}}",
            requirements.functionality,
            requirements.functionality
        );
        
        Ok(CodeGeneration {
            code,
            language: "rust".to_string(),
            tests: vec!["#[test] fn test_generated_function() { assert!(true); }".to_string()],
            documentation: format!("Generated function for {}", requirements.functionality),
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
        info!("🎯 Master Coordinator starting execution loop...");
        
        let mut planning_interval = interval(Duration::from_secs(
            self.config.strategic_planning_interval_hours * 3600
        ));
        
        loop {
            tokio::select! {
                _ = planning_interval.tick() => {
                    if let Err(e) = self.strategic_planning().await {
                        error!("Strategic planning error: {}", e);
                    }
                }
                _ = tokio::time::sleep(Duration::from_millis(100)) => {
                    if self.base.should_shutdown().await {
                        break;
                    }
                }
            }
        }
        
        info!("🎯 Master Coordinator execution loop ended");
        Ok(())
    }
    
    async fn shutdown(&mut self) -> TradingResult<()> {
        info!("🛑 Master Coordinator shutting down...");
        self.base.request_shutdown().await;
        Ok(())
    }
}
