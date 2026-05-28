"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ChevronDown } from "lucide-react";
import type { AuditLogFilters } from "@/lib/types/dashboard";
import { COUNTRIES, REJECTION_CODES } from "@/lib/constants";

interface AuditFiltersProps {
  filters: AuditLogFilters;
  onUpdate: (partial: Partial<AuditLogFilters>) => void;
  onReset: () => void;
  total: number;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white/70 transition-colors hover:bg-white/[0.05]"
      >
        <span className="truncate">{selected?.label || label}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/30" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-white/[0.08] bg-[oklch(0.14_0_0)] p-1 shadow-xl">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                  value === opt.value
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/[0.05] hover:text-white/80"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function AuditFilters({
  filters,
  onUpdate,
  onReset,
  total,
}: AuditFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.verdict !== "all" ||
    filters.rejectionCode ||
    filters.country ||
    filters.dateFrom ||
    filters.dateTo;

  const verdictOptions = [
    { value: "all", label: "Все вердикты" },
    { value: "grey", label: "Серый" },
    { value: "white", label: "Белый" },
  ];

  const rejectionOptions = [
    { value: "__all__", label: "Все коды" },
    ...REJECTION_CODES.map((rc) => ({ value: rc.code, label: rc.label })),
  ];

  const countryOptions = [
    { value: "__all__", label: "Все страны" },
    ...COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-white/60">Фильтры</h2>
          <span className="rounded-lg bg-white/[0.05] px-2 py-0.5 text-[11px] text-white/30">
            {total.toLocaleString("ru-RU")} записей
          </span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 gap-1.5 text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.05]"
          >
            <X className="h-3 w-3" />
            Сбросить
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
          <Input
            placeholder="IP, User-Agent, Device..."
            value={filters.search}
            onChange={(e) =>
              onUpdate({ search: (e.target as HTMLInputElement).value })
            }
            className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03] pl-9 text-sm text-white placeholder:text-white/20 focus:border-white/15 focus:ring-white/10"
          />
        </div>

        <FilterDropdown
          label="Вердикт"
          value={filters.verdict}
          options={verdictOptions}
          onChange={(v) =>
            onUpdate({ verdict: v as AuditLogFilters["verdict"] })
          }
        />

        <FilterDropdown
          label="Код отказа"
          value={filters.rejectionCode || "__all__"}
          onChange={(v) =>
            onUpdate({ rejectionCode: v === "__all__" ? null : v })
          }
          options={rejectionOptions}
        />

        <FilterDropdown
          label="Страна"
          value={filters.country || "__all__"}
          onChange={(v) =>
            onUpdate({ country: v === "__all__" ? null : v })
          }
          options={countryOptions}
        />

        <div className="flex gap-2">
          <input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) =>
              onUpdate({ dateFrom: e.target.value || null })
            }
            placeholder="От"
            className="h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs text-white/70 outline-none transition-colors hover:bg-white/[0.05] focus:border-white/15 [color-scheme:dark]"
          />
          <input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) =>
              onUpdate({ dateTo: e.target.value || null })
            }
            placeholder="До"
            className="h-9 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs text-white/70 outline-none transition-colors hover:bg-white/[0.05] focus:border-white/15 [color-scheme:dark]"
          />
        </div>
      </div>
    </div>
  );
}
