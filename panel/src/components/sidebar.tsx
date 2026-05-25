"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Settings,
  Users,
  Activity,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useMockMode } from "@/lib/mock-mode-context";

const navigation = [
  { name: "Дашборд", href: "/dashboard", icon: LayoutDashboard },
  { name: "Приложения", href: "/dashboard/apps", icon: Package },
  { name: "Пользователи", href: "/dashboard/users", icon: Users },
  { name: "Активность", href: "/dashboard/activity", icon: Activity },
  { name: "Безопасность", href: "/dashboard/security", icon: Shield },
  { name: "Настройки", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isMockEnabled, toggle } = useMockMode();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/[0.06] bg-[oklch(0.07_0_0)]">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">
          Panel
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:bg-white/[0.05] hover:text-white/70"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-4 space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
          <div>
            <p className="text-xs text-white/50">Mock-данные</p>
            <p className="text-[10px] text-white/20">
              {isMockEnabled ? "Включены" : "Выключены"}
            </p>
          </div>
          <Switch
            checked={isMockEnabled}
            onCheckedChange={toggle}
            size="sm"
          />
        </div>
        <div className="rounded-xl bg-white/[0.03] px-3 py-2.5 text-xs text-white/25">
          v1.0.0
        </div>
      </div>
    </aside>
  );
}
