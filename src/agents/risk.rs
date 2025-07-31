//! Risk Management Agent - Portfolio risk monitoring and control

use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tokio::time::{interval, Duration};
use tracing::{info, warn, error};
use rust_decimal::prelude::ToPrimitive;

use crate::core::config::{RiskAgentConfig, RiskConfig};
use crate::core::errors::TradingResult;
use crate::core::types::{
    AgentCapability, AgentId, AgentMessage, SystemContext, 
    PerformanceMetrics, TradingSignal, RiskMetrics
};
use crate::agents::traits::{
    AutonomousAgent, BaseAgent, AgentResult, SystemFeedback, 
    EvolutionResult, Requirements, CodeGeneration, RiskManager,
    RiskValidation, HedgeRecommendation
};

/// Risk Management Agent for portfolio risk monitoring
#[derive(Clone)]
pub struct RiskManagementAgent {
    base: BaseAgent,
    config: RiskAgentConfig,
    risk_config: RiskConfig,
}

impl RiskManagementAgent {
    /// Create a new risk management agent
    pub async fn new(
        config: RiskAgentConfig,
        risk_config: RiskConfig,
        message_sender: mpsc::UnboundedSender<AgentMessage>,
        system_context: Arc<RwLock<SystemContext>>,
    ) -> TradingResult<Self> {
        let capabilities = vec![
            AgentCapability::RiskOptimization,
            AgentCapability::EthicalReasoning,
        ];
        
        let base = BaseAgent::new(capabilities, message_sender, system_context);
        
        Ok(Self {
            base,
            config,
            risk_config,
        })
    }
    
    /// Monitor portfolio risk continuously
    async fn monitor_risk(&self) -> TradingResult<()> {
        info!("🛡️  Monitoring portfolio risk...");
        
        let context = self.base.get_system_context().await;
        let risk_metrics = self.calculate_portfolio_risk(&context).await?;
        
        // Check for risk violations
        if risk_metrics.portfolio_heat > self.risk_config.max_portfolio_heat {
            warn!("⚠️  Portfolio heat exceeded: {:.2}", risk_metrics.portfolio_heat);
            self.trigger_risk_alert("High portfolio heat").await?;
        }
        
        if context.portfolio.daily_pnl < -self.risk_config.max_daily_loss {
            error!("🚨 Daily loss limit exceeded: {}", context.portfolio.daily_pnl);
            self.trigger_emergency_stop("Daily loss limit exceeded").await?;
        }
        
        Ok(())
    }
    
    /// Calculate portfolio risk metrics
    async fn calculate_portfolio_risk(&self, context: &SystemContext) -> TradingResult<RiskMetrics> {
        // Simulate risk calculations
        let portfolio_value = context.portfolio.total_value.to_f64().unwrap_or(0.0);
        let daily_pnl = context.portfolio.daily_pnl.to_f64().unwrap_or(0.0);
        
        let portfolio_heat = if portfolio_value > 0.0 {
            (daily_pnl.abs() / portfolio_value).min(1.0)
        } else {
            0.0
        };
        
        // Simple VaR calculation (95% confidence)
        let var_95 = rust_decimal::Decimal::from_f64_retain(portfolio_value * 0.05).unwrap();
        let var_99 = rust_decimal::Decimal::from_f64_retain(portfolio_value * 0.02).unwrap();
        
        Ok(RiskMetrics {
            var_95,
            var_99,
            expected_shortfall: var_95 * rust_decimal::Decimal::from_f64_retain(1.2).unwrap(),
            max_position_size: self.risk_config.max_position_size,
            daily_loss_limit: self.risk_config.max_daily_loss,
            portfolio_heat,
        })
    }
    
    /// Trigger risk alert
    async fn trigger_risk_alert(&self, reason: &str) -> TradingResult<()> {
        let message = AgentMessage {
            from: self.base.id,
            to: uuid::Uuid::nil(), // Broadcast
            message_type: crate::core::types::MessageType::RiskAlert,
            payload: serde_json::json!({ "reason": reason }),
            timestamp: chrono::Utc::now(),
        };
        
        self.base.send_message(message).await?;
        Ok(())
    }
    
    /// Trigger emergency stop
    async fn trigger_emergency_stop(&self, reason: &str) -> TradingResult<()> {
        error!("🚨 EMERGENCY STOP: {}", reason);
        
        let message = AgentMessage {
            from: self.base.id,
            to: uuid::Uuid::nil(), // Broadcast
            message_type: crate::core::types::MessageType::EmergencyShutdown,
            payload: serde_json::json!({ "reason": reason }),
            timestamp: chrono::Utc::now(),
        };
        
        self.base.send_message(message).await?;
        Ok(())
    }
}

#[async_trait]
impl AutonomousAgent for RiskManagementAgent {
    async fn execute_mission(&self, context: &SystemContext) -> TradingResult<AgentResult> {
        info!("🛡️  Risk Management executing mission...");
        
        let risk_metrics = self.calculate_portfolio_risk(context).await?;
        
        Ok(AgentResult {
            success: true,
            signals: Vec::new(), // Risk agent doesn't generate trading signals
            metrics: context.performance_metrics.clone(),
            recommendations: vec![
                format!("Portfolio heat: {:.2}%", risk_metrics.portfolio_heat * 100.0),
                format!("VaR (95%): ${}", risk_metrics.var_95),
            ],
            errors: Vec::new(),
        })
    }
    
    async fn self_evaluate(&self) -> TradingResult<PerformanceMetrics> {
        let context = self.base.get_system_context().await;
        Ok(context.performance_metrics)
    }
    
    async fn evolve_strategy(&mut self, feedback: &SystemFeedback) -> TradingResult<EvolutionResult> {
        info!("🧬 Risk agent evolving strategy...");
        
        let mut new_parameters = std::collections::HashMap::new();
        
        if feedback.performance_score < 0.4 {
            // Tighten risk controls
            new_parameters.insert(
                "max_portfolio_heat".to_string(),
                serde_json::Value::Number(serde_json::Number::from_f64(0.6).unwrap()),
            );
        }
        
        Ok(EvolutionResult {
            strategy_updated: !new_parameters.is_empty(),
            new_parameters,
            performance_improvement: 0.05,
            confidence: 0.9,
        })
    }
    
    async fn generate_code(&self, requirements: &Requirements) -> TradingResult<CodeGeneration> {
        info!("🔧 Risk agent generating code for: {}", requirements.functionality);
        
        let code = format!(
            "// Risk management code for: {}\nuse rust_decimal::Decimal;\n\npub fn calculate_{}(portfolio_value: Decimal) -> Decimal {{\n    // Risk calculation implementation\n    portfolio_value * Decimal::from_f64_retain(0.05).unwrap()\n}}",
            requirements.functionality,
            requirements.functionality.to_lowercase().replace(' ', "_")
        );
        
        Ok(CodeGeneration {
            code,
            language: "rust".to_string(),
            tests: vec!["#[test] fn test_risk_calc() { assert!(calculate_test(Decimal::from(100)) > Decimal::ZERO); }".to_string()],
            documentation: format!("Risk calculation function for {}", requirements.functionality),
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
        info!("🛡️  Risk Management starting execution loop...");
        
        let mut monitoring_interval = interval(Duration::from_millis(self.config.monitoring_interval_ms));
        
        loop {
            tokio::select! {
                _ = monitoring_interval.tick() => {
                    if let Err(e) = self.monitor_risk().await {
                        error!("Risk monitoring error: {}", e);
                    }
                }
                _ = tokio::time::sleep(Duration::from_millis(10)) => {
                    if self.base.should_shutdown().await {
                        break;
                    }
                }
            }
        }
        
        info!("🛡️  Risk Management execution loop ended");
        Ok(())
    }
    
    async fn shutdown(&mut self) -> TradingResult<()> {
        info!("🛑 Risk Management shutting down...");
        self.base.request_shutdown().await;
        Ok(())
    }
}

#[async_trait]
impl RiskManager for RiskManagementAgent {
    async fn calculate_risk(&self) -> TradingResult<RiskMetrics> {
        let context = self.base.get_system_context().await;
        self.calculate_portfolio_risk(&context).await
    }
    
    async fn validate_trade(&self, signal: &TradingSignal) -> TradingResult<RiskValidation> {
        info!("🔍 Validating trade for {}", signal.symbol);
        
        let context = self.base.get_system_context().await;
        let risk_metrics = self.calculate_portfolio_risk(&context).await?;
        
        // Simple risk validation
        let approved = risk_metrics.portfolio_heat < self.risk_config.max_portfolio_heat;
        let risk_score = risk_metrics.portfolio_heat;
        
        Ok(RiskValidation {
            approved,
            risk_score,
            position_size_adjustment: if approved { 1.0 } else { 0.5 },
            warnings: if approved { 
                Vec::new() 
            } else { 
                vec!["High portfolio heat - reducing position size".to_string()] 
            },
            required_hedges: Vec::new(),
        })
    }
    
    async fn generate_hedges(&self) -> TradingResult<Vec<HedgeRecommendation>> {
        info!("🛡️  Generating hedge recommendations...");
        
        let context = self.base.get_system_context().await;
        let mut hedges = Vec::new();
        
        // Simple hedge generation based on portfolio exposure
        if context.active_positions > 5 {
            hedges.push(HedgeRecommendation {
                instrument: "SPY".to_string(),
                action: "sell".to_string(),
                quantity: 10.0,
                reasoning: "Hedge against market exposure".to_string(),
                urgency: 0.6,
            });
        }
        
        Ok(hedges)
    }
}
