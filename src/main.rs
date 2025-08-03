//! Autonomous AI-Driven Trading Platform
//! 
//! A high-performance Rust-based trading system with microsecond execution,
//! self-modifying agents, and advanced AI capabilities.

use anyhow::Result;
use tokio::signal;
use tracing::{info, error};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod agents;
mod core;
mod execution;
mod intelligence;
mod risk;
mod infrastructure;
mod governance;
mod interfaces;
mod utils;
mod vector_store;

use crate::core::system::TradingSystem;
use crate::core::config::SystemConfig;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging and tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "autonomous_trading_system=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("🚀 Starting Autonomous AI Trading Platform");
    info!("📊 Target: 25% daily returns with microsecond execution");
    info!("🦀 Powered by Rust for maximum performance");

    // Load system configuration
    info!("📁 Loading configuration from config.toml...");
    let config = SystemConfig::load().await?;
    info!("⚙️  Configuration loaded successfully");
    info!("🔑 API Key: {} (length: {})", if config.api.moomoo.api_key.is_empty() { "EMPTY" } else { &config.api.moomoo.api_key }, config.api.moomoo.api_key.len());
    info!("📄 Paper Trading: {}", config.api.moomoo.paper_trading);

    // Initialize the trading system
    let mut trading_system = TradingSystem::new(config).await?;
    info!("🤖 Trading system initialized");

    // Start all agents and services
    trading_system.start().await?;
    info!("🎯 All agents started - system is operational");

    // Set up graceful shutdown
    let shutdown_signal = async {
        signal::ctrl_c()
            .await
            .expect("Failed to install CTRL+C signal handler");
        info!("🛑 Shutdown signal received");
    };

    // Run the system until shutdown
    tokio::select! {
        result = trading_system.run() => {
            match result {
                Ok(_) => info!("✅ Trading system completed successfully"),
                Err(e) => error!("❌ Trading system error: {}", e),
            }
        }
        _ = shutdown_signal => {
            info!("🔄 Initiating graceful shutdown...");
            trading_system.shutdown().await?;
            info!("✅ System shutdown complete");
        }
    }

    Ok(())
}
