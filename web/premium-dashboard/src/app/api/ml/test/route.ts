// Neural Core Alpha-7 - IPCA Model Test Endpoint
// Test the IPCA factor model implementation

import { NextResponse } from 'next/server';
import { SimplifiedIPCA, createSimplifiedIPCA, validateTrainingData } from '@/lib/ml/simplified-ipca';

export async function GET() {
  console.log('🧪 Testing IPCA Factor Model implementation...');
  
  try {
    // Generate synthetic test data
    const numAssets = 10;
    const numPeriods = 100;
    const numCharacteristics = 5;
    
    console.log(`📊 Generating test data: ${numPeriods} periods x ${numAssets} assets x ${numCharacteristics} characteristics`);
    
    // Create synthetic returns data
    const returns: number[][] = [];
    const characteristics: number[][] = [];
    const timestamps: Date[] = [];
    const assetIds: string[] = [];
    
    // Generate asset IDs
    for (let i = 0; i < numAssets; i++) {
      assetIds.push(`TEST${i.toString().padStart(2, '0')}`);
    }
    
    // Generate time series data
    for (let t = 0; t < numPeriods; t++) {
      const date = new Date(Date.now() - (numPeriods - t) * 24 * 60 * 60 * 1000);
      timestamps.push(date);
      
      const periodReturns: number[] = [];
      const periodCharacteristics: number[] = [];
      
      // Market factor (common to all assets)
      const marketFactor = (Math.random() - 0.5) * 0.04; // ±2%
      
      for (let i = 0; i < numAssets; i++) {
        // Asset-specific return with market exposure
        const beta = 0.5 + Math.random(); // Beta between 0.5-1.5
        const idiosyncratic = (Math.random() - 0.5) * 0.03; // ±1.5%
        const assetReturn = beta * marketFactor + idiosyncratic;
        periodReturns.push(assetReturn);
        
        // Asset characteristics (5 characteristics per asset)
        for (let c = 0; c < numCharacteristics; c++) {
          // Time-varying characteristics with some persistence
          const baseValue = Math.sin(t * 0.1 + i + c) * 0.2 + Math.random() * 0.1;
          periodCharacteristics.push(baseValue);
        }
      }
      
      returns.push(periodReturns);
      
      // Characteristics matrix: flatten [assets x characteristics] for this time period
      const flatCharacteristics: number[] = [];
      for (let i = 0; i < numAssets; i++) {
        for (let c = 0; c < numCharacteristics; c++) {
          const idx = i * numCharacteristics + c;
          if (idx < periodCharacteristics.length) {
            flatCharacteristics.push(periodCharacteristics[idx]);
          } else {
            flatCharacteristics.push(Math.random() * 0.1 - 0.05);
          }
        }
      }
      characteristics.push(flatCharacteristics);
    }
    
    console.log(`✅ Generated test data - Returns: ${returns.length}x${returns[0].length}, Characteristics: ${characteristics.length}x${characteristics[0].length}`);
    
    // Validate the data
    const validation = validateTrainingData({
      returns,
      characteristics,
      timestamps,
      assetIds
    });
    
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Data validation failed',
        details: validation.errors
      }, { status: 400 });
    }
    
    console.log('✅ Test data validation passed');
    
    // Create and train IPCA model
    const model = createSimplifiedIPCA({
      numFactors: 3,
      maxIterations: 50, // Reduced for testing
      convergenceThreshold: 1e-4,
      regularization: 0.001
    });
    
    console.log('🧠 Training IPCA model...');
    const startTime = Date.now();
    
    const result = await model.train({
      returns,
      characteristics,
      timestamps,
      assetIds
    });
    
    const trainingTime = Date.now() - startTime;
    console.log(`✅ IPCA training completed in ${trainingTime}ms`);
    
    // Test predictions
    console.log('🎯 Testing predictions...');
    const testCharacteristics = characteristics[characteristics.length - 1].slice(0, numCharacteristics);
    const prediction = await model.predict(testCharacteristics);
    
    console.log(`📈 Generated prediction: ${prediction.map(p => p.toFixed(4)).join(', ')}`);
    
    // Test factor exposures
    const factorExposures = await model.getFactorExposures(0); // First asset
    console.log(`📊 Factor exposures for first asset: ${factorExposures.map(f => f.toFixed(4)).join(', ')}`);
    
    // Export model
    const exportedModel = await model.exportModel();
    console.log(`💾 Model exported: ${exportedModel.factors.length}x${exportedModel.factors[0].length} factors, ${exportedModel.loadings.length}x${exportedModel.loadings[0].length} loadings`);
    
    return NextResponse.json({
      success: true,
      message: 'IPCA model test completed successfully',
      testResults: {
        trainingTime: `${trainingTime}ms`,
        dataShape: {
          returns: `${returns.length}x${returns[0].length}`,
          characteristics: `${characteristics.length}x${characteristics[0].length}`,
          factors: `${result.factors.length}x${result.factors[0].length}`,
          loadings: `${result.loadings.length}x${result.loadings[0].length}`
        },
        performance: {
          sharpeRatio: result.performance.sharpeRatio.toFixed(4),
          informationRatio: result.performance.informationRatio.toFixed(4),
          maxDrawdown: result.performance.maxDrawdown.toFixed(4)
        },
        predictions: {
          sample: prediction.slice(0, 3).map(p => p.toFixed(4)),
          factorExposures: factorExposures.map(f => f.toFixed(4))
        },
        explainedVariance: result.explainedVariance.map(v => (v * 100).toFixed(2) + '%'),
        modelConfig: exportedModel
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ IPCA model test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'IPCA model test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}