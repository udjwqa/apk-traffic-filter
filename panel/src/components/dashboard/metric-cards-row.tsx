import { Activity, Users, Bot, ShieldBan, Zap } from "lucide-react";
import type { DashboardMetrics } from "@/lib/types/dashboard";
import { MetricCard } from "./metric-card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardsRowProps {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
}

export function MetricCardsRow({ metrics, isLoading }: MetricCardsRowProps) {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)] p-5"
          >
            <Skeleton className="h-9 w-9 rounded-xl bg-white/[0.05]" />
            <Skeleton className="mt-4 h-7 w-20 bg-white/[0.05]" />
            <Skeleton className="mt-2 h-4 w-28 bg-white/[0.05]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <MetricCard
        title="Запросы за 24ч"
        value={metrics.requests24h}
        icon={Activity}
        color="text-blue-400"
        bgColor="bg-blue-400/10"
      />
      <MetricCard
        title="Серый поток"
        value={metrics.greyTraffic.count}
        subtitle={`${metrics.greyTraffic.percentage}% от общего`}
        icon={Users}
        color="text-emerald-400"
        bgColor="bg-emerald-400/10"
      />
      <MetricCard
        title="Белый поток"
        value={metrics.whiteTraffic.count}
        subtitle={`${metrics.whiteTraffic.percentage}% от общего`}
        icon={Bot}
        color="text-amber-400"
        bgColor="bg-amber-400/10"
      />
      <MetricCard
        title="Активных банов"
        value={metrics.activeBans24h}
        icon={ShieldBan}
        color="text-red-400"
        bgColor="bg-red-400/10"
      />
      <MetricCard
        title="Текущий RPS"
        value={metrics.currentRps}
        icon={Zap}
        color="text-violet-400"
        bgColor="bg-violet-400/10"
        pulse
      />
    </div>
  );
}
