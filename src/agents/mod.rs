//! Autonomous trading agents

pub mod coordinator;
pub mod intelligence;
pub mod risk;
pub mod execution;
pub mod learning;
pub mod traits;

pub use traits::AutonomousAgent;
