"use client";

import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";
import { useChartData } from "@/hooks/use-chart-data";
import { useRequestFeed } from "@/hooks/use-request-feed";
import { MetricCardsRow } from "./metric-cards-row";
import { ChartsSection } from "./charts-section";
import { RequestFeed } from "./request-feed";

export function DashboardContent() {
  const { metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const {
    trafficData,
    rejectionReasons,
    isLoading: chartsLoading,
  } = useChartData();
  const feed = useRequestFeed();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Дашборд
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Мониторинг трафика в реальном времени
        </p>
      </div>

      <MetricCardsRow metrics={metrics} isLoading={metricsLoading} />

      <ChartsSection
        trafficData={trafficData}
        rejectionReasons={rejectionReasons}
        isLoading={chartsLoading}
      />

      <RequestFeed {...feed} />
    </div>
  );
}
