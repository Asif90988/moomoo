// Neural Core Alpha-7 - Alternative Data API
// Provides access to alternative data sources and analytics

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AlternativeDataPipeline } from '@/lib/ml/alternative-data-pipeline';

// Singleton data pipeline instance
let dataPipeline: AlternativeDataPipeline | null = null;

function getDataPipeline(): AlternativeDataPipeline {
  if (!dataPipeline) {
    dataPipeline = new AlternativeDataPipeline();
  }
  return dataPipeline;
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

    const body = await req.json();
    const { action, data } = body;

    const pipeline = getDataPipeline();

    switch (action) {
      case 'fetchData':
        return await handleFetchData(pipeline, data);
      
      case 'getSentiment':
        return await handleGetSentiment(pipeline, data);
      
      case 'getNews':
        return await handleGetNews(pipeline, data);
      
      case 'getEconomic':
        return await handleGetEconomic(pipeline);
      
      case 'generateSignals':
        return await handleGenerateSignals(pipeline, data);
      
      case 'enableSource':
        return await handleEnableSource(pipeline, data);
      
      case 'disableSource':
        return await handleDisableSource(pipeline, data);
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Alternative data API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Alternative data operation failed',
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
    const dataType = searchParams.get('type') || 'overview';

    const pipeline = getDataPipeline();

    switch (dataType) {
      case 'overview':
        return NextResponse.json({
          dataSources: pipeline.getDataSources(),
          qualityMetrics: Object.fromEntries(pipeline.getQualityMetrics()),
          status: 'operational',
          timestamp: new Date().toISOString()
        });

      case 'sources':
        return NextResponse.json({
          dataSources: pipeline.getDataSources().map(source => ({
            ...source,
            status: source.enabled ? 'ACTIVE' : 'DISABLED',
            qualityScore: pipeline.getQualityMetrics().get(source.name)?.overallScore || 0
          })),
          totalSources: pipeline.getDataSources().length,
          activeSources: pipeline.getDataSources().filter(s => s.enabled).length
        });

      case 'quality':
        const qualityMetrics = pipeline.getQualityMetrics();
        const overallQuality = Array.from(qualityMetrics.values())
          .reduce((sum, metrics) => sum + metrics.overallScore, 0) / qualityMetrics.size;

        return NextResponse.json({
          qualityMetrics: Object.fromEntries(qualityMetrics),
          overallQuality,
          qualityGrade: getQualityGrade(overallQuality),
          recommendations: generateQualityRecommendations(qualityMetrics),
          timestamp: new Date().toISOString()
        });

      case 'status':
        return NextResponse.json({
          status: 'operational',
          pipelineVersion: '2.0',
          dataSourceTypes: ['SENTIMENT', 'SATELLITE', 'NEWS', 'ECONOMIC', 'SOCIAL', 'CORPORATE', 'TECHNICAL'],
          capabilities: {
            sentimentAnalysis: true,
            newsAnalytics: true,
            economicIndicators: true,
            socialMediaMonitoring: true,
            satelliteData: false, // Premium feature
            corporateTranscripts: false, // Premium feature
            realTimeProcessing: true,
            dataQualityAssessment: true
          },
          supportedProviders: [
            'Twitter API', 'Reddit API', 'NewsAPI', 'Google Trends', 
            'FRED API', 'AlphaSense', 'Orbital Insight', 'Sourcemap'
          ],
          latencyTargets: {
            sentiment: '< 10s',
            news: '< 5s',
            economic: '< 3s',
            social: '< 15s'
          },
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: `Unknown data type: ${dataType}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Alternative data GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve alternative data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handler functions
async function handleFetchData(pipeline: AlternativeDataPipeline, data: any) {
  const { symbols } = data;

  if (!symbols || !Array.isArray(symbols)) {
    return NextResponse.json(
      { error: 'Symbols array is required' },
      { status: 400 }
    );
  }

  if (symbols.length > 20) {
    return NextResponse.json(
      { error: 'Maximum 20 symbols allowed per request' },
      { status: 400 }
    );
  }

  const fetchedData = await pipeline.fetchAllData(symbols);
  
  // Convert Map to Object for JSON serialization
  const dataBySource: Record<string, any[]> = {};
  for (const [source, dataPoints] of fetchedData) {
    dataBySource[source] = dataPoints;
  }

  return NextResponse.json({
    success: true,
    dataBySource,
    summary: {
      totalDataPoints: Array.from(fetchedData.values()).flat().length,
      sourcesCovered: fetchedData.size,
      symbols: symbols,
      fetchTime: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
}

async function handleGetSentiment(pipeline: AlternativeDataPipeline, data: any) {
  const { symbols } = data;

  if (!symbols || !Array.isArray(symbols)) {
    return NextResponse.json(
      { error: 'Symbols array is required' },
      { status: 400 }
    );
  }

  const sentimentData = await pipeline.getSentimentData(symbols);
  
  // Calculate aggregate sentiment metrics
  const avgSentiment = sentimentData.reduce((sum, s) => sum + s.sentiment, 0) / sentimentData.length;
  const totalVolume = sentimentData.reduce((sum, s) => sum + s.volume, 0);
  const sentimentDistribution = {
    positive: sentimentData.filter(s => s.sentiment > 0.1).length,
    neutral: sentimentData.filter(s => Math.abs(s.sentiment) <= 0.1).length,
    negative: sentimentData.filter(s => s.sentiment < -0.1).length
  };

  return NextResponse.json({
    success: true,
    sentimentData,
    aggregateMetrics: {
      averageSentiment: avgSentiment,
      totalMentions: totalVolume,
      sentimentDistribution,
      overallMood: avgSentiment > 0.2 ? 'BULLISH' : avgSentiment < -0.2 ? 'BEARISH' : 'NEUTRAL'
    },
    timestamp: new Date().toISOString()
  });
}

async function handleGetNews(pipeline: AlternativeDataPipeline, data: any) {
  const { symbols } = data;

  if (!symbols || !Array.isArray(symbols)) {
    return NextResponse.json(
      { error: 'Symbols array is required' },
      { status: 400 }
    );
  }

  const newsAnalytics = await pipeline.getNewsAnalytics(symbols);
  
  // Analyze news trends
  const newsBySymbol = symbols.map(symbol => ({
    symbol,
    articles: newsAnalytics.filter(n => n.symbol === symbol),
    avgSentiment: newsAnalytics
      .filter(n => n.symbol === symbol)
      .reduce((sum, n) => sum + n.sentiment, 0) / 
      newsAnalytics.filter(n => n.symbol === symbol).length || 0,
    highImpactNews: newsAnalytics.filter(n => n.symbol === symbol && n.impact > 0.7).length
  }));

  const categoryBreakdown = newsAnalytics.reduce((acc, news) => {
    acc[news.category] = (acc[news.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    success: true,
    newsAnalytics,
    newsBySymbol,
    analytics: {
      totalArticles: newsAnalytics.length,
      averageImpact: newsAnalytics.reduce((sum, n) => sum + n.impact, 0) / newsAnalytics.length,
      categoryBreakdown,
      topSources: getTopSources(newsAnalytics),
      sentimentTrend: calculateSentimentTrend(newsAnalytics)
    },
    timestamp: new Date().toISOString()
  });
}

async function handleGetEconomic(pipeline: AlternativeDataPipeline) {
  const economicIndicators = await pipeline.getEconomicIndicators();
  
  const impactAnalysis = {
    positive: economicIndicators.filter(e => e.impact === 'POSITIVE').length,
    negative: economicIndicators.filter(e => e.impact === 'NEGATIVE').length,
    neutral: economicIndicators.filter(e => e.impact === 'NEUTRAL').length
  };

  const sectorImpacts = economicIndicators.reduce((acc, indicator) => {
    for (const sector of indicator.sectors) {
      if (!acc[sector]) acc[sector] = { positive: 0, negative: 0, neutral: 0 };
      acc[sector][indicator.impact.toLowerCase() as 'positive' | 'negative' | 'neutral']++;
    }
    return acc;
  }, {} as Record<string, Record<string, number>>);

  return NextResponse.json({
    success: true,
    economicIndicators,
    analysis: {
      totalIndicators: economicIndicators.length,
      impactAnalysis,
      sectorImpacts,
      overallEconomicSentiment: calculateEconomicSentiment(economicIndicators),
      keyIndicators: economicIndicators.filter(e => Math.abs(e.change) > 0.1) // Significant changes
    },
    timestamp: new Date().toISOString()
  });
}

async function handleGenerateSignals(pipeline: AlternativeDataPipeline, data: any) {
  const { symbols } = data;

  if (!symbols || !Array.isArray(symbols)) {
    return NextResponse.json(
      { error: 'Symbols array is required' },
      { status: 400 }
    );
  }

  const signals = await pipeline.processDataForSignals(symbols);
  
  // Categorize signals
  const signalAnalysis = Object.entries(signals).map(([symbol, signal]) => ({
    symbol,
    signal,
    strength: Math.abs(signal),
    direction: signal > 0.05 ? 'BUY' : signal < -0.05 ? 'SELL' : 'HOLD',
    confidence: Math.min(Math.abs(signal) * 2, 1.0) // Convert signal strength to confidence
  })).sort((a, b) => b.strength - a.strength);

  const strongSignals = signalAnalysis.filter(s => s.strength > 0.1);
  const signalDistribution = {
    buy: signalAnalysis.filter(s => s.direction === 'BUY').length,
    sell: signalAnalysis.filter(s => s.direction === 'SELL').length,
    hold: signalAnalysis.filter(s => s.direction === 'HOLD').length
  };

  return NextResponse.json({
    success: true,
    signals,
    signalAnalysis,
    summary: {
      totalSignals: Object.keys(signals).length,
      strongSignals: strongSignals.length,
      signalDistribution,
      averageSignalStrength: signalAnalysis.reduce((sum, s) => sum + s.strength, 0) / signalAnalysis.length,
      topOpportunities: strongSignals.slice(0, 5)
    },
    timestamp: new Date().toISOString()
  });
}

async function handleEnableSource(pipeline: AlternativeDataPipeline, data: any) {
  const { sourceName } = data;

  if (!sourceName) {
    return NextResponse.json(
      { error: 'Source name is required' },
      { status: 400 }
    );
  }

  const success = pipeline.enableDataSource(sourceName);

  return NextResponse.json({
    success,
    message: success ? `Data source '${sourceName}' enabled` : `Data source '${sourceName}' not found`,
    sourceName,
    timestamp: new Date().toISOString()
  });
}

async function handleDisableSource(pipeline: AlternativeDataPipeline, data: any) {
  const { sourceName } = data;

  if (!sourceName) {
    return NextResponse.json(
      { error: 'Source name is required' },
      { status: 400 }
    );
  }

  const success = pipeline.disableDataSource(sourceName);

  return NextResponse.json({
    success,
    message: success ? `Data source '${sourceName}' disabled` : `Data source '${sourceName}' not found`,
    sourceName,
    timestamp: new Date().toISOString()
  });
}

// Utility functions
function getQualityGrade(score: number): string {
  if (score >= 0.9) return 'A+';
  if (score >= 0.8) return 'A';
  if (score >= 0.7) return 'B+';
  if (score >= 0.6) return 'B';
  if (score >= 0.5) return 'C+';
  if (score >= 0.4) return 'C';
  return 'D';
}

function generateQualityRecommendations(qualityMetrics: Map<string, any>): string[] {
  const recommendations: string[] = [];
  
  for (const [source, metrics] of qualityMetrics) {
    if (metrics.timeliness < 0.7) {
      recommendations.push(`Improve data freshness for ${source}`);
    }
    if (metrics.completeness < 0.7) {
      recommendations.push(`Increase data coverage for ${source}`);
    }
    if (metrics.accuracy < 0.7) {
      recommendations.push(`Enhance data validation for ${source}`);
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All data sources are performing within acceptable quality thresholds');
  }
  
  return recommendations;
}

function getTopSources(newsAnalytics: any[]): Record<string, number> {
  const sourceCounts = newsAnalytics.reduce((acc, news) => {
    acc[news.source] = (acc[news.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.fromEntries(
    Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
  );
}

function calculateSentimentTrend(newsAnalytics: any[]): string {
  const recentNews = newsAnalytics
    .filter(n => Date.now() - new Date(n.publishedAt).getTime() < 6 * 60 * 60 * 1000) // Last 6 hours
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  if (recentNews.length < 2) return 'INSUFFICIENT_DATA';
  
  const recentSentiment = recentNews.slice(0, Math.floor(recentNews.length / 2))
    .reduce((sum, n) => sum + n.sentiment, 0) / Math.floor(recentNews.length / 2);
  
  const olderSentiment = recentNews.slice(Math.floor(recentNews.length / 2))
    .reduce((sum, n) => sum + n.sentiment, 0) / Math.ceil(recentNews.length / 2);
  
  const change = recentSentiment - olderSentiment;
  
  if (change > 0.1) return 'IMPROVING';
  if (change < -0.1) return 'DECLINING';
  return 'STABLE';
}

function calculateEconomicSentiment(indicators: any[]): string {
  const impactScores = indicators.map(i => {
    const score = i.impact === 'POSITIVE' ? 1 : i.impact === 'NEGATIVE' ? -1 : 0;
    return score * Math.abs(i.change);
  });
  
  const avgScore = impactScores.reduce((sum, score) => sum + score, 0) / impactScores.length;
  
  if (avgScore > 0.2) return 'POSITIVE';
  if (avgScore < -0.2) return 'NEGATIVE';
  return 'NEUTRAL';
}