// Neural Core Alpha-7 - ML Predictions API Endpoint
// Provides IPCA factor model predictions to the frontend

import { NextRequest, NextResponse } from 'next/server';
import { mlEngine } from '@/services/ml-engine';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface PredictionRequest {
  symbols: string[];
  timeHorizon?: '1h' | '4h' | '1d' | '1w';
  includeFactorAnalysis?: boolean;
  minConfidence?: number;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: PredictionRequest = await req.json();
    const { symbols, timeHorizon = '1d', includeFactorAnalysis = false, minConfidence = 0.5 } = body;

    if (!symbols || symbols.length === 0) {
      return NextResponse.json(
        { error: 'Symbols array is required' },
        { status: 400 }
      );
    }

    if (symbols.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 symbols allowed per request' },
        { status: 400 }
      );
    }

    // Initialize ML engine if not already done
    if (mlEngine.needsRetraining()) {
      console.log('🔄 ML Engine needs retraining, initializing...');
      await mlEngine.initialize();
    }

    // Generate predictions
    console.log(`🤖 Generating ML predictions for ${symbols.length} symbols...`);
    const predictions = await mlEngine.generatePredictions(symbols);

    // Filter by minimum confidence
    const filteredPredictions = predictions.filter(p => p.confidence >= minConfidence);

    // Get performance metrics
    const performanceMetrics = mlEngine.getPerformanceMetrics();

    // Prepare response
    const response = {
      predictions: filteredPredictions.map(p => ({
        symbol: p.symbol,
        expectedReturn: p.expectedReturn,
        confidence: p.confidence,
        riskScore: p.riskScore,
        timeHorizon: p.timeHorizon,
        timestamp: p.timestamp,
        factorExposures: includeFactorAnalysis ? p.factorExposures : undefined,
        recommendation: p.expectedReturn > 0.01 ? 'BUY' : 
                       p.expectedReturn < -0.01 ? 'SELL' : 'HOLD',
        strength: Math.abs(p.expectedReturn) > 0.03 ? 'STRONG' : 
                  Math.abs(p.expectedReturn) > 0.015 ? 'MODERATE' : 'WEAK'
      })),
      metadata: {
        modelType: 'IPCA',
        totalSymbols: symbols.length,
        filteredCount: filteredPredictions.length,
        averageConfidence: filteredPredictions.reduce((sum, p) => sum + p.confidence, 0) / filteredPredictions.length,
        timestamp: new Date().toISOString(),
        performanceMetrics: performanceMetrics ? {
          sharpeRatio: performanceMetrics.sharpeRatio,
          informationRatio: performanceMetrics.informationRatio,
          maxDrawdown: performanceMetrics.maxDrawdown,
          hitRate: performanceMetrics.hitRate,
          avgAccuracy: performanceMetrics.avgPredictionAccuracy
        } : null
      }
    };

    console.log(`✅ Generated ${filteredPredictions.length} predictions (${predictions.length - filteredPredictions.length} filtered out)`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ ML Predictions API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate predictions',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol');

    if (symbol) {
      // Get cached prediction for specific symbol
      const cachedPrediction = mlEngine.getCachedPrediction(symbol);
      
      if (!cachedPrediction) {
        return NextResponse.json(
          { error: `No cached prediction found for ${symbol}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        prediction: cachedPrediction,
        fromCache: true,
        timestamp: new Date().toISOString()
      });
    }

    // Return ML engine status and performance
    const performanceMetrics = mlEngine.getPerformanceMetrics();
    const needsRetraining = mlEngine.needsRetraining();

    return NextResponse.json({
      status: 'operational',
      modelTrained: !!performanceMetrics,
      needsRetraining,
      performanceMetrics,
      cacheSize: 0, // mlEngine.getCacheSize() if implemented
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ ML Status API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get ML status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}