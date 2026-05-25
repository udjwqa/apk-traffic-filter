"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardMetrics } from "@/lib/types/dashboard";
import { generateMockMetrics } from "@/lib/mock-data";
import { useMockMode } from "@/lib/mock-mode-context";

export function useDashboardMetrics(refreshIntervalMs = 5000) {
  const { isMockEnabled } = useMockMode();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      if (isMockEnabled) {
        setMetrics(generateMockMetrics());
      } else {
        // TODO(backend): Replace with fetch('/api/dashboard/metrics')
        setMetrics(null);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch metrics");
    } finally {
      setIsLoading(false);
    }
  }, [isMockEnabled]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [refresh, refreshIntervalMs]);

  return { metrics, isLoading, error, refresh };
}
