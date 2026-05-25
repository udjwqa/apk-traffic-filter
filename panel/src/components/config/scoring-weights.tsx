"use client";

import { Input } from "@/components/ui/input";
import type { EngineConfig } from "@/lib/types/dashboard";
import { ConfigBlock } from "./config-block";

interface ScoringWeightsProps {
  config: EngineConfig;
  onUpdate: (path: string, value: unknown) => void;
}

const WEIGHT_FIELDS = [
  {
    key: "vpnProxyTor" as const,
    label: "VPN / Proxy / Tor",
    description: "Обнаружен VPN, прокси или Tor-выход",
  },
  {
    key: "suspiciousCity" as const,
    label: "Подозрительный город",
    description: "Совпадение с известным подозрительным регионом",
  },
  {
    key: "englishWebView" as const,
    label: "Английский язык в WebView",
    description: "Язык системы не совпадает с ожидаемым",
  },
  {
    key: "suspiciousHosting" as const,
    label: "Подозрительный хостинг / краулер",
    description: "IP принадлежит хостинг-провайдеру или краулеру",
  },
  {
    key: "mouseWithoutTouch" as const,
    label: "Клики мышкой без тача",
    description: "Обнаружены mouse-события без touch-событий",
  },
  {
    key: "timezoneMismatch" as const,
    label: "Несовпадение таймзоны",
    description: "Таймзона JS не совпадает с IP-геолокацией",
  },
];

export function ScoringWeights({ config, onUpdate }: ScoringWeightsProps) {
  return (
    <ConfigBlock
      title="Веса скоринговой системы"
      description="Баллы, начисляемые за каждый тип подозрительной активности"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WEIGHT_FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs text-white/60">{field.label}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/25">
                +
              </span>
              <Input
                type="number"
                value={config.weights[field.key]}
                onChange={(e) =>
                  onUpdate(
                    `weights.${field.key}`,
                    Number((e.target as HTMLInputElement).value)
                  )
                }
                min={0}
                max={100}
                className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03] pl-7 pr-16 text-sm text-white placeholder:text-white/20 focus:border-white/15 focus:ring-white/10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/25">
                баллов
              </span>
            </div>
            <p className="text-[11px] text-white/25">{field.description}</p>
          </div>
        ))}
      </div>
    </ConfigBlock>
  );
}
