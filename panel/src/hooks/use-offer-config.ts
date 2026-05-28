"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { OfferConfig } from "@/lib/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useOfferConfig() {
  const [config, setConfig] = useState<OfferConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const originalRef = useRef("");

  useEffect(() => {
    fetch(`${API_URL}/api/offers`)
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        originalRef.current = JSON.stringify(data);
      })
      .catch(() => setConfig(null))
      .finally(() => setIsLoading(false));
  }, []);

  const isDirty = config ? JSON.stringify(config) !== originalRef.current : false;

  const updateField = useCallback((key: keyof OfferConfig, value: string) => {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaveStatus("idle");
  }, []);

  const save = useCallback(async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      await fetch(`${API_URL}/api/offers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      originalRef.current = JSON.stringify(config);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [config]);

  const reset = useCallback(() => {
    if (originalRef.current) {
      setConfig(JSON.parse(originalRef.current));
    }
    setSaveStatus("idle");
  }, []);

  return { config, isLoading, isSaving, isDirty, saveStatus, updateField, save, reset };
}
