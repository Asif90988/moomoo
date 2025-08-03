'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Neural Core Error Boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neural-dark flex items-center justify-center p-4">
          {/* Background Effects */}
          <div className="absolute inset-0 neural-grid opacity-10" />
          
          <div className="relative z-10 max-w-md w-full">
            <div className="glass rounded-xl p-8 border border-red-400/20">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              
              {/* Error Message */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Neural Core Error
                </h1>
                <p className="text-gray-400 mb-4">
                  The AI trading system encountered an unexpected error.
                </p>
                
                {/* Error Details */}
                {this.state.error && (
                  <div className="bg-neural-darker rounded-lg p-4 mb-4 border border-red-400/20">
                    <div className="text-xs font-mono text-red-400">
                      {this.state.error.message}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/40 rounded-lg py-3 px-4 text-neon-blue font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Restart Neural Core</span>
                </button>
                
                <button
                  onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                  className="w-full bg-gray-700/20 hover:bg-gray-700/30 border border-gray-600/40 rounded-lg py-3 px-4 text-gray-300 font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
              
              {/* Debug Info (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-6">
                  <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                    Debug Information
                  </summary>
                  <div className="mt-2 bg-neural-darker rounded-lg p-3 border border-gray-700/50">
                    <pre className="text-xs text-gray-400 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
              
              {/* Footer */}
              <div className="mt-6 text-center text-xs text-gray-500">
                Neural Core Alpha-7 v1.0.0
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}