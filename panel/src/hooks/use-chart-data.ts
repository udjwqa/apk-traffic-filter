"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  TrafficDataPoint,
  RejectionReason,
} from "@/lib/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useChartData(refreshIntervalMs = 30000) {
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>([]);
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [trafficRes, rejectionsRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/traffic`),
        fetch(`${API_URL}/api/dashboard/rejections`),
      ]);
      if (trafficRes.ok) setTrafficData(await trafficRes.json());
      if (rejectionsRes.ok) setRejectionReasons(await rejectionsRes.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch chart data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [refresh, refreshIntervalMs]);

  return { trafficData, rejectionReasons, isLoading, error };
}
