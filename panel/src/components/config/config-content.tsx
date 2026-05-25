"use client";

import { useEngineConfig } from "@/hooks/use-engine-config";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, RotateCcw, Check, AlertCircle } from "lucide-react";
import { SystemThresholds } from "./system-thresholds";
import { BehaviorTriggers } from "./behavior-triggers";
import { ScoringWeights } from "./scoring-weights";

export function ConfigContent() {
  const {
    config,
    isLoading,
    isSaving,
    isDirty,
    saveStatus,
    updateField,
    save,
    reset,
  } = useEngineConfig();

  if (isLoading || !config) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-56 bg-white/[0.05]" />
          <Skeleton className="mt-2 h-4 w-80 bg-white/[0.05]" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-48 w-full rounded-2xl bg-white/[0.03]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Конфигурация движка
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Настройка порогов, триггеров и весов скоринга
          </p>
        </div>
        {isDirty && (
          <span className="flex items-center gap-1.5 rounded-xl bg-amber-400/10 px-3 py-1.5 text-xs text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Есть несохранённые изменения
          </span>
        )}
      </div>

      <SystemThresholds config={config} onUpdate={updateField} />
      <BehaviorTriggers config={config} onUpdate={updateField} />
      <ScoringWeights config={config} onUpdate={updateField} />

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
              Ошибка сохранения
            </span>
          )}
          <Button
            onClick={save}
            disabled={!isDirty || isSaving}
            className="gap-2 rounded-xl bg-white text-black font-medium hover:bg-white/90 disabled:opacity-30"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Сохранение..." : "Сохранить конфиг"}
          </Button>
        </div>
      </div>
    </div>
  );
}
