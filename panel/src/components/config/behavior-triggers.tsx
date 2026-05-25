"use client";

import { Input } from "@/components/ui/input";
import type { EngineConfig } from "@/lib/types/dashboard";
import { ConfigBlock } from "./config-block";

interface BehaviorTriggersProps {
  config: EngineConfig;
  onUpdate: (path: string, value: unknown) => void;
}

const FIELDS = [
  {
    key: "batteryChargeTimeout",
    label: "Порог времени зарядки батареи",
    unit: "сек",
    description: "Минимальное время зарядки для прохождения проверки",
  },
  {
    key: "accelerometerIdleTime",
    label: "Время неподвижности акселерометра",
    unit: "сек",
    description: "Максимальное время без данных движения",
  },
  {
    key: "clickSpeedLimit",
    label: "Лимит скорости действий",
    unit: "кликов/сек",
    description: "Максимальная допустимая частота кликов",
  },
  {
    key: "timezoneDriftHours",
    label: "Допустимое расхождение часовых поясов",
    unit: "ч",
    description: "Разница между системной и IP-таймзоной",
  },
] as const;

export function BehaviorTriggers({
  config,
  onUpdate,
}: BehaviorTriggersProps) {
  return (
    <ConfigBlock
      title="Поведенческие триггеры (JS)"
      description="Настройка порогов для поведенческого анализа на стороне клиента"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs text-white/60">{field.label}</label>
            <div className="relative">
              <Input
                type="number"
                value={config[field.key]}
                onChange={(e) =>
                  onUpdate(
                    field.key,
                    Number((e.target as HTMLInputElement).value)
                  )
                }
                className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03] pr-16 text-sm text-white placeholder:text-white/20 focus:border-white/15 focus:ring-white/10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/25">
                {field.unit}
              </span>
            </div>
            <p className="text-[11px] text-white/25">{field.description}</p>
          </div>
        ))}
      </div>
    </ConfigBlock>
  );
}
