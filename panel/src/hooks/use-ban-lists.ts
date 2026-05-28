"use client";

import { useState, useEffect, useCallback } from "react";
import type { BannedEntry, WhitelistEntry } from "@/lib/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useBanLists() {
  const [banList, setBanList] = useState<BannedEntry[]>([]);
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchBan, setSearchBan] = useState("");
  const [searchWhitelist, setSearchWhitelist] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/bans/honeypot`)
      .then((r) => r.json())
      .then((data: Array<{ id: string; ip: string; reason: string; source: string; bannedAt: string; cfRuleId?: string }>) => {
        setBanList(
          data.map((b) => ({
            id: b.id,
            ip: b.ip,
            reason: b.reason || "honeypot",
            source: b.source === "honeypot" ? "Honeypot" : b.source,
            bannedAt: b.bannedAt,
            bannedBy: "system",
          }))
        );
      })
      .catch(() => setBanList([]));

    setWhitelist([]);
    setIsLoading(false);
  }, []);

  const unban = useCallback(
    async (id: string) => {
      const entry = banList.find((e) => e.id === id);
      if (!entry) return;
      await fetch(`${API_URL}/api/bans/honeypot/${entry.ip}`, { method: "DELETE" });
      setBanList((prev) => prev.filter((e) => e.id !== id));
    },
    [banList]
  );

  const addBan = useCallback(async (ip: string, reason: string) => {
    const entry: BannedEntry = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      ip,
      reason,
      source: "Ручной",
      bannedAt: new Date().toISOString(),
      bannedBy: "admin@panel.local",
    };
    setBanList((prev) => [entry, ...prev]);
  }, []);

  const removeException = useCallback(async (id: string) => {
    setWhitelist((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addException = useCallback(
    async (ip: string, label: string, deviceId?: string) => {
      const entry: WhitelistEntry = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        ip,
        deviceId,
        label,
        addedAt: new Date().toISOString(),
        addedBy: "admin@panel.local",
      };
      setWhitelist((prev) => [entry, ...prev]);
    },
    []
  );

  const filteredBans = searchBan
    ? banList.filter((e) => e.ip.includes(searchBan))
    : banList;

  const filteredWhitelist = searchWhitelist
    ? whitelist.filter(
        (e) =>
          e.ip.includes(searchWhitelist) ||
          e.label.toLowerCase().includes(searchWhitelist.toLowerCase()) ||
          (e.deviceId?.includes(searchWhitelist) ?? false)
      )
    : whitelist;

  return {
    banList: filteredBans,
    whitelist: filteredWhitelist,
    banTotal: banList.length,
    whitelistTotal: whitelist.length,
    isLoading,
    searchBan,
    setSearchBan,
    searchWhitelist,
    setSearchWhitelist,
    unban,
    addBan,
    removeException,
    addException,
  };
}
