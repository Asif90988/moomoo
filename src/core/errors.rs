//! Error types for the trading system

use thiserror::Error;

/// Main error type for the trading system
#[derive(Error, Debug)]
pub enum TradingError {
    #[error("Configuration error: {0}")]
    Config(#[from] anyhow::Error),

    #[error("API error: {0}")]
    Api(#[from] reqwest::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("WebSocket error: {0}")]
    WebSocket(#[from] tokio_tungstenite::tungstenite::Error),

    #[error("Risk management error: {message}")]
    RiskManagement { message: String },

    #[error("Execution error: {message}")]
    Execution { message: String },

    #[error("Market data error: {message}")]
    MarketData { message: String },

    #[error("Agent communication error: {message}")]
    AgentCommunication { message: String },

    #[error("Strategy error: {message}")]
    Strategy { message: String },

    #[error("System shutdown requested")]
    Shutdown,

    #[error("Circuit breaker triggered: {reason}")]
    CircuitBreaker { reason: String },

    #[error("Emergency stop: {reason}")]
    EmergencyStop { reason: String },
}

/// Result type alias for trading operations
pub type TradingResult<T> = Result<T, TradingError>;

impl TradingError {
    /// Create a new risk management error
    pub fn risk_management<S: Into<String>>(message: S) -> Self {
        Self::RiskManagement {
            message: message.into(),
        }
    }

    /// Create a new execution error
    pub fn execution<S: Into<String>>(message: S) -> Self {
        Self::Execution {
            message: message.into(),
        }
    }

    /// Create a new market data error
    pub fn market_data<S: Into<String>>(message: S) -> Self {
        Self::MarketData {
            message: message.into(),
        }
    }

    /// Create a new agent communication error
    pub fn agent_communication<S: Into<String>>(message: S) -> Self {
        Self::AgentCommunication {
            message: message.into(),
        }
    }

    /// Create a new strategy error
    pub fn strategy<S: Into<String>>(message: S) -> Self {
        Self::Strategy {
            message: message.into(),
        }
    }

    /// Create a new circuit breaker error
    pub fn circuit_breaker<S: Into<String>>(reason: S) -> Self {
        Self::CircuitBreaker {
            reason: reason.into(),
        }
    }

    /// Create a new emergency stop error
    pub fn emergency_stop<S: Into<String>>(reason: S) -> Self {
        Self::EmergencyStop {
            reason: reason.into(),
        }
    }

    /// Check if this error is recoverable
    pub fn is_recoverable(&self) -> bool {
        match self {
            Self::Shutdown | Self::EmergencyStop { .. } => false,
            Self::CircuitBreaker { .. } => false,
            _ => true,
        }
    }

    /// Check if this error requires immediate system shutdown
    pub fn requires_shutdown(&self) -> bool {
        match self {
            Self::Shutdown | Self::EmergencyStop { .. } => true,
            Self::CircuitBreaker { .. } => true,
            _ => false,
        }
    }
}
