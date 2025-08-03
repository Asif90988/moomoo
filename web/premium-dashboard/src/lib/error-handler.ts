// Comprehensive Error Handling for Neural Core Alpha-7
import { NextRequest, NextResponse } from 'next/server';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  endpoint?: string;
  userAgent?: string;
  timestamp: string;
  environment: string;
  version: string;
}

export interface NeuralCoreError {
  id: string;
  code: string;
  message: string;
  severity: ErrorSeverity;
  category: 'authentication' | 'trading' | 'api' | 'database' | 'websocket' | 'ui' | 'unknown';
  context: ErrorContext;
  stack?: string;
  metadata?: Record<string, any>;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: NeuralCoreError[] = [];
  private maxQueueSize = 1000;
  private flushInterval = 30000; // 30 seconds

  private constructor() {
    this.startPeriodicFlush();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Capture and process errors
  public captureError(error: Error | string, context: Partial<ErrorContext> = {}, metadata?: Record<string, any>): NeuralCoreError {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const neuralError: NeuralCoreError = {
      id: this.generateErrorId(),
      code: this.extractErrorCode(errorObj),
      message: errorObj.message,
      severity: this.determineSeverity(errorObj),
      category: this.categorizeError(errorObj),
      context: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        ...context
      },
      stack: errorObj.stack,
      metadata
    };

    this.queueError(neuralError);
    this.logError(neuralError);
    
    // Send critical errors immediately
    if (neuralError.severity === 'critical') {
      this.sendCriticalAlert(neuralError);
    }

    return neuralError;
  }

  // API error handler middleware
  public handleAPIError(error: Error, req: NextRequest): NextResponse {
    const neuralError = this.captureError(error, {
      endpoint: req.url,
      userAgent: req.headers.get('user-agent') || undefined,
      sessionId: req.headers.get('x-session-id') || undefined
    });

    const statusCode = this.getHTTPStatusCode(neuralError);
    
    return NextResponse.json({
      error: {
        id: neuralError.id,
        code: neuralError.code,
        message: this.getUserFriendlyMessage(neuralError),
        severity: neuralError.severity
      }
    }, { status: statusCode });
  }

  // Trading-specific error handling
  public handleTradingError(error: Error, userId: string, orderData?: any): NeuralCoreError {
    return this.captureError(error, {
      userId,
      endpoint: 'trading'
    }, {
      orderData,
      tradingContext: 'order_processing'
    });
  }

  // WebSocket error handling
  public handleWebSocketError(error: Error, connectionId: string): NeuralCoreError {
    return this.captureError(error, {
      sessionId: connectionId,
      endpoint: 'websocket'
    }, {
      connectionType: 'websocket',
      reconnectAttempts: 0
    });
  }

  // Database error handling
  public handleDatabaseError(error: Error, operation: string, table?: string): NeuralCoreError {
    return this.captureError(error, {
      endpoint: 'database'
    }, {
      operation,
      table,
      databaseType: 'postgresql'
    });
  }

  private generateErrorId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `err_${timestamp}_${random}`;
  }

  private extractErrorCode(error: Error): string {
    // Extract specific error codes based on error types
    if (error.name === 'ValidationError') return 'VALIDATION_FAILED';
    if (error.name === 'AuthenticationError') return 'AUTH_REQUIRED';
    if (error.name === 'AuthorizationError') return 'INSUFFICIENT_PERMISSIONS';
    if (error.message.includes('deposit limit')) return 'DEPOSIT_LIMIT_EXCEEDED';
    if (error.message.includes('insufficient funds')) return 'INSUFFICIENT_FUNDS';
    if (error.message.includes('connection')) return 'CONNECTION_ERROR';
    if (error.message.includes('timeout')) return 'REQUEST_TIMEOUT';
    if (error.message.includes('rate limit')) return 'RATE_LIMIT_EXCEEDED';
    
    return 'UNKNOWN_ERROR';
  }

  private determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Critical errors
    if (message.includes('database') && message.includes('connection')) return 'critical';
    if (message.includes('payment') && message.includes('failed')) return 'critical';
    if (name.includes('securityerror')) return 'critical';

    // High severity
    if (message.includes('authentication')) return 'high';
    if (message.includes('authorization')) return 'high';
    if (message.includes('trading') && message.includes('failed')) return 'high';

    // Medium severity
    if (message.includes('validation')) return 'medium';
    if (message.includes('rate limit')) return 'medium';
    if (message.includes('timeout')) return 'medium';

    // Low severity (default)
    return 'low';
  }

  private categorizeError(error: Error): NeuralCoreError['category'] {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('auth') || name.includes('auth')) return 'authentication';
    if (message.includes('trading') || message.includes('order')) return 'trading';
    if (message.includes('api') || message.includes('fetch')) return 'api';
    if (message.includes('database') || message.includes('prisma')) return 'database';
    if (message.includes('websocket') || message.includes('socket')) return 'websocket';
    if (message.includes('component') || message.includes('render')) return 'ui';

    return 'unknown';
  }

  private queueError(error: NeuralCoreError): void {
    this.errorQueue.push(error);
    
    // Prevent memory leaks
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift(); // Remove oldest error
    }
  }

  private logError(error: NeuralCoreError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.severity.toUpperCase()}] ${error.category}/${error.code}: ${error.message}`;
    
    switch (logLevel) {
      case 'error':
        console.error(logMessage, {
          id: error.id,
          context: error.context,
          stack: error.stack,
          metadata: error.metadata
        });
        break;
      case 'warn':
        console.warn(logMessage, { id: error.id, context: error.context });
        break;
      default:
        console.log(logMessage, { id: error.id, context: error.context });
    }
  }

  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'info';
    }
  }

  private getHTTPStatusCode(error: NeuralCoreError): number {
    switch (error.code) {
      case 'AUTH_REQUIRED':
        return 401;
      case 'INSUFFICIENT_PERMISSIONS':
        return 403;
      case 'VALIDATION_FAILED':
        return 400;
      case 'DEPOSIT_LIMIT_EXCEEDED':
      case 'INSUFFICIENT_FUNDS':
        return 400;
      case 'RATE_LIMIT_EXCEEDED':
        return 429;
      case 'REQUEST_TIMEOUT':
        return 408;
      case 'CONNECTION_ERROR':
        return 503;
      default:
        return 500;
    }
  }

  private getUserFriendlyMessage(error: NeuralCoreError): string {
    const friendlyMessages: Record<string, string> = {
      'AUTH_REQUIRED': 'Please log in to continue',
      'INSUFFICIENT_PERMISSIONS': 'You don\'t have permission to perform this action',
      'VALIDATION_FAILED': 'Please check your input and try again',
      'DEPOSIT_LIMIT_EXCEEDED': 'Deposit exceeds Neural Core $300 protection limit',
      'INSUFFICIENT_FUNDS': 'Insufficient funds for this transaction',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again',
      'REQUEST_TIMEOUT': 'Request timed out. Please try again',
      'CONNECTION_ERROR': 'Connection error. Please check your internet connection',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Our team has been notified'
    };

    return friendlyMessages[error.code] || error.message;
  }

  private async sendCriticalAlert(error: NeuralCoreError): Promise<void> {
    try {
      // In production, send to monitoring service (Sentry, DataDog, etc.)
      console.error('🚨 CRITICAL ERROR ALERT 🚨', {
        id: error.id,
        code: error.code,
        message: error.message,
        context: error.context,
        metadata: error.metadata
      });

      // TODO: Implement alerting service integration
      // await alertingService.sendCriticalAlert(error);
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError);
    }
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      this.flushErrors();
    }, this.flushInterval);
  }

  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errorsToFlush = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In production, send to monitoring service
      console.log(`📊 Flushing ${errorsToFlush.length} errors to monitoring service`);
      
      // TODO: Implement batch error reporting
      // await monitoringService.reportErrors(errorsToFlush);
    } catch (flushError) {
      console.error('Failed to flush errors:', flushError);
      // Re-queue failed errors
      this.errorQueue.unshift(...errorsToFlush);
    }
  }

  // Public API for getting error statistics
  public getErrorStats(): {
    totalErrors: number;
    criticalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
  } {
    const stats = {
      totalErrors: this.errorQueue.length,
      criticalErrors: 0,
      errorsByCategory: {} as Record<string, number>,
      errorsBySeverity: {} as Record<string, number>
    };

    this.errorQueue.forEach(error => {
      if (error.severity === 'critical') {
        stats.criticalErrors++;
      }

      stats.errorsByCategory[error.category] = (stats.errorsByCategory[error.category] || 0) + 1;
      stats.errorsBySeverity[error.severity] = (stats.errorsBySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  // Clean up old errors
  public cleanupOldErrors(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoffTime = Date.now() - maxAge;
    this.errorQueue = this.errorQueue.filter(error => {
      const errorTime = new Date(error.context.timestamp).getTime();
      return errorTime > cutoffTime;
    });
  }
}

// Global error handler instance
export const errorHandler = ErrorHandler.getInstance();

// React Error Boundary Hook
export const useErrorHandler = () => {
  const captureError = (error: Error, context?: Partial<ErrorContext>, metadata?: Record<string, any>) => {
    return errorHandler.captureError(error, context, metadata);
  };

  const handleAsyncError = async <T>(
    asyncFn: () => Promise<T>,
    context?: Partial<ErrorContext>
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      captureError(error as Error, context);
      return null;
    }
  };

  return {
    captureError,
    handleAsyncError,
    getErrorStats: () => errorHandler.getErrorStats()
  };
};

// API route error wrapper
export const withErrorHandling = (handler: (req: NextRequest) => Promise<NextResponse> | NextResponse) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      return errorHandler.handleAPIError(error as Error, req);
    }
  };
};