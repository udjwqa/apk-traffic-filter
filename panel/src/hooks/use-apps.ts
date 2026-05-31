"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AppEntry {
  id: string;
  name: string;
  package_name: string;
  cert_sha256: string;
  gcp_project_id: string;
  safe_url: string;
  target_url: string;
  white_flow_type: string;
  panic_mode: boolean;
  excluded_countries: string[];
  disable_lang_check: boolean;
  created_at: string;
}

export function useApps() {
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/apps`);
      if (res.ok) setApps(await res.json());
    } catch (_) {}
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addApp = useCallback(async (data: Omit<AppEntry, "id" | "panic_mode" | "created_at">) => {
    const res = await fetch(`${API_URL}/api/apps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const app = await res.json();
      setApps((prev) => [...prev, app]);
      return app;
    }
    const err = await res.json();
    throw new Error(err.error || "Failed to add app");
  }, []);

  const updateApp = useCallback(async (id: string, data: Partial<AppEntry>) => {
    const res = await fetch(`${API_URL}/api/apps/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setApps((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    }
  }, []);

  const deleteApp = useCallback(async (id: string) => {
    const res = await fetch(`${API_URL}/api/apps/${id}`, { method: "DELETE" });
    if (res.ok) setApps((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const togglePanic = useCallback(async (id: string) => {
    const res = await fetch(`${API_URL}/api/apps/${id}/panic`, { method: "PUT" });
    if (res.ok) {
      const data = await res.json();
      setApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, panic_mode: data.panic_mode } : a))
      );
    }
  }, []);

  return { apps, isLoading, addApp, updateApp, deleteApp, togglePanic, refresh };
}
