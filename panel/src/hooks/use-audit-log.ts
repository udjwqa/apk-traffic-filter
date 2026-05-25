"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  RequestLogEntry,
  AuditLogFilters,
} from "@/lib/types/dashboard";
import { generateMockAuditLog } from "@/lib/mock-data";
import { useMockMode } from "@/lib/mock-mode-context";

const DEFAULT_FILTERS: AuditLogFilters = {
  search: "",
  verdict: "all",
  rejectionCode: null,
  country: null,
  dateFrom: null,
  dateTo: null,
};

const PAGE_SIZE = 25;

export function useAuditLog() {
  const { isMockEnabled } = useMockMode();
  const [entries, setEntries] = useState<RequestLogEntry[]>([]);
  const [filters, setFilters] = useState<AuditLogFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPage = useCallback(
    async (p: number, f: AuditLogFilters, mock: boolean) => {
      setIsLoading(true);
      try {
        if (mock) {
          const result = generateMockAuditLog(f, p, PAGE_SIZE);
          setEntries(result.entries);
          setTotal(result.total);
          setTotalPages(result.totalPages);
          setPage(result.page);
        } else {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const params = new URLSearchParams();
          if (f.search) params.set("search", f.search);
          if (f.verdict !== "all") params.set("verdict", f.verdict);
          if (f.rejectionCode) params.set("rejectionCode", f.rejectionCode);
          if (f.country) params.set("country", f.country);
          if (f.dateFrom) params.set("dateFrom", f.dateFrom);
          if (f.dateTo) params.set("dateTo", f.dateTo);
          params.set("page", String(p));
          params.set("pageSize", String(PAGE_SIZE));
          const res = await fetch(`${API_URL}/api/audit/logs?${params}`);
          const result = await res.json();
          setEntries(result.entries || []);
          setTotal(result.total || 0);
          setTotalPages(result.totalPages || 1);
          setPage(result.page || 1);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPage(page, filters, isMockEnabled);
  }, [fetchPage, page, filters, isMockEnabled]);

  const updateFilters = useCallback(
    (partial: Partial<AuditLogFilters>) => {
      setFilters((prev) => ({ ...prev, ...partial }));
      setPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const handleBanIp = useCallback(async (ip: string) => {
    console.log("[MOCK] Ban IP:", ip);
    return { success: true };
  }, []);

  const handleWhitelistIp = useCallback(async (ip: string) => {
    console.log("[MOCK] Whitelist IP:", ip);
    return { success: true };
  }, []);

  return {
    entries,
    filters,
    page,
    totalPages,
    total,
    isLoading,
    pageSize: PAGE_SIZE,
    updateFilters,
    resetFilters,
    setPage,
    banIp: handleBanIp,
    whitelistIp: handleWhitelistIp,
  };
}
