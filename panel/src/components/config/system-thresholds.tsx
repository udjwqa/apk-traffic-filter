"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ChevronDown } from "lucide-react";
import type { EngineConfig } from "@/lib/types/dashboard";
import { ConfigBlock } from "./config-block";

interface SystemThresholdsProps {
  config: EngineConfig;
  onUpdate: (path: string, value: unknown) => void;
}

const INTEGRITY_OPTIONS = [
  { value: "MEETS_BASIC_INTEGRITY", label: "MEETS_BASIC_INTEGRITY" },
  { value: "MEETS_DEVICE_INTEGRITY", label: "MEETS_DEVICE_INTEGRITY" },
  { value: "MEETS_STRONG_INTEGRITY", label: "MEETS_STRONG_INTEGRITY" },
];

function IntegrityDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = INTEGRITY_OPTIONS.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white/70 transition-colors hover:bg-white/[0.05]"
      >
        <span className="truncate font-mono text-xs">
          {selected?.label || value}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/30" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-auto rounded-xl border border-white/[0.08] bg-[oklch(0.14_0_0)] p-1 shadow-xl">
            {INTEGRITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-2.5 py-1.5 text-left text-xs font-mono transition-colors ${
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

export function SystemThresholds({
  config,
  onUpdate,
}: SystemThresholdsProps) {
  return (
    <ConfigBlock
      title="Системные пороги"
      description="Основные пороги принятия решений движком"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-white/60">
            Проходной порог скоринга
          </label>
          <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-sm font-semibold tabular-nums text-white">
            {config.scoreThreshold}
          </span>
        </div>
        <Slider
          value={[config.scoreThreshold]}
          onValueChange={(value) =>
            onUpdate("scoreThreshold", Array.isArray(value) ? value[0] : value)
          }
          min={0}
          max={100}
          step={1}
        />
        <p className="text-[11px] text-white/25">
          Запросы с баллом выше порога отправляются на белую ссылку
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3">
        <div>
          <p className="text-xs font-medium text-white/70">IPQS_FAIL_OPEN</p>
          <p className="mt-0.5 text-[11px] text-white/30">
            Пропускать трафик при недоступности IPQS сервиса
          </p>
        </div>
        <Switch
          checked={config.ipqsFailOpen}
          onCheckedChange={(checked: boolean) =>
            onUpdate("ipqsFailOpen", checked)
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-white/60">
          Минимальный вердикт Play Integrity
        </label>
        <IntegrityDropdown
          value={config.minPlayIntegrity}
          onChange={(v) => onUpdate("minPlayIntegrity", v)}
        />
      </div>
    </ConfigBlock>
  );
}
