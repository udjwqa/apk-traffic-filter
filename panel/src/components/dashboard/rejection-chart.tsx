"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import type { RejectionReason } from "@/lib/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#94a3b8",
];

interface RejectionChartProps {
  data: RejectionReason[];
  isLoading: boolean;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RejectionReason }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[oklch(0.14_0_0)] px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-white/80">{item.label}</p>
      <p className="text-xs text-white/50">
        {item.count.toLocaleString("ru-RU")} отказов
      </p>
    </div>
  );
}

export function RejectionChart({ data, isLoading }: RejectionChartProps) {
  const total = data.reduce((s, r) => s + r.count, 0);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)] p-5">
      <h2 className="mb-4 text-sm font-medium text-white/60">
        Причины отказа
      </h2>
      {isLoading ? (
        <Skeleton className="h-[260px] w-full rounded-xl bg-white/[0.03]" />
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="count"
                  stroke="oklch(0.09 0 0)"
                  strokeWidth={2}
                >
                  {data.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      opacity={0.85}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-2">
            {data.slice(0, 6).map((item, i) => (
              <div key={item.code} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: COLORS[i % COLORS.length],
                    opacity: 0.85,
                  }}
                />
                <span className="flex-1 truncate text-xs text-white/50">
                  {item.label}
                </span>
                <span className="text-xs font-medium text-white/70">
                  {total > 0 ? Math.round((item.count / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
