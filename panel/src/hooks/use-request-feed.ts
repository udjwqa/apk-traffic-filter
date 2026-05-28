"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { RequestLogEntry } from "@/lib/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MAX_ENTRIES = 200;

export function useRequestFeed() {
  const [entries, setEntries] = useState<RequestLogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(isPaused);

  isPausedRef.current = isPaused;

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsConnected(true);

    const fetchFeed = async () => {
      if (isPausedRef.current) return;
      try {
        const res = await fetch(`${API_URL}/api/dashboard/feed?limit=50`);
        if (res.ok) {
          const data = await res.json();
          setEntries(data.slice(0, MAX_ENTRIES));
        }
      } catch (_) {}
    };

    fetchFeed();
    intervalRef.current = setInterval(fetchFeed, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsConnected(false);
    };
  }, []);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const clear = useCallback(() => setEntries([]), []);

  return { entries, isConnected, isPaused, pause, resume, clear };
}
