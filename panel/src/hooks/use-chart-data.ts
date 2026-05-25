"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  TrafficDataPoint,
  RejectionReason,
} from "@/lib/types/dashboard";
import {
  generateMockTrafficData,
  generateMockRejectionReasons,
} from "@/lib/mock-data";
import { useMockMode } from "@/lib/mock-mode-context";

export function useChartData(refreshIntervalMs = 30000) {
  const { isMockEnabled } = useMockMode();
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>([]);
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      if (isMockEnabled) {
        setTrafficData(generateMockTrafficData());
        setRejectionReasons(generateMockRejectionReasons());
      } else {
        // TODO(backend): fetch from real API
        setTrafficData([]);
        setRejectionReasons([]);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch chart data");
    } finally {
      setIsLoading(false);
    }
  }, [isMockEnabled]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [refresh, refreshIntervalMs]);

  return { trafficData, rejectionReasons, isLoading, error };
}
