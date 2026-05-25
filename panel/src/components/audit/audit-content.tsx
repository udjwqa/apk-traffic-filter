"use client";

import { useCallback } from "react";
import { useAuditLog } from "@/hooks/use-audit-log";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AuditFilters } from "./audit-filters";
import { AuditTable } from "./audit-table";
import type { RequestLogEntry } from "@/lib/types/dashboard";

function exportToCsv(entries: RequestLogEntry[]) {
  const headers = [
    "Время",
    "IP",
    "Страна",
    "Устройство",
    "ОС",
    "Скоринг",
    "Вердикт",
    "Код отказа",
  ];
  const rows = entries.map((e) => [
    e.timestamp,
    e.ip,
    `${e.country} (${e.countryCode})`,
    e.deviceModel,
    e.os,
    e.score,
    e.verdict === "grey" ? "Серый" : "Белый",
    e.rejectionCode || "",
  ]);

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AuditContent() {
  const {
    entries,
    filters,
    page,
    totalPages,
    total,
    isLoading,
    pageSize,
    updateFilters,
    resetFilters,
    setPage,
    banIp,
    whitelistIp,
  } = useAuditLog();

  const handleExport = useCallback(() => {
    exportToCsv(entries);
  }, [entries]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Журнал аудита
          </h1>
          <p className="mt-1 text-sm text-white/40">
            История запросов, фильтрация и действия
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={entries.length === 0}
          variant="ghost"
          className="gap-2 text-white/40 hover:text-white/60 hover:bg-white/[0.05]"
        >
          <Download className="h-4 w-4" />
          Экспорт в CSV
        </Button>
      </div>

      <AuditFilters
        filters={filters}
        onUpdate={updateFilters}
        onReset={resetFilters}
        total={total}
      />

      <AuditTable
        entries={entries}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onBanIp={banIp}
        onWhitelistIp={whitelistIp}
      />
    </div>
  );
}
