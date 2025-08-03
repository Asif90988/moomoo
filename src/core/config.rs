//! System configuration management

use anyhow::Result;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::path::Path;
use tokio::fs;

use crate::core::types::{AgentCapability, StrategyConfig};

/// Main system configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemConfig {
    pub trading: TradingConfig,
    pub risk: RiskConfig,
    pub agents: AgentConfig,
    pub api: ApiConfig,
    pub monitoring: MonitoringConfig,
    pub strategies: Vec<StrategyConfig>,
}

/// Trading-specific configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingConfig {
    pub initial_capital: Decimal,
    pub target_daily_return: f64, // 0.25 for 25%
    pub max_positions: u32,
    pub default_position_size: Decimal,
    pub commission_rate: Decimal,
    pub slippage_tolerance: Decimal,
    pub trading_hours: TradingHours,
}

/// Trading hours configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingHours {
    pub market_open: String,  // "09:30:00"
    pub market_close: String, // "16:00:00"
    pub timezone: String,     // "America/New_York"
    pub trading_days: Vec<String>, // ["Monday", "Tuesday", ...]
}

/// Risk management configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskConfig {
    pub max_daily_loss: Decimal,
    pub max_position_size: Decimal,
    pub var_confidence_level: f64, // 0.95 for 95%
    pub max_portfolio_heat: f64,   // 0.8 for 80%
    pub circuit_breaker_threshold: Decimal,
    pub emergency_stop_loss: Decimal,
    pub correlation_limit: f64,
}

/// Agent system configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentConfig {
    pub master_coordinator: CoordinatorConfig,
    pub market_intelligence: IntelligenceConfig,
    pub risk_management: RiskAgentConfig,
    pub execution_engine: ExecutionConfig,
    pub learning_engine: LearningConfig,
}

/// Master coordinator agent configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoordinatorConfig {
    pub enabled: bool,
    pub decision_timeout_ms: u64,
    pub consensus_threshold: f64,
    pub capabilities: Vec<AgentCapability>,
    pub strategic_planning_interval_hours: u64,
}

/// Market intelligence agent configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IntelligenceConfig {
    pub enabled: bool,
    pub data_sources: Vec<String>,
    pub update_interval_ms: u64,
    pub technical_indicators: Vec<String>,
    pub sentiment_analysis: bool,
    pub pattern_recognition: bool,
}

/// Risk management agent configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RiskAgentConfig {
    pub enabled: bool,
    pub monitoring_interval_ms: u64,
    pub stress_testing: bool,
    pub monte_carlo_simulations: u32,
    pub dynamic_hedging: bool,
}

/// Execution engine configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionConfig {
    pub enabled: bool,
    pub max_latency_ms: u64,
    pub order_routing_optimization: bool,
    pub slippage_optimization: bool,
    pub execution_algorithms: Vec<String>,
}

/// Learning engine configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LearningConfig {
    pub enabled: bool,
    pub model_update_interval_hours: u64,
    pub online_learning: bool,
    pub ensemble_models: bool,
    pub strategy_generation: bool,
}

/// API configuration for external services
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiConfig {
    pub moomoo: MoomooConfig,
    pub data_providers: Vec<DataProviderConfig>,
    pub rate_limits: RateLimitConfig,
}

/// Moomoo API configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoomooConfig {
    pub base_url: String,
    pub api_key: String,
    pub secret_key: String,
    pub paper_trading: bool,
    pub timeout_ms: u64,
    pub retry_attempts: u32,
}

/// Data provider configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataProviderConfig {
    pub name: String,
    pub url: String,
    pub api_key: Option<String>,
    pub enabled: bool,
    pub priority: u32,
}

/// Rate limiting configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    pub requests_per_second: u32,
    pub burst_limit: u32,
    pub backoff_strategy: String,
}

/// Monitoring and observability configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MonitoringConfig {
    pub metrics_enabled: bool,
    pub prometheus_port: u16,
    pub log_level: String,
    pub performance_tracking: bool,
    pub alerts: AlertConfig,
}

/// Alert configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertConfig {
    pub enabled: bool,
    pub email_notifications: bool,
    pub slack_webhook: Option<String>,
    pub critical_loss_threshold: Decimal,
    pub performance_degradation_threshold: f64,
}

impl SystemConfig {
    /// Load configuration from environment variables and config file
    pub async fn load() -> Result<Self> {
        // Try to load from config file first
        if let Ok(mut config) = Self::load_from_file("config.toml").await {
            // Apply environment variable overrides to loaded config
            config.apply_env_overrides();
            return Ok(config);
        }

        // Fall back to default configuration with environment overrides
        Ok(Self::default_with_env())
    }

    /// Load configuration from a TOML file
    pub async fn load_from_file<P: AsRef<Path>>(path: P) -> Result<Self> {
        let path_ref = path.as_ref();
        println!("DEBUG: Attempting to load config from: {:?}", path_ref);
        let content = fs::read_to_string(path_ref).await?;
        println!("DEBUG: Config file content length: {}", content.len());
        println!("DEBUG: Config file content preview: {}", &content[..std::cmp::min(200, content.len())]);
        
        match toml::from_str::<SystemConfig>(&content) {
            Ok(config) => {
                println!("DEBUG: TOML parsing successful!");
                println!("DEBUG: Loaded API key: '{}' (length: {})", config.api.moomoo.api_key, config.api.moomoo.api_key.len());
                Ok(config)
            }
            Err(e) => {
                println!("DEBUG: TOML parsing failed: {}", e);
                Err(e.into())
            }
        }
    }

    /// Create default configuration with environment variable overrides
    pub fn default_with_env() -> Self {
        let mut config = Self::default();

        // Override with environment variables only if they exist
        if let Ok(capital) = env::var("INITIAL_CAPITAL") {
            if let Ok(amount) = capital.parse::<f64>() {
                config.trading.initial_capital = Decimal::from_f64_retain(amount).unwrap_or(config.trading.initial_capital);
            }
        }

        if let Ok(api_key) = env::var("MOOMOO_API_KEY") {
            config.api.moomoo.api_key = api_key;
        }

        if let Ok(secret_key) = env::var("MOOMOO_SECRET_KEY") {
            config.api.moomoo.secret_key = secret_key;
        }

        if let Ok(paper_trading) = env::var("PAPER_TRADING") {
            config.api.moomoo.paper_trading = paper_trading.to_lowercase() == "true";
        }

        config
    }

    /// Apply environment variable overrides to loaded config
    pub fn apply_env_overrides(&mut self) {
        // Override with environment variables only if they exist
        if let Ok(capital) = env::var("INITIAL_CAPITAL") {
            if let Ok(amount) = capital.parse::<f64>() {
                self.trading.initial_capital = Decimal::from_f64_retain(amount).unwrap_or(self.trading.initial_capital);
            }
        }

        if let Ok(api_key) = env::var("MOOMOO_API_KEY") {
            self.api.moomoo.api_key = api_key;
        }

        if let Ok(secret_key) = env::var("MOOMOO_SECRET_KEY") {
            self.api.moomoo.secret_key = secret_key;
        }

        if let Ok(paper_trading) = env::var("PAPER_TRADING") {
            self.api.moomoo.paper_trading = paper_trading.to_lowercase() == "true";
        }
    }

    /// Save configuration to a TOML file
    pub async fn save_to_file<P: AsRef<Path>>(&self, path: P) -> Result<()> {
        let content = toml::to_string_pretty(self)?;
        fs::write(path, content).await?;
        Ok(())
    }

    /// Validate configuration settings
    pub fn validate(&self) -> Result<()> {
        // Validate trading configuration
        if self.trading.initial_capital <= Decimal::ZERO {
            anyhow::bail!("Initial capital must be positive");
        }

        if self.trading.target_daily_return <= 0.0 || self.trading.target_daily_return > 1.0 {
            anyhow::bail!("Target daily return must be between 0 and 1");
        }

        // Validate risk configuration
        if self.risk.max_daily_loss >= self.trading.initial_capital {
            anyhow::bail!("Max daily loss cannot exceed initial capital");
        }

        if self.risk.var_confidence_level <= 0.0 || self.risk.var_confidence_level >= 1.0 {
            anyhow::bail!("VaR confidence level must be between 0 and 1");
        }

        // Validate API configuration for Moomoo's session-based architecture
        // Moomoo uses OpenD local gateway - authentication is handled externally
        if self.api.moomoo.base_url.contains("localhost") || self.api.moomoo.base_url.contains("127.0.0.1") {
            // Local OpenD connection - API key is optional (session-based auth)
            if self.api.moomoo.api_key.is_empty() {
                println!("INFO: Using session-based authentication via OpenD local gateway");
            }
            return Ok(());
        }
        
        // For non-local connections, require API key
        if self.api.moomoo.api_key.is_empty() {
            anyhow::bail!("Moomoo API key is required for non-local connections");
        }
        
        // Allow demo keys for testing (must have paper trading enabled)
        if self.api.moomoo.api_key.starts_with("demo_") {
            if !self.api.moomoo.paper_trading {
                anyhow::bail!("Demo API keys can only be used with paper trading enabled");
            }
            return Ok(()); // Demo key is valid, skip other validation
        }
        
        // Allow live connection keys for OpenD integration
        if self.api.moomoo.api_key.starts_with("live_connection_") {
            // Valid live connection key - no additional validation needed
            return Ok(());
        }

        Ok(())
    }
}

impl Default for SystemConfig {
    fn default() -> Self {
        Self {
            trading: TradingConfig {
                initial_capital: Decimal::from(100), // $100 starting capital
                target_daily_return: 0.25,           // 25% daily target
                max_positions: 10,
                default_position_size: Decimal::from(10), // $10 per position
                commission_rate: Decimal::from_f64_retain(0.001).unwrap(), // 0.1%
                slippage_tolerance: Decimal::from_f64_retain(0.0005).unwrap(), // 0.05%
                trading_hours: TradingHours {
                    market_open: "09:30:00".to_string(),
                    market_close: "16:00:00".to_string(),
                    timezone: "America/New_York".to_string(),
                    trading_days: vec![
                        "Monday".to_string(),
                        "Tuesday".to_string(),
                        "Wednesday".to_string(),
                        "Thursday".to_string(),
                        "Friday".to_string(),
                    ],
                },
            },
            risk: RiskConfig {
                max_daily_loss: Decimal::from(2), // $2 max daily loss (2%)
                max_position_size: Decimal::from(20), // $20 max position
                var_confidence_level: 0.95,
                max_portfolio_heat: 0.8,
                circuit_breaker_threshold: Decimal::from_f64_retain(0.05).unwrap(), // 5%
                emergency_stop_loss: Decimal::from_f64_retain(0.10).unwrap(), // 10%
                correlation_limit: 0.7,
            },
            agents: AgentConfig {
                master_coordinator: CoordinatorConfig {
                    enabled: true,
                    decision_timeout_ms: 100,
                    consensus_threshold: 0.7,
                    capabilities: vec![
                        AgentCapability::StrategyGeneration,
                        AgentCapability::RiskOptimization,
                        AgentCapability::EthicalReasoning,
                    ],
                    strategic_planning_interval_hours: 1,
                },
                market_intelligence: IntelligenceConfig {
                    enabled: true,
                    data_sources: vec!["moomoo".to_string()],
                    update_interval_ms: 100,
                    technical_indicators: vec![
                        "sma".to_string(),
                        "ema".to_string(),
                        "rsi".to_string(),
                        "macd".to_string(),
                    ],
                    sentiment_analysis: true,
                    pattern_recognition: true,
                },
                risk_management: RiskAgentConfig {
                    enabled: true,
                    monitoring_interval_ms: 50,
                    stress_testing: true,
                    monte_carlo_simulations: 1000,
                    dynamic_hedging: true,
                },
                execution_engine: ExecutionConfig {
                    enabled: true,
                    max_latency_ms: 1,
                    order_routing_optimization: true,
                    slippage_optimization: true,
                    execution_algorithms: vec!["twap".to_string(), "vwap".to_string()],
                },
                learning_engine: LearningConfig {
                    enabled: true,
                    model_update_interval_hours: 4,
                    online_learning: true,
                    ensemble_models: true,
                    strategy_generation: true,
                },
            },
            api: ApiConfig {
                moomoo: MoomooConfig {
                    base_url: "https://openapi.moomoo.com".to_string(),
                    api_key: env::var("MOOMOO_API_KEY").unwrap_or_default(),
                    secret_key: env::var("MOOMOO_SECRET_KEY").unwrap_or_default(),
                    paper_trading: true, // Start with paper trading
                    timeout_ms: 5000,
                    retry_attempts: 3,
                },
                data_providers: vec![],
                rate_limits: RateLimitConfig {
                    requests_per_second: 100,
                    burst_limit: 200,
                    backoff_strategy: "exponential".to_string(),
                },
            },
            monitoring: MonitoringConfig {
                metrics_enabled: true,
                prometheus_port: 9090,
                log_level: "info".to_string(),
                performance_tracking: true,
                alerts: AlertConfig {
                    enabled: true,
                    email_notifications: false,
                    slack_webhook: None,
                    critical_loss_threshold: Decimal::from(5), // $5 critical loss
                    performance_degradation_threshold: 0.5,
                },
            },
            strategies: vec![
                StrategyConfig {
                    name: "momentum_scalping".to_string(),
                    enabled: true,
                    risk_limit: Decimal::from(1),
                    max_position_size: Decimal::from(10),
                    parameters: HashMap::new(),
                },
                StrategyConfig {
                    name: "mean_reversion".to_string(),
                    enabled: true,
                    risk_limit: Decimal::from(1),
                    max_position_size: Decimal::from(10),
                    parameters: HashMap::new(),
                },
            ],
        }
    }
}
