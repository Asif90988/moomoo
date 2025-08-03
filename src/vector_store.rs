//! Vector Database Integration for AI Learning and Pattern Storage
//! 
//! This module provides vector database capabilities for storing and retrieving
//! trading patterns, strategies, and market conditions as high-dimensional embeddings.

use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{info, error, warn};

#[cfg(feature = "ai-learning")]
use qdrant_client::{
    Qdrant,
    qdrant::{
        CreateCollectionBuilder, Distance, PointStruct, SearchPointsBuilder, VectorParamsBuilder, 
        UpsertPointsBuilder, Datatype, Value as QdrantValue,
    },
};

/// Vector database client for AI learning
pub struct VectorStore {
    #[cfg(feature = "ai-learning")]
    client: Qdrant,
    collection_name: String,
    embedding_dim: usize,
}

/// Market pattern stored as vector embedding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketPattern {
    pub id: String,
    pub timestamp: i64,
    pub symbol: String,
    pub pattern_type: PatternType,
    pub market_conditions: MarketConditions,
    pub outcome: TradingOutcome,
    pub success_rate: f64,
    pub embedding: Vec<f32>,
    pub metadata: PatternMetadata,
}

/// Trading strategy stored as vector embedding  
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingStrategyVector {
    pub strategy_id: String,
    pub name: String,
    pub description: String,
    pub success_rate: f64,
    pub avg_return: f64,
    pub max_drawdown: f64,
    pub sharpe_ratio: f64,
    pub market_conditions: Vec<String>,
    pub parameters: HashMap<String, f64>,
    pub embedding: Vec<f32>,
    pub usage_count: u64,
    pub last_used: i64,
}

/// Market conditions context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarketConditions {
    pub volatility: f64,
    pub trend_strength: f64,
    pub volume_profile: f64,
    pub market_regime: String,
    pub sector_rotation: f64,
    pub sentiment_score: f64,
    pub rsi: f64,
    pub macd_signal: f64,
    pub bollinger_position: f64,
}

/// Pattern types for classification
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PatternType {
    TechnicalBreakout,
    MeanReversion,
    MomentumContinuation,
    VolumeSpike,
    SentimentShift,
    EarningsPlay,
    NewsReaction,
    IntermarketSignal,
}

/// Trading outcome for learning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingOutcome {
    pub success: bool,
    pub return_pct: f64,
    pub hold_time_minutes: u32,
    pub max_adverse_excursion: f64,
    pub max_favorable_excursion: f64,
    pub slippage: f64,
    pub commission: f64,
}

/// Pattern metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PatternMetadata {
    pub confidence: f64,
    pub similar_patterns: Vec<String>,
    pub risk_score: f64,
    pub tags: Vec<String>,
}

/// Search result for similar patterns
#[derive(Debug, Clone)]
pub struct SimilarPattern {
    pub pattern: MarketPattern,
    pub similarity_score: f64,
    pub distance: f64,
}

/// Search result for similar strategies
#[derive(Debug, Clone)]
pub struct SimilarStrategy {
    pub strategy: TradingStrategyVector,
    pub similarity_score: f64,
    pub distance: f64,
}

#[cfg(feature = "ai-learning")]
fn qdrant_value_to_json(value: QdrantValue) -> serde_json::Value {
    match value.kind {
        Some(qdrant_client::qdrant::value::Kind::NullValue(_)) => serde_json::Value::Null,
        Some(qdrant_client::qdrant::value::Kind::BoolValue(b)) => serde_json::Value::Bool(b),
        Some(qdrant_client::qdrant::value::Kind::IntegerValue(i)) => serde_json::Value::Number(serde_json::Number::from(i)),
        Some(qdrant_client::qdrant::value::Kind::DoubleValue(d)) => {
            serde_json::Value::Number(serde_json::Number::from_f64(d).unwrap_or(serde_json::Number::from(0)))
        },
        Some(qdrant_client::qdrant::value::Kind::StringValue(s)) => serde_json::Value::String(s),
        Some(qdrant_client::qdrant::value::Kind::ListValue(list)) => {
            serde_json::Value::Array(list.values.into_iter().map(qdrant_value_to_json).collect())
        },
        Some(qdrant_client::qdrant::value::Kind::StructValue(s)) => {
            serde_json::Value::Object(
                s.fields.into_iter()
                    .map(|(k, v)| (k, qdrant_value_to_json(v)))
                    .collect()
            )
        },
        None => serde_json::Value::Null,
    }
}

impl VectorStore {
    /// Create a new vector store instance
    pub async fn new(url: &str, collection_name: &str, embedding_dim: usize) -> Result<Self> {
        info!("🗄️  Initializing Vector Store at {}", url);
        
        #[cfg(feature = "ai-learning")]
        {
            let client = Qdrant::from_url(url).build()?;
            
            let store = Self {
                client,
                collection_name: collection_name.to_string(),
                embedding_dim,
            };
            
            // Initialize collections
            store.initialize_collections().await?;
            
            info!("✅ Vector Store initialized successfully");
            Ok(store)
        }
        
        #[cfg(not(feature = "ai-learning"))]
        {
            warn!("Vector Store feature disabled - using mock implementation");
            Ok(Self {
                collection_name: collection_name.to_string(),
                embedding_dim,
            })
        }
    }
    
    /// Initialize vector database collections
    #[cfg(feature = "ai-learning")]
    async fn initialize_collections(&self) -> Result<()> {
        info!("🏗️  Creating vector collections...");
        
        // Create patterns collection
        let patterns_collection = format!("{}_patterns", self.collection_name);
        self.create_collection(&patterns_collection, self.embedding_dim).await?;
        
        // Create strategies collection
        let strategies_collection = format!("{}_strategies", self.collection_name);
        self.create_collection(&strategies_collection, self.embedding_dim).await?;
        
        info!("✅ Vector collections created successfully");
        Ok(())
    }
    
    /// Create a collection if it doesn't exist
    #[cfg(feature = "ai-learning")]
    async fn create_collection(&self, name: &str, dimension: usize) -> Result<()> {
        // Check if collection exists
        let collections = self.client.list_collections().await?;
        
        if collections.collections.iter().any(|c| c.name == name) {
            info!("📚 Collection '{}' already exists", name);
            return Ok(());
        }
        
        // Create new collection
        let create_collection = CreateCollectionBuilder::new(name)
            .vectors_config(VectorParamsBuilder::new(dimension as u64, Distance::Cosine))
            .build();
            
        self.client.create_collection(create_collection).await?;
        info!("✅ Created collection: {}", name);
        
        Ok(())
    }
    
    /// Store a market pattern
    pub async fn store_pattern(&self, pattern: &MarketPattern) -> Result<()> {
        #[cfg(feature = "ai-learning")]
        {
            let collection_name = format!("{}_patterns", self.collection_name);
            
            let point = PointStruct {
                id: Some(pattern.id.clone().into()),
                vectors: Some(pattern.embedding.clone().into()),
                payload: Default::default(), // Simplified for now
            };
            
            let upsert_request = UpsertPointsBuilder::new(collection_name, vec![point]).build();
            self.client.upsert_points(upsert_request).await?;
                
            info!("💾 Stored pattern: {} ({:?})", pattern.id, pattern.pattern_type);
        }
        
        #[cfg(not(feature = "ai-learning"))]
        {
            info!("💾 Mock: Would store pattern {}", pattern.id);
        }
        
        Ok(())
    }
    
    /// Store a trading strategy
    pub async fn store_strategy(&self, strategy: &TradingStrategyVector) -> Result<()> {
        #[cfg(feature = "ai-learning")]
        {
            let collection_name = format!("{}_strategies", self.collection_name);
            
            let point = PointStruct {
                id: Some(strategy.strategy_id.clone().into()),
                vectors: Some(strategy.embedding.clone().into()),
                payload: Default::default(), // Simplified for now
            };
            
            let upsert_request = UpsertPointsBuilder::new(collection_name, vec![point]).build();
            self.client.upsert_points(upsert_request).await?;
                
            info!("💾 Stored strategy: {} (success rate: {:.1}%)", 
                  strategy.name, strategy.success_rate * 100.0);
        }
        
        #[cfg(not(feature = "ai-learning"))]
        {
            info!("💾 Mock: Would store strategy {}", strategy.name);
        }
        
        Ok(())
    }
    
    /// Search for similar market patterns
    pub async fn find_similar_patterns(
        &self,
        query_embedding: &[f32],
        limit: usize,
        min_similarity: f64,
    ) -> Result<Vec<SimilarPattern>> {
        #[cfg(feature = "ai-learning")]
        {
            let collection_name = format!("{}_patterns", self.collection_name);
            
            let search_request = SearchPointsBuilder::new(collection_name, query_embedding.to_vec(), limit as u64)
                .score_threshold(min_similarity as f32)
                .with_payload(true)
                .build();
            
            let search_result = self.client.search_points(search_request).await?;
            
            let mut patterns = Vec::new();
            for scored_point in search_result.result {
                let payload = scored_point.payload;
                match serde_json::from_value::<MarketPattern>(
                    serde_json::Value::Object(
                        payload.into_iter()
                            .map(|(k, v)| (k, qdrant_value_to_json(v)))
                            .collect()
                    )
                ) {
                    Ok(pattern) => {
                        patterns.push(SimilarPattern {
                            pattern,
                            similarity_score: scored_point.score as f64,
                            distance: 1.0 - scored_point.score as f64,
                        });
                    }
                    Err(e) => {
                        warn!("Failed to deserialize pattern: {}", e);
                    }
                }
            }
            
            info!("🔍 Found {} similar patterns", patterns.len());
            Ok(patterns)
        }
        
        #[cfg(not(feature = "ai-learning"))]
        {
            info!("🔍 Mock: Would search for {} similar patterns", limit);
            Ok(Vec::new())
        }
    }
    
    /// Search for similar trading strategies
    pub async fn find_similar_strategies(
        &self,
        query_embedding: &[f32],
        limit: usize,
        min_similarity: f64,
    ) -> Result<Vec<SimilarStrategy>> {
        #[cfg(feature = "ai-learning")]
        {
            let collection_name = format!("{}_strategies", self.collection_name);
            
            let search_request = SearchPointsBuilder::new(collection_name, query_embedding.to_vec(), limit as u64)
                .score_threshold(min_similarity as f32)
                .with_payload(true)
                .build();
            
            let search_result = self.client.search_points(search_request).await?;
            
            let mut strategies = Vec::new();
            for scored_point in search_result.result {
                let payload = scored_point.payload;
                match serde_json::from_value::<TradingStrategyVector>(
                    serde_json::Value::Object(
                        payload.into_iter()
                            .map(|(k, v)| (k, qdrant_value_to_json(v)))
                            .collect()
                    )
                ) {
                    Ok(strategy) => {
                        strategies.push(SimilarStrategy {
                            strategy,
                            similarity_score: scored_point.score as f64,
                            distance: 1.0 - scored_point.score as f64,
                        });
                    }
                    Err(e) => {
                        warn!("Failed to deserialize strategy: {}", e);
                    }
                }
            }
            
            info!("🔍 Found {} similar strategies", strategies.len());
            Ok(strategies)
        }
        
        #[cfg(not(feature = "ai-learning"))]
        {
            info!("🔍 Mock: Would search for {} similar strategies", limit);
            Ok(Vec::new())
        }
    }
    
    /// Get collection statistics
    pub async fn get_stats(&self) -> Result<VectorStoreStats> {
        #[cfg(feature = "ai-learning")]
        {
            let patterns_collection = format!("{}_patterns", self.collection_name);
            let strategies_collection = format!("{}_strategies", self.collection_name);
            
            let patterns_info = self.client.collection_info(patterns_collection).await?;
            let strategies_info = self.client.collection_info(strategies_collection).await?;
            
            Ok(VectorStoreStats {
                total_patterns: patterns_info.result.map(|r| r.points_count.unwrap_or(0)).unwrap_or(0),
                total_strategies: strategies_info.result.map(|r| r.points_count.unwrap_or(0)).unwrap_or(0),
                embedding_dimension: self.embedding_dim,
                collection_name: self.collection_name.clone(),
            })
        }
        
        #[cfg(not(feature = "ai-learning"))]
        {
            Ok(VectorStoreStats {
                total_patterns: 0,
                total_strategies: 0,
                embedding_dimension: self.embedding_dim,
                collection_name: self.collection_name.clone(),
            })
        }
    }
}

/// Vector store statistics
#[derive(Debug, Clone)]
pub struct VectorStoreStats {
    pub total_patterns: u64,
    pub total_strategies: u64,
    pub embedding_dimension: usize,
    pub collection_name: String,
}

/// Embedding generator for market data
pub struct EmbeddingGenerator {
    model_name: String,
}

impl EmbeddingGenerator {
    /// Create a new embedding generator
    pub fn new(model_name: &str) -> Self {
        Self {
            model_name: model_name.to_string(),
        }
    }
    
    /// Generate embedding for market conditions
    pub async fn embed_market_conditions(&self, conditions: &MarketConditions) -> Result<Vec<f32>> {
        // For now, create a simple feature vector from market conditions
        // In production, this would use a proper embedding model
        let features = vec![
            conditions.volatility,
            conditions.trend_strength,
            conditions.volume_profile,
            conditions.sector_rotation,
            conditions.sentiment_score,
            conditions.rsi / 100.0, // Normalize RSI
            conditions.macd_signal,
            conditions.bollinger_position,
        ];
        
        // Pad or truncate to fixed dimension (384 is common for sentence transformers)
        let mut embedding = vec![0.0f32; 384];
        for (i, &value) in features.iter().enumerate() {
            if i < embedding.len() {
                embedding[i] = value as f32;
            }
        }
        
        // Simple normalization
        let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm > 0.0 {
            for x in &mut embedding {
                *x /= norm;
            }
        }
        
        Ok(embedding)
    }
    
    /// Generate embedding for trading strategy
    pub async fn embed_strategy(&self, strategy: &HashMap<String, f64>) -> Result<Vec<f32>> {
        // Create feature vector from strategy parameters
        let mut features = Vec::new();
        
        // Extract common strategy parameters
        features.push(strategy.get("position_size").unwrap_or(&0.1).clone());
        features.push(strategy.get("stop_loss").unwrap_or(&0.02).clone());
        features.push(strategy.get("take_profit").unwrap_or(&0.04).clone());
        features.push(strategy.get("holding_period").unwrap_or(&60.0).clone() / 1440.0); // Normalize to days
        features.push(strategy.get("volatility_threshold").unwrap_or(&0.2).clone());
        features.push(strategy.get("trend_strength").unwrap_or(&0.5).clone());
        features.push(strategy.get("volume_multiplier").unwrap_or(&1.5).clone());
        features.push(strategy.get("risk_reward_ratio").unwrap_or(&2.0).clone() / 10.0); // Normalize
        
        // Pad to fixed dimension
        let mut embedding = vec![0.0f32; 384];
        for (i, &value) in features.iter().enumerate() {
            if i < embedding.len() {
                embedding[i] = value as f32;
            }
        }
        
        // Normalization
        let norm: f32 = embedding.iter().map(|x| x * x).sum::<f32>().sqrt();
        if norm > 0.0 {
            for x in &mut embedding {
                *x /= norm;
            }
        }
        
        Ok(embedding)
    }
}