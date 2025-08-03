//! AI Thought Stream - Real-time AI decision transparency
//! 
//! This module provides complete transparency into AI decision-making process,
//! allowing users to see exactly what their AI trader is thinking and why.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::broadcast;
use tracing::{info, warn};
use uuid::Uuid;

use crate::core::types::AgentId;

/// Types of AI thoughts for categorization
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ThoughtType {
    /// Market pattern recognition and analysis
    Analysis,
    /// Trading decision making
    Decision,
    /// Learning from past trades
    Learning,
    /// Risk assessment and management
    RiskCheck,
    /// New pattern discovered
    PatternFound,
    /// Strategy adjustment
    StrategyUpdate,
    /// Execution reasoning
    Execution,
    /// Portfolio rebalancing
    Rebalancing,
    /// Market sentiment analysis
    Sentiment,
    /// Educational insight for user
    Educational,
}

/// AI agent types for thought attribution
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AIAgent {
    MarketIntelligence,
    RiskManager,
    LearningEngine,
    MasterCoordinator,
    ExecutionEngine,
}

/// Confidence levels for AI decisions
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ConfidenceLevel {
    VeryLow,    // 0-20%
    Low,        // 20-40%
    Medium,     // 40-60%
    High,       // 60-80%
    VeryHigh,   // 80-100%
}

impl From<f64> for ConfidenceLevel {
    fn from(confidence: f64) -> Self {
        match confidence {
            c if c < 0.2 => ConfidenceLevel::VeryLow,
            c if c < 0.4 => ConfidenceLevel::Low,
            c if c < 0.6 => ConfidenceLevel::Medium,
            c if c < 0.8 => ConfidenceLevel::High,
            _ => ConfidenceLevel::VeryHigh,
        }
    }
}

/// Core AI thought structure - everything the AI is thinking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIThought {
    /// Unique identifier for the thought
    pub id: String,
    /// When the AI had this thought
    pub timestamp: DateTime<Utc>,
    /// Which AI agent generated this thought
    pub agent: AIAgent,
    /// Type of thought (analysis, decision, etc.)
    pub thought_type: ThoughtType,
    /// Main message - what the AI is thinking
    pub message: String,
    /// AI's confidence in this thought (0.0 to 1.0)
    pub confidence: f64,
    /// Confidence level for easier UI display
    pub confidence_level: ConfidenceLevel,
    /// Step-by-step reasoning behind the thought
    pub reasoning: Vec<String>,
    /// Supporting data and metrics
    pub supporting_data: HashMap<String, serde_json::Value>,
    /// Market symbols this thought relates to
    pub symbols: Vec<String>,
    /// Tags for categorization and filtering
    pub tags: Vec<String>,
    /// Potential impact on portfolio (Low/Medium/High)
    pub impact_level: String,
    /// Is this thought educational for the user?
    pub educational: bool,
    /// Follow-up actions the AI plans to take
    pub planned_actions: Vec<String>,
}

impl AIThought {
    /// Create a new AI thought
    pub fn new(
        agent: AIAgent,
        thought_type: ThoughtType,
        message: String,
        confidence: f64,
    ) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            timestamp: Utc::now(),
            agent,
            thought_type,
            message,
            confidence,
            confidence_level: confidence.into(),
            reasoning: Vec::new(),
            supporting_data: HashMap::new(),
            symbols: Vec::new(),
            tags: Vec::new(),
            impact_level: "Medium".to_string(),
            educational: false,
            planned_actions: Vec::new(),
        }
    }

    /// Add reasoning steps to the thought
    pub fn with_reasoning(mut self, reasoning: Vec<String>) -> Self {
        self.reasoning = reasoning;
        self
    }

    /// Add supporting data
    pub fn with_data(mut self, key: String, value: serde_json::Value) -> Self {
        self.supporting_data.insert(key, value);
        self
    }

    /// Add symbols this thought relates to
    pub fn with_symbols(mut self, symbols: Vec<String>) -> Self {
        self.symbols = symbols;
        self
    }

    /// Add tags for categorization
    pub fn with_tags(mut self, tags: Vec<String>) -> Self {
        self.tags = tags;
        self
    }

    /// Set impact level
    pub fn with_impact(mut self, impact: String) -> Self {
        self.impact_level = impact;
        self
    }

    /// Mark as educational content
    pub fn educational(mut self) -> Self {
        self.educational = true;
        self
    }

    /// Add planned actions
    pub fn with_actions(mut self, actions: Vec<String>) -> Self {
        self.planned_actions = actions;
        self
    }

    /// Generate user-friendly explanation
    pub fn to_user_explanation(&self) -> String {
        let emoji = match self.agent {
            AIAgent::MarketIntelligence => "🔍",
            AIAgent::RiskManager => "🛡️",
            AIAgent::LearningEngine => "🧠",
            AIAgent::MasterCoordinator => "🎯",
            AIAgent::ExecutionEngine => "⚡",
        };

        let confidence_emoji = match self.confidence_level {
            ConfidenceLevel::VeryHigh => "🟢",
            ConfidenceLevel::High => "🟡",
            ConfidenceLevel::Medium => "🟠",
            ConfidenceLevel::Low => "🔴",
            ConfidenceLevel::VeryLow => "⚫",
        };

        format!(
            "{} {} {}: {}",
            emoji,
            confidence_emoji,
            format!("{:?}", self.agent).replace("_", " "),
            self.message
        )
    }
}

/// AI Thought broadcaster for real-time streaming
#[derive(Clone)]
pub struct AIThoughtBroadcaster {
    sender: broadcast::Sender<AIThought>,
    thought_history: std::sync::Arc<tokio::sync::RwLock<Vec<AIThought>>>,
    max_history: usize,
}

impl AIThoughtBroadcaster {
    /// Create new thought broadcaster
    pub fn new(max_history: usize) -> Self {
        let (sender, _) = broadcast::channel(1000);
        
        Self {
            sender,
            thought_history: std::sync::Arc::new(tokio::sync::RwLock::new(Vec::new())),
            max_history,
        }
    }

    /// Broadcast a new AI thought
    pub async fn broadcast_thought(&self, thought: AIThought) {
        info!("🧠 AI Thought: {}", thought.to_user_explanation());

        // Add to history
        {
            let mut history = self.thought_history.write().await;
            history.push(thought.clone());
            
            // Keep only recent thoughts
            if history.len() > self.max_history {
                history.remove(0);
            }
        }

        // Broadcast to subscribers
        if let Err(e) = self.sender.send(thought) {
            warn!("Failed to broadcast AI thought: {}", e);
        }
    }

    /// Subscribe to AI thought stream
    pub fn subscribe(&self) -> broadcast::Receiver<AIThought> {
        self.sender.subscribe()
    }

    /// Get recent thought history
    pub async fn get_recent_thoughts(&self, limit: usize) -> Vec<AIThought> {
        let history = self.thought_history.read().await;
        let start = if history.len() > limit {
            history.len() - limit
        } else {
            0
        };
        history[start..].to_vec()
    }

    /// Get thoughts by agent
    pub async fn get_thoughts_by_agent(&self, agent: AIAgent, limit: usize) -> Vec<AIThought> {
        let history = self.thought_history.read().await;
        history
            .iter()
            .filter(|thought| thought.agent == agent)
            .rev()
            .take(limit)
            .cloned()
            .collect()
    }

    /// Get educational thoughts for user learning
    pub async fn get_educational_thoughts(&self, limit: usize) -> Vec<AIThought> {
        let history = self.thought_history.read().await;
        history
            .iter()
            .filter(|thought| thought.educational)
            .rev()
            .take(limit)
            .cloned()
            .collect()
    }
}

/// Pre-built thought templates for common scenarios
pub struct ThoughtTemplates;

impl ThoughtTemplates {
    /// Market pattern recognition thought
    pub fn pattern_recognition(
        symbol: &str,
        pattern_name: &str,
        confidence: f64,
        historical_success: f64,
    ) -> AIThought {
        AIThought::new(
            AIAgent::MarketIntelligence,
            ThoughtType::PatternFound,
            format!(
                "Detected {} pattern on {} with {:.1}% confidence. Historical success rate: {:.1}%",
                pattern_name, symbol, confidence * 100.0, historical_success * 100.0
            ),
            confidence,
        )
        .with_symbols(vec![symbol.to_string()])
        .with_reasoning(vec![
            format!("Pattern {} matches {} historical occurrences", pattern_name, (historical_success * 1000.0) as u32),
            format!("Current market conditions align with pattern requirements"),
            format!("Risk-reward ratio favorable for this setup"),
        ])
        .with_tags(vec!["pattern".to_string(), "technical_analysis".to_string()])
        .educational()
    }

    /// Risk management thought
    pub fn risk_assessment(
        current_risk: f64,
        max_risk: f64,
        action: &str,
    ) -> AIThought {
        let confidence = if current_risk < max_risk * 0.5 { 0.9 } else { 0.6 };
        
        AIThought::new(
            AIAgent::RiskManager,
            ThoughtType::RiskCheck,
            format!(
                "Portfolio risk at {:.1}% (limit: {:.1}%). Action: {}",
                current_risk * 100.0, max_risk * 100.0, action
            ),
            confidence,
        )
        .with_reasoning(vec![
            format!("Current portfolio heat: {:.2}%", current_risk * 100.0),
            format!("Maximum allowed risk: {:.2}%", max_risk * 100.0),
            format!("Risk buffer remaining: {:.2}%", (max_risk - current_risk) * 100.0),
        ])
        .with_tags(vec!["risk".to_string(), "portfolio".to_string()])
        .with_impact(if current_risk > max_risk * 0.8 { "High" } else { "Medium" }.to_string())
    }

    /// Learning from trade outcome
    pub fn learning_update(
        strategy_name: &str,
        trade_result: f64,
        new_accuracy: f64,
        adjustment: &str,
    ) -> AIThought {
        AIThought::new(
            AIAgent::LearningEngine,
            ThoughtType::Learning,
            format!(
                "Updated {} strategy. Trade result: {:.2}%. New accuracy: {:.1}%. Adjustment: {}",
                strategy_name, trade_result, new_accuracy * 100.0, adjustment
            ),
            0.85,
        )
        .with_reasoning(vec![
            format!("Trade outcome: {:.2}% return", trade_result),
            format!("Strategy accuracy improved to {:.1}%", new_accuracy * 100.0),
            format!("Applied learning: {}", adjustment),
            "Updated neural network weights based on outcome".to_string(),
        ])
        .with_tags(vec!["learning".to_string(), "strategy".to_string()])
        .educational()
    }

    /// Trading decision thought
    pub fn trading_decision(
        action: &str,
        symbol: &str,
        reasoning: &str,
        confidence: f64,
    ) -> AIThought {
        AIThought::new(
            AIAgent::MasterCoordinator,
            ThoughtType::Decision,
            format!("Decision: {} {} - {}", action, symbol, reasoning),
            confidence,
        )
        .with_symbols(vec![symbol.to_string()])
        .with_reasoning(vec![
            format!("Market analysis supports {} action", action),
            reasoning.to_string(),
            "Risk-reward ratio favorable".to_string(),
            "Execution timing optimal".to_string(),
        ])
        .with_tags(vec!["decision".to_string(), "trading".to_string()])
        .with_actions(vec![format!("Execute {} order for {}", action, symbol)])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_thought_creation() {
        let thought = AIThought::new(
            AIAgent::MarketIntelligence,
            ThoughtType::Analysis,
            "Test thought".to_string(),
            0.75,
        );

        assert_eq!(thought.agent, AIAgent::MarketIntelligence);
        assert_eq!(thought.confidence, 0.75);
        assert_eq!(thought.confidence_level, ConfidenceLevel::High);
    }

    #[tokio::test]
    async fn test_thought_broadcaster() {
        let broadcaster = AIThoughtBroadcaster::new(10);
        let mut receiver = broadcaster.subscribe();

        let thought = AIThought::new(
            AIAgent::RiskManager,
            ThoughtType::RiskCheck,
            "Risk check passed".to_string(),
            0.9,
        );

        broadcaster.broadcast_thought(thought.clone()).await;

        let received = receiver.recv().await.unwrap();
        assert_eq!(received.message, thought.message);
    }
}