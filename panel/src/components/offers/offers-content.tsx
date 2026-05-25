"use client";

import { useState } from "react";
import { useOfferConfig } from "@/hooks/use-offer-config";
import { ConfigBlock } from "@/components/config/config-block";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Link2,
  ChevronDown,
} from "lucide-react";
import type { OfferConfig } from "@/lib/types/dashboard";

const FLOW_OPTIONS: { value: OfferConfig["whiteFlowType"]; label: string; description: string }[] = [
  { value: "show_403", label: "Показывать 403", description: "Forbidden — доступ запрещён" },
  { value: "show_404", label: "Показывать 404", description: "Not Found — страница не найдена" },
  { value: "redirect_safe", label: "Редирект на Safe URL", description: "Перенаправление на белую ссылку" },
  { value: "fake_html", label: "Фейковый HTML", description: "Отдавать статическую HTML-заглушку" },
];

function FlowDropdown({
  value,
  onChange,
}: {
  value: OfferConfig["whiteFlowType"];
  onChange: (v: OfferConfig["whiteFlowType"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = FLOW_OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white/70 transition-colors hover:bg-white/[0.05]"
      >
        <div className="text-left">
          <span className="text-white/80">{selected?.label}</span>
          <span className="ml-2 text-xs text-white/30">{selected?.description}</span>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-white/30" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-white/[0.08] bg-[oklch(0.14_0_0)] p-1 shadow-xl">
            {FLOW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors ${
                  value === opt.value
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/[0.05] hover:text-white/80"
                }`}
              >
                <span className="text-sm">{opt.label}</span>
                <span className="text-[11px] text-white/30">{opt.description}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OffersContent() {
  const { config, isLoading, isSaving, isDirty, saveStatus, updateField, save, reset } =
    useOfferConfig();

  if (isLoading || !config) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-56 bg-white/[0.05]" />
        <Skeleton className="h-48 w-full rounded-2xl bg-white/[0.03]" />
        <Skeleton className="h-32 w-full rounded-2xl bg-white/[0.03]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Управление офферами
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Настройка целевых URL и поведения потоков
          </p>
        </div>
        {isDirty && (
          <span className="flex items-center gap-1.5 rounded-xl bg-amber-400/10 px-3 py-1.5 text-xs text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Есть несохранённые изменения
          </span>
        )}
      </div>

      <ConfigBlock
        title="Целевые ссылки"
        description="URL для серого и белого потоков трафика"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-white/60">
              Белая ссылка (Safe URL)
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
              <Input
                value={config.safeUrl}
                onChange={(e) =>
                  updateField("safeUrl", (e.target as HTMLInputElement).value)
                }
                placeholder="https://example.com/safe"
                className="h-10 rounded-xl border-white/[0.08] bg-white/[0.03] pl-10 text-sm text-white placeholder:text-white/20 focus:border-white/15"
              />
            </div>
            <p className="text-[11px] text-white/25">
              Ссылка на заглушку, фейк-контент или безопасную страницу
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-white/60">
              Серая ссылка (Target URL)
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400/40" />
              <Input
                value={config.targetUrl}
                onChange={(e) =>
                  updateField("targetUrl", (e.target as HTMLInputElement).value)
                }
                placeholder="https://api.example.com/target"
                className="h-10 rounded-xl border-white/[0.08] bg-white/[0.03] pl-10 text-sm text-white placeholder:text-white/20 focus:border-white/15"
              />
            </div>
            <p className="text-[11px] text-white/25">
              Ссылка на реальный продукт или API целевого контента
            </p>
          </div>
        </div>
      </ConfigBlock>

      <ConfigBlock
        title="Поведение белого потока"
        description="Что показывать ботам, модераторам и заблокированному трафику"
      >
        <div className="space-y-2">
          <Label className="text-xs text-white/60">
            Тип ответа для белого потока
          </Label>
          <FlowDropdown
            value={config.whiteFlowType}
            onChange={(v) => updateField("whiteFlowType", v)}
          />
        </div>
      </ConfigBlock>

      <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)] px-6 py-4">
        <Button
          variant="ghost"
          onClick={reset}
          className="gap-2 text-white/40 hover:text-white/60 hover:bg-white/[0.05]"
        >
          <RotateCcw className="h-4 w-4" />
          Сбросить к дефолту
        </Button>

        <div className="flex items-center gap-3">
          {saveStatus === "success" && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Check className="h-3.5 w-3.5" />
              Сохранено
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              Ошибка
            </span>
          )}
          <Button
            onClick={save}
            disabled={!isDirty || isSaving}
            className="gap-2 rounded-xl bg-white text-black font-medium hover:bg-white/90 disabled:opacity-30"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
