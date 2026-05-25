import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  pulse?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
  pulse,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)] p-5 transition-all duration-200 hover:border-white/[0.1] hover:bg-[oklch(0.13_0_0)]">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${bgColor}`}
        >
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        {pulse && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-400" />
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-semibold tracking-tight text-white">
          {typeof value === "number" ? value.toLocaleString("ru-RU") : value}
        </p>
        <p className="mt-1 text-sm text-white/40">{title}</p>
        {subtitle && (
          <p className="mt-0.5 text-xs text-white/30">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
