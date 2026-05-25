"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { RequestLogEntry } from "@/lib/types/dashboard";
import { generateMockRequestEntry } from "@/lib/mock-data";
import { useMockMode } from "@/lib/mock-mode-context";

const MAX_ENTRIES = 200;

export function useRequestFeed() {
  const { isMockEnabled } = useMockMode();
  const [entries, setEntries] = useState<RequestLogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(isPaused);

  isPausedRef.current = isPaused;

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isMockEnabled) {
      // TODO(websocket): Connect to real WebSocket feed
      setIsConnected(false);
      setEntries([]);
      return;
    }

    setIsConnected(true);
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        const newEntry = generateMockRequestEntry();
        setEntries((prev) => [newEntry, ...prev].slice(0, MAX_ENTRIES));
      }
    }, 800 + Math.random() * 1200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsConnected(false);
    };
  }, [isMockEnabled]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const clear = useCallback(() => setEntries([]), []);

  return { entries, isConnected, isPaused, pause, resume, clear };
}
