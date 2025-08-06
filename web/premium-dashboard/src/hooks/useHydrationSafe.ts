'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to prevent hydration errors by ensuring consistent server/client rendering
 * Returns false during server-side rendering and initial client render,
 * then true after hydration is complete
 */
export function useHydrationSafe() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

/**
 * Hook for hydration-safe random values
 * Returns 0 during SSR, actual random value after hydration
 */
export function useHydrationSafeRandom(min: number = 0, max: number = 1) {
  const isMounted = useHydrationSafe();
  const [randomValue, setRandomValue] = useState(0);

  useEffect(() => {
    if (isMounted) {
      setRandomValue(min + Math.random() * (max - min));
    }
  }, [isMounted, min, max]);

  return isMounted ? randomValue : 0;
}

/**
 * Hook for hydration-safe timestamps
 * Returns null during SSR, actual date after hydration
 */
export function useHydrationSafeDate() {
  const isMounted = useHydrationSafe();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    if (isMounted) {
      setCurrentDate(new Date());
    }
  }, [isMounted]);

  return isMounted ? currentDate : null;
}

/**
 * Hook for hydration-safe dynamic content
 * Returns fallback during SSR, actual content after hydration
 */
export function useHydrationSafeContent<T>(
  dynamicContent: () => T,
  fallback: T
): T {
  const isMounted = useHydrationSafe();
  const [content, setContent] = useState<T>(fallback);

  useEffect(() => {
    if (isMounted) {
      setContent(dynamicContent());
    }
  }, [isMounted, dynamicContent]);

  return isMounted ? content : fallback;
}
