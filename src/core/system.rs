//! Main trading system orchestrator

use anyhow::Result;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use tokio::time::{interval, Duration};
use tracing::{info, warn, error};

use crate::core::ai_thoughts::AIThoughtBroadcaster;
use crate::core::config::SystemConfig;
use crate::core::errors::{TradingError, TradingResult};
use crate::core::types::{
    AgentId, AgentMessage, AgentType, SystemContext, SystemHealth, 
    Portfolio, RiskMetrics, PerformanceMetrics, MarketRegime
};
use crate::core::metrics::MetricsCollector;
use crate::agents::coordinator::MasterCoordinatorAgent;
use crate::agents::intelligence::MarketIntelligenceAgent;
use crate::agents::risk::RiskManagementAgent;
use crate::agents::execution::ExecutionEngineAgent;
use crate::agents::learning::LearningEngineAgent;
use crate::agents::traits::AutonomousAgent;

/// Main trading system that orchestrates all agents
pub struct TradingSystem {
    config: SystemConfig,
    agents: AgentRegistry,
    message_bus: MessageBus,
    system_context: Arc<RwLock<SystemContext>>,
    shutdown_signal: Arc<RwLock<bool>>,
    thought_broadcaster: AIThoughtBroadcaster,
}

/// Registry of all active agents
struct AgentRegistry {
    coordinator: Option<MasterCoordinatorAgent>,
    intelligence: Option<MarketIntelligenceAgent>,
    risk_management: Option<RiskManagementAgent>,
    execution: Option<ExecutionEngineAgent>,
    learning: Option<LearningEngineAgent>,
}

/// Message bus for inter-agent communication
struct MessageBus {
    sender: mpsc::UnboundedSender<AgentMessage>,
    receiver: Arc<RwLock<mpsc::UnboundedReceiver<AgentMessage>>>,
}

impl TradingSystem {
    /// Create a new trading system with the given configuration
    pub async fn new(config: SystemConfig) -> TradingResult<Self> {
        info!("🏗️  Initializing trading system...");
        
        // Validate configuration
        config.validate().map_err(TradingError::Config)?;
        
        // Create message bus
        let (sender, receiver) = mpsc::unbounded_channel();
        let message_bus = MessageBus {
            sender,
            receiver: Arc::new(RwLock::new(receiver)),
        };
        
        // Initialize system context
        let system_context = Arc::new(RwLock::new(SystemContext {
            market_regime: MarketRegime::Sideways,
            portfolio: Portfolio {
                total_value: config.trading.initial_capital,
                cash_balance: config.trading.initial_capital,
                positions: Default::default(),
                daily_pnl: Default::default(),
                total_pnl: Default::default(),
                max_drawdown: Default::default(),
                sharpe_ratio: None,
                last_updated: chrono::Utc::now(),
            },
            risk_metrics: RiskMetrics {
                var_95: Default::default(),
                var_99: Default::default(),
                expected_shortfall: Default::default(),
                max_position_size: config.risk.max_position_size,
                daily_loss_limit: config.risk.max_daily_loss,
                portfolio_heat: 0.0,
            },
            performance_metrics: PerformanceMetrics {
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
            available_capital: config.trading.initial_capital,
            system_health: SystemHealth::Healthy,
        }));
        
        // Initialize agent registry
        let agents = AgentRegistry {
            coordinator: None,
            intelligence: None,
            risk_management: None,
            execution: None,
            learning: None,
        };
        
        // Initialize AI thought broadcaster
        let thought_broadcaster = AIThoughtBroadcaster::new(1000); // Keep 1000 recent thoughts

        let system = Self {
            config,
            agents,
            message_bus,
            system_context,
            shutdown_signal: Arc::new(RwLock::new(false)),
            thought_broadcaster,
        };
        
        info!("✅ Trading system initialized successfully");
        Ok(system)
    }
    
    /// Start all enabled agents
    pub async fn start(&mut self) -> TradingResult<()> {
        info!("🚀 Starting trading system agents...");
        
        // Start master coordinator if enabled
        if self.config.agents.master_coordinator.enabled {
            info!("🎯 Starting Master Coordinator Agent...");
            let coordinator = MasterCoordinatorAgent::new(
                self.config.agents.master_coordinator.clone(),
                self.message_bus.sender.clone(),
                self.system_context.clone(),
            ).await?;
            self.agents.coordinator = Some(coordinator);
        }
        
        // Start market intelligence agent if enabled
        if self.config.agents.market_intelligence.enabled {
            info!("📊 Starting Market Intelligence Agent...");
            let intelligence = MarketIntelligenceAgent::new(
                self.config.agents.market_intelligence.clone(),
                self.config.api.clone(),
                self.message_bus.sender.clone(),
            ).await?;
            self.agents.intelligence = Some(intelligence);
        }
        
        // Start risk management agent if enabled
        if self.config.agents.risk_management.enabled {
            info!("🛡️  Starting Risk Management Agent...");
            let risk_agent = RiskManagementAgent::new(
                self.config.agents.risk_management.clone(),
                self.config.risk.clone(),
                self.message_bus.sender.clone(),
                self.system_context.clone(),
            ).await?;
            self.agents.risk_management = Some(risk_agent);
        }
        
        // Start execution engine if enabled
        if self.config.agents.execution_engine.enabled {
            info!("⚡ Starting Execution Engine Agent...");
            let execution = ExecutionEngineAgent::new(
                self.config.agents.execution_engine.clone(),
                self.config.api.clone(),
                self.message_bus.sender.clone(),
            ).await?;
            self.agents.execution = Some(execution);
        }
        
        // Start learning engine if enabled
        if self.config.agents.learning_engine.enabled {
            info!("🧠 Starting Learning Engine Agent...");
            let learning = LearningEngineAgent::new(
                self.config.agents.learning_engine.clone(),
                self.message_bus.sender.clone(),
                self.system_context.clone(),
                self.thought_broadcaster.clone(),
            ).await?;
            self.agents.learning = Some(learning);
        }
        
        info!("✅ All agents started successfully");
        Ok(())
    }
    
    /// Main system execution loop
    pub async fn run(&mut self) -> TradingResult<()> {
        info!("🏃 Starting main system execution loop...");
        
        // Start message processing task
        let message_receiver = self.message_bus.receiver.clone();
        let system_context = self.system_context.clone();
        let shutdown_signal = self.shutdown_signal.clone();
        
        let message_task = tokio::spawn(async move {
            Self::process_messages(message_receiver, system_context, shutdown_signal).await
        });
        
        // Start system monitoring task
        let monitoring_task = tokio::spawn({
            let system_context = self.system_context.clone();
            let shutdown_signal = self.shutdown_signal.clone();
            async move {
                Self::monitor_system_health(system_context, shutdown_signal).await
            }
        });
        
        // Start agents
        let mut agent_tasks = Vec::new();
        
        if let Some(ref mut coordinator) = self.agents.coordinator {
            let task = tokio::spawn({
                let mut agent = coordinator.clone();
                async move { agent.run().await }
            });
            agent_tasks.push(task);
        }
        
        if let Some(ref mut intelligence) = self.agents.intelligence {
            let task = tokio::spawn({
                let mut agent = intelligence.clone();
                async move { agent.run().await }
            });
            agent_tasks.push(task);
        }
        
        if let Some(ref mut risk_agent) = self.agents.risk_management {
            let task = tokio::spawn({
                let mut agent = risk_agent.clone();
                async move { agent.run().await }
            });
            agent_tasks.push(task);
        }
        
        if let Some(ref mut execution) = self.agents.execution {
            let task = tokio::spawn({
                let mut agent = execution.clone();
                async move { agent.run().await }
            });
            agent_tasks.push(task);
        }
        
        if let Some(ref mut learning) = self.agents.learning {
            let task = tokio::spawn({
                let mut agent = learning.clone();
                async move { agent.run().await }
            });
            agent_tasks.push(task);
        }
        
        // Wait for shutdown signal or task completion
        tokio::select! {
            _ = futures::future::join_all(agent_tasks) => {
                info!("All agent tasks completed");
            }
            _ = message_task => {
                info!("Message processing task completed");
            }
            _ = monitoring_task => {
                info!("System monitoring task completed");
            }
        }
        
        Ok(())
    }
    
    /// Gracefully shutdown the system
    pub async fn shutdown(&mut self) -> TradingResult<()> {
        info!("🛑 Initiating system shutdown...");
        
        // Set shutdown signal
        {
            let mut shutdown = self.shutdown_signal.write().await;
            *shutdown = true;
        }
        
        // Shutdown agents in reverse order
        if let Some(ref mut learning) = self.agents.learning {
            learning.shutdown().await?;
        }
        
        if let Some(ref mut execution) = self.agents.execution {
            execution.shutdown().await?;
        }
        
        if let Some(ref mut risk_agent) = self.agents.risk_management {
            risk_agent.shutdown().await?;
        }
        
        if let Some(ref mut intelligence) = self.agents.intelligence {
            intelligence.shutdown().await?;
        }
        
        if let Some(ref mut coordinator) = self.agents.coordinator {
            coordinator.shutdown().await?;
        }
        
        info!("✅ System shutdown completed");
        Ok(())
    }

    /// Get the AI thought broadcaster for external access
    pub fn thought_broadcaster(&self) -> &AIThoughtBroadcaster {
        &self.thought_broadcaster
    }
    
    /// Process inter-agent messages
    async fn process_messages(
        receiver: Arc<RwLock<mpsc::UnboundedReceiver<AgentMessage>>>,
        system_context: Arc<RwLock<SystemContext>>,
        shutdown_signal: Arc<RwLock<bool>>,
    ) -> TradingResult<()> {
        info!("📨 Starting message processing loop...");
        
        loop {
            // Check shutdown signal
            {
                let shutdown = shutdown_signal.read().await;
                if *shutdown {
                    break;
                }
            }
            
            // Process messages
            let message = {
                let mut rx = receiver.write().await;
                rx.recv().await
            };
            
            match message {
                Some(msg) => {
                    MetricsCollector::record_agent_message();
                    
                    match msg.message_type {
                        crate::core::types::MessageType::EmergencyShutdown => {
                            error!("🚨 Emergency shutdown requested: {:?}", msg.payload);
                            let mut shutdown = shutdown_signal.write().await;
                            *shutdown = true;
                            break;
                        }
                        _ => {
                            // Route message to appropriate handler
                            Self::route_message(msg, &system_context).await?;
                        }
                    }
                }
                None => {
                    // Channel closed, exit loop
                    break;
                }
            }
        }
        
        info!("📨 Message processing loop ended");
        Ok(())
    }
    
    /// Route messages to appropriate handlers
    async fn route_message(
        message: AgentMessage,
        system_context: &Arc<RwLock<SystemContext>>,
    ) -> TradingResult<()> {
        match message.message_type {
            crate::core::types::MessageType::PerformanceUpdate => {
                // Update system context with performance data
                if let Ok(metrics) = serde_json::from_value::<PerformanceMetrics>(message.payload) {
                    let mut context = system_context.write().await;
                    context.performance_metrics = metrics;
                }
            }
            crate::core::types::MessageType::RiskAlert => {
                warn!("🚨 Risk alert received: {:?}", message.payload);
                MetricsCollector::record_system_error();
            }
            _ => {
                // Handle other message types as needed
            }
        }
        
        Ok(())
    }
    
    /// Monitor system health and update metrics
    async fn monitor_system_health(
        system_context: Arc<RwLock<SystemContext>>,
        shutdown_signal: Arc<RwLock<bool>>,
    ) -> TradingResult<()> {
        info!("🏥 Starting system health monitoring...");
        
        let mut interval = interval(Duration::from_secs(10)); // Monitor every 10 seconds
        
        loop {
            interval.tick().await;
            
            // Check shutdown signal
            {
                let shutdown = shutdown_signal.read().await;
                if *shutdown {
                    break;
                }
            }
            
            // Update metrics
            {
                let context = system_context.read().await;
                
                MetricsCollector::update_portfolio_metrics(
                    context.portfolio.total_value,
                    context.portfolio.cash_balance,
                    context.portfolio.daily_pnl,
                    context.portfolio.total_pnl,
                    context.active_positions,
                );
                
                MetricsCollector::update_risk_metrics(
                    context.risk_metrics.portfolio_heat,
                    context.portfolio.max_drawdown,
                    context.risk_metrics.var_95,
                );
            }
        }
        
        info!("🏥 System health monitoring ended");
        Ok(())
    }
}

impl MessageBus {
    /// Send a message to all agents
    pub fn broadcast(&self, message: AgentMessage) -> TradingResult<()> {
        self.sender.send(message)
            .map_err(|_| TradingError::agent_communication("Failed to send message"))?;
        Ok(())
    }
}
