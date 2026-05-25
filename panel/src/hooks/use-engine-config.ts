"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { EngineConfig } from "@/lib/types/dashboard";
import { getDefaultEngineConfig } from "@/lib/mock-data";
import { useMockMode } from "@/lib/mock-mode-context";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useEngineConfig() {
  const { isMockEnabled } = useMockMode();
  const [config, setConfig] = useState<EngineConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const originalRef = useRef<string>("");

  useEffect(() => {
    if (isMockEnabled) {
      const data = getDefaultEngineConfig();
      setConfig(data);
      originalRef.current = JSON.stringify(data);
      setIsLoading(false);
    } else {
      fetch(`${API_URL}/api/config`)
        .then((r) => r.json())
        .then((data) => {
          setConfig(data);
          originalRef.current = JSON.stringify(data);
        })
        .catch(() => setConfig(null))
        .finally(() => setIsLoading(false));
    }
  }, [isMockEnabled]);

  const isDirty = config
    ? JSON.stringify(config) !== originalRef.current
    : false;

  const updateField = useCallback(
    (path: string, value: unknown) => {
      setConfig((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        if (path.startsWith("weights.")) {
          const key = path.split(".")[1] as keyof EngineConfig["weights"];
          next.weights = { ...next.weights, [key]: value };
        } else {
          (next as Record<string, unknown>)[path] = value;
        }
        return next;
      });
      setSaveStatus("idle");
    },
    []
  );

  const save = useCallback(async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      if (isMockEnabled) {
        await new Promise((r) => setTimeout(r, 500));
      } else {
        await fetch(`${API_URL}/api/config`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });
      }
      originalRef.current = JSON.stringify(config);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [config, isMockEnabled]);

  const reset = useCallback(() => {
    const defaults = getDefaultEngineConfig();
    setConfig(defaults);
    setSaveStatus("idle");
  }, []);

  return {
    config,
    isLoading,
    isSaving,
    isDirty,
    saveStatus,
    updateField,
    save,
    reset,
  };
}
