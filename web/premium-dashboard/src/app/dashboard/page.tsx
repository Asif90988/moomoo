'use client';

import { TradingDashboard } from '@/components/dashboard/TradingDashboard';
import { WebSocketProvider } from '@/components/providers/WebSocketProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <WebSocketProvider>
          <main className="h-screen w-screen overflow-hidden bg-neural-dark">
            <TradingDashboard />
          </main>
        </WebSocketProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}