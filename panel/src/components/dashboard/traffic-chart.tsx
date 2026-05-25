"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { TrafficDataPoint } from "@/lib/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface TrafficChartProps {
  data: TrafficDataPoint[];
  isLoading: boolean;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[oklch(0.14_0_0)] px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-medium text-white/60">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/50">
            {entry.dataKey === "grey" ? "Серый" : "Белый"}:
          </span>
          <span className="font-medium text-white">
            {entry.value.toLocaleString("ru-RU")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TrafficChart({ data, isLoading }: TrafficChartProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)] p-5">
      <h2 className="mb-4 text-sm font-medium text-white/60">
        Распределение трафика за 24ч
      </h2>
      {isLoading ? (
        <Skeleton className="h-[260px] w-full rounded-xl bg-white/[0.03]" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(1 0 0 / 0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              stroke="oklch(1 0 0 / 0.2)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              stroke="oklch(1 0 0 / 0.2)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) =>
                value === "grey" ? "Серый" : "Белый"
              }
              wrapperStyle={{ fontSize: 12, color: "oklch(1 0 0 / 0.4)" }}
            />
            <Line
              type="monotone"
              dataKey="grey"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#34d399" }}
            />
            <Line
              type="monotone"
              dataKey="white"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#f59e0b" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
