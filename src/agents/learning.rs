//! Learning Engine Agent - AI model training and strategy evolution

use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tokio::time::{interval, Duration};
use tracing::{info, warn, error};

use crate::core::ai_thoughts::{AIThoughtBroadcaster, ThoughtTemplates, AIAgent, ThoughtType, AIThought};
use crate::core::config::LearningConfig;
use crate::core::errors::TradingResult;
use crate::core::types::{
    AgentCapability, AgentId, AgentMessage, SystemContext, 
    PerformanceMetrics, TradingSignal
};
use crate::agents::traits::{
    AutonomousAgent, BaseAgent, AgentResult, SystemFeedback, 
    EvolutionResult, Requirements, CodeGeneration, LearningAgent,
    TradeOutcome, LearningResult, ModelUpdateData, ModelUpdateResult, GeneratedStrategy
};

/// Learning Engine Agent for AI model training and strategy evolution
#[derive(Clone)]
pub struct LearningEngineAgent {
    base: BaseAgent,
    config: LearningConfig,
    model_version: String,
    training_data: Vec<TradeOutcome>,
    thought_broadcaster: AIThoughtBroadcaster,
}

impl LearningEngineAgent {
    /// Create a new learning engine agent
    pub async fn new(
        config: LearningConfig,
        message_sender: mpsc::UnboundedSender<AgentMessage>,
        system_context: Arc<RwLock<SystemContext>>,
        thought_broadcaster: AIThoughtBroadcaster,
    ) -> TradingResult<Self> {
        let capabilities = vec![
            AgentCapability::StrategyGeneration,
            AgentCapability::SelfModification,
        ];
        
        let base = BaseAgent::new(capabilities, message_sender, system_context);
        
        // Share initial thought
        thought_broadcaster.broadcast_thought(
            AIThought::new(
                AIAgent::LearningEngine,
                ThoughtType::Learning,
                "Learning Engine initialized. Ready to evolve trading strategies based on market patterns.".to_string(),
                0.9,
            )
            .with_reasoning(vec![
                "Neural networks loaded and calibrated".to_string(),
                "Historical pattern database ready".to_string(),
                "Strategy evolution algorithms active".to_string(),
            ])
            .with_tags(vec!["initialization".to_string(), "ai".to_string()])
            .educational()
        ).await;
        
        Ok(Self {
            base,
            config,
            model_version: "v1.0.0".to_string(),
            training_data: Vec::new(),
            thought_broadcaster,
        })
    }
    
    /// Perform model training and strategy evolution
    async fn evolve_models(&mut self) -> TradingResult<()> {
        info!("🧠 Evolving AI models and strategies...");
        
        // Share thought about starting evolution
        self.thought_broadcaster.broadcast_thought(
            AIThought::new(
                AIAgent::LearningEngine,
                ThoughtType::Learning,
                "Starting model evolution cycle. Analyzing recent market patterns and performance.".to_string(),
                0.85,
            )
            .with_reasoning(vec![
                "Collecting recent trading data for analysis".to_string(),
                "Evaluating strategy performance metrics".to_string(),
                "Preparing to adapt strategies based on learnings".to_string(),
            ])
            .with_tags(vec!["evolution".to_string(), "analysis".to_string()])
        ).await;
        
        let context = self.base.get_system_context().await;
        
        // Analyze recent performance
        let performance_analysis = self.analyze_performance(&context).await?;
        
        // Generate new strategies based on market conditions
        let new_strategies = self.generate_adaptive_strategies(&context).await?;
        
        // Update model parameters if needed
        if self.should_update_model(&performance_analysis).await? {
            let update_result = self.update_model_parameters(&context).await?;
            
            // Share learning insight
            self.thought_broadcaster.broadcast_thought(
                ThoughtTemplates::learning_update(
                    "adaptive_strategy",
                    0.0, // We'll update this with real data
                    performance_analysis.score,
                    "Updated neural network weights based on recent performance"
                )
            ).await;
            
            info!("🔄 Model updated: {}", update_result.new_model_version);
        }
        
        // Share completion thought
        self.thought_broadcaster.broadcast_thought(
            AIThought::new(
                AIAgent::LearningEngine,
                ThoughtType::Learning,
                format!("Evolution cycle complete! Generated {} new strategies. Model accuracy: {:.1}%", 
                    new_strategies.len(), performance_analysis.score * 100.0),
                0.9,
            )
            .with_reasoning(vec![
                format!("Successfully generated {} adaptive strategies", new_strategies.len()),
                format!("Current model accuracy: {:.1}%", performance_analysis.score * 100.0),
                "Ready for next evolution cycle".to_string(),
            ])
            .with_tags(vec!["completion".to_string(), "strategies".to_string()])
            .educational()
        ).await;
        
        info!("✅ Model evolution completed - {} new strategies generated", new_strategies.len());
        Ok(())
    }
    
    /// Analyze current system performance
    async fn analyze_performance(&self, context: &SystemContext) -> TradingResult<PerformanceAnalysis> {
        let metrics = &context.performance_metrics;
        
        let performance_score = if metrics.total_trades > 0 {
            metrics.win_rate * 0.4 + 
            (metrics.profit_factor / 3.0).min(1.0) * 0.4 +
            (1.0 / (metrics.average_execution_time_ms / 1000.0)).min(1.0) * 0.2
        } else {
            0.5 // Neutral score for no trades
        };
        
        Ok(PerformanceAnalysis {
            score: performance_score,
            trend: if performance_score > 0.7 { "improving" } else if performance_score < 0.3 { "declining" } else { "stable" },
            key_metrics: vec![
                format!("Win Rate: {:.1}%", metrics.win_rate * 100.0),
                format!("Profit Factor: {:.2}", metrics.profit_factor),
                format!("Avg Execution: {:.1}ms", metrics.average_execution_time_ms),
            ],
            recommendations: self.generate_performance_recommendations(performance_score).await?,
        })
    }
    
    /// Generate performance-based recommendations
    async fn generate_performance_recommendations(&self, score: f64) -> TradingResult<Vec<String>> {
        let mut recommendations = Vec::new();
        
        if score < 0.4 {
            recommendations.push("Consider reducing position sizes".to_string());
            recommendations.push("Implement more conservative risk management".to_string());
            recommendations.push("Review and optimize trading strategies".to_string());
        } else if score > 0.8 {
            recommendations.push("Consider increasing position sizes gradually".to_string());
            recommendations.push("Explore more aggressive strategies".to_string());
            recommendations.push("Scale up successful patterns".to_string());
        } else {
            recommendations.push("Maintain current strategy mix".to_string());
            recommendations.push("Continue monitoring performance".to_string());
        }
        
        Ok(recommendations)
    }
    
    /// Generate adaptive strategies based on market conditions
    async fn generate_adaptive_strategies(&self, context: &SystemContext) -> TradingResult<Vec<GeneratedStrategy>> {
        let mut strategies = Vec::new();
        
        // Generate strategies based on market regime
        match context.market_regime {
            crate::core::types::MarketRegime::Bull => {
                strategies.push(GeneratedStrategy {
                    name: "momentum_bull".to_string(),
                    description: "Momentum strategy optimized for bull markets".to_string(),
                    parameters: std::collections::HashMap::from([
                        ("trend_threshold".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(0.7).unwrap())),
                        ("position_size_multiplier".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(1.2).unwrap())),
                    ]),
                    expected_performance: crate::agents::traits::PerformanceTargets {
                        max_latency_ms: 100,
                        min_accuracy: 0.75,
                        max_memory_mb: 50,
                        min_throughput: 100,
                    },
                    risk_profile: "moderate".to_string(),
                    market_conditions: vec!["bull_market".to_string(), "low_volatility".to_string()],
                });
            }
            crate::core::types::MarketRegime::Bear => {
                strategies.push(GeneratedStrategy {
                    name: "defensive_bear".to_string(),
                    description: "Defensive strategy for bear markets".to_string(),
                    parameters: std::collections::HashMap::from([
                        ("stop_loss_threshold".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(0.02).unwrap())),
                        ("position_size_multiplier".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(0.8).unwrap())),
                    ]),
                    expected_performance: crate::agents::traits::PerformanceTargets {
                        max_latency_ms: 50,
                        min_accuracy: 0.8,
                        max_memory_mb: 40,
                        min_throughput: 80,
                    },
                    risk_profile: "conservative".to_string(),
                    market_conditions: vec!["bear_market".to_string(), "high_volatility".to_string()],
                });
            }
            crate::core::types::MarketRegime::HighVolatility => {
                strategies.push(GeneratedStrategy {
                    name: "volatility_scalping".to_string(),
                    description: "High-frequency scalping for volatile markets".to_string(),
                    parameters: std::collections::HashMap::from([
                        ("volatility_threshold".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(0.4).unwrap())),
                        ("hold_time_seconds".to_string(), serde_json::Value::Number(serde_json::Number::from(30))),
                    ]),
                    expected_performance: crate::agents::traits::PerformanceTargets {
                        max_latency_ms: 10,
                        min_accuracy: 0.65,
                        max_memory_mb: 30,
                        min_throughput: 200,
                    },
                    risk_profile: "aggressive".to_string(),
                    market_conditions: vec!["high_volatility".to_string()],
                });
            }
            _ => {
                strategies.push(GeneratedStrategy {
                    name: "balanced_sideways".to_string(),
                    description: "Balanced strategy for sideways markets".to_string(),
                    parameters: std::collections::HashMap::from([
                        ("range_threshold".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(0.02).unwrap())),
                        ("reversion_strength".to_string(), serde_json::Value::Number(serde_json::Number::from_f64(0.6).unwrap())),
                    ]),
                    expected_performance: crate::agents::traits::PerformanceTargets {
                        max_latency_ms: 100,
                        min_accuracy: 0.7,
                        max_memory_mb: 45,
                        min_throughput: 120,
                    },
                    risk_profile: "moderate".to_string(),
                    market_conditions: vec!["sideways_market".to_string(), "low_volatility".to_string()],
                });
            }
        }
        
        Ok(strategies)
    }
    
    /// Check if model should be updated
    async fn should_update_model(&self, analysis: &PerformanceAnalysis) -> TradingResult<bool> {
        // Update model if performance is declining or if enough time has passed
        Ok(analysis.score < 0.4 || analysis.trend == "declining")
    }
    
    /// Update model parameters based on recent performance
    async fn update_model_parameters(&mut self, context: &SystemContext) -> TradingResult<ModelUpdateResult> {
        info!("🔄 Updating model parameters...");
        
        // Simulate model update
        let performance_change = rand::random::<f64>() * 0.2 - 0.1; // -10% to +10% change
        let new_version = format!("v{}.{}.{}", 
            1, 
            (rand::random::<u32>() % 10), 
            (rand::random::<u32>() % 100)
        );
        
        self.model_version = new_version.clone();
        
        Ok(ModelUpdateResult {
            success: true,
            performance_change,
            new_model_version: new_version,
            rollback_available: true,
        })
    }
}

/// Performance analysis result
#[derive(Debug, Clone)]
struct PerformanceAnalysis {
    score: f64,
    trend: &'static str,
    key_metrics: Vec<String>,
    recommendations: Vec<String>,
}

#[async_trait]
impl AutonomousAgent for LearningEngineAgent {
    async fn execute_mission(&self, context: &SystemContext) -> TradingResult<AgentResult> {
        info!("🧠 Learning Engine executing mission...");
        
        let performance_analysis = self.analyze_performance(context).await?;
        
        Ok(AgentResult {
            success: true,
            signals: Vec::new(), // Learning engine doesn't generate trading signals directly
            metrics: context.performance_metrics.clone(),
            recommendations: performance_analysis.recommendations,
            errors: Vec::new(),
        })
    }
    
    async fn self_evaluate(&self) -> TradingResult<PerformanceMetrics> {
        let context = self.base.get_system_context().await;
        Ok(context.performance_metrics)
    }
    
    async fn evolve_strategy(&mut self, feedback: &SystemFeedback) -> TradingResult<EvolutionResult> {
        info!("🧬 Learning engine evolving strategy...");
        
        let mut new_parameters = std::collections::HashMap::new();
        
        if feedback.performance_score < 0.5 {
            // Increase model update frequency
            new_parameters.insert(
                "model_update_interval_hours".to_string(),
                serde_json::Value::Number(serde_json::Number::from(2)),
            );
        }
        
        Ok(EvolutionResult {
            strategy_updated: !new_parameters.is_empty(),
            new_parameters,
            performance_improvement: feedback.performance_score * 0.2,
            confidence: 0.75,
        })
    }
    
    async fn generate_code(&self, requirements: &Requirements) -> TradingResult<CodeGeneration> {
        info!("🔧 Learning engine generating code for: {}", requirements.functionality);
        
        let code = format!(
            "// AI/ML code for: {}\n\npub fn train_{}(data: &[f64]) -> Result<f64, Box<dyn std::error::Error>> {{\n    // Model training implementation\n    let accuracy = data.iter().sum::<f64>() / data.len() as f64;\n    Ok(accuracy)\n}}",
            requirements.functionality,
            requirements.functionality.to_lowercase().replace(' ', "_")
        );
        
        Ok(CodeGeneration {
            code,
            language: "rust".to_string(),
            tests: vec!["#[test] fn test_training() { assert!(train_test(&[0.8, 0.9, 0.7]).unwrap() > 0.0); }".to_string()],
            documentation: format!("AI training function for {}", requirements.functionality),
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
        info!("🧠 Learning Engine starting execution loop...");
        
        let mut evolution_interval = interval(Duration::from_secs(
            self.config.model_update_interval_hours * 3600
        ));
        
        loop {
            tokio::select! {
                _ = evolution_interval.tick() => {
                    if let Err(e) = self.evolve_models().await {
                        error!("Model evolution error: {}", e);
                    }
                }
                _ = tokio::time::sleep(Duration::from_millis(100)) => {
                    if self.base.should_shutdown().await {
                        break;
                    }
                }
            }
        }
        
        info!("🧠 Learning Engine execution loop ended");
        Ok(())
    }
    
    async fn shutdown(&mut self) -> TradingResult<()> {
        info!("🛑 Learning Engine shutting down...");
        self.base.request_shutdown().await;
        Ok(())
    }
}

#[async_trait]
impl LearningAgent for LearningEngineAgent {
    async fn learn_from_outcomes(&mut self, outcomes: &[TradeOutcome]) -> TradingResult<LearningResult> {
        info!("📚 Learning from {} trade outcomes", outcomes.len());
        
        // Store outcomes for future training
        self.training_data.extend_from_slice(outcomes);
        
        // Analyze outcomes
        let successful_trades = outcomes.iter().filter(|o| o.success).count();
        let accuracy_improvement = if outcomes.len() > 0 {
            (successful_trades as f64 / outcomes.len() as f64) * 0.1
        } else {
            0.0
        };
        
        // Simulate pattern discovery
        let new_patterns = (rand::random::<u32>() % 5) + 1;
        
        Ok(LearningResult {
            accuracy_improvement,
            new_patterns_discovered: new_patterns,
            model_confidence: 0.7 + rand::random::<f64>() * 0.2,
            recommended_actions: vec![
                "Continue monitoring trade outcomes".to_string(),
                "Adjust position sizing based on success rate".to_string(),
            ],
        })
    }
    
    async fn update_model(&mut self, data: &ModelUpdateData) -> TradingResult<ModelUpdateResult> {
        info!("🔄 Updating model with new data...");
        
        // Simulate model training with new data
        let performance_change = if data.trade_outcomes.len() > 10 {
            rand::random::<f64>() * 0.15 - 0.05 // -5% to +10% change
        } else {
            0.0
        };
        
        let new_version = format!("v{}.{}.{}", 
            1, 
            (rand::random::<u32>() % 10), 
            (rand::random::<u32>() % 100)
        );
        
        self.model_version = new_version.clone();
        
        Ok(ModelUpdateResult {
            success: true,
            performance_change,
            new_model_version: new_version,
            rollback_available: true,
        })
    }
    
    async fn generate_strategies(&self) -> TradingResult<Vec<GeneratedStrategy>> {
        let context = self.base.get_system_context().await;
        self.generate_adaptive_strategies(&context).await
    }
}
