"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  User,
  AlertTriangle,
  Shield,
  Cloud,
  Server,
} from "lucide-react";
// Tooltip removed — base-ui version doesn't support asChild pattern needed here

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
  onToggleSidebar?: () => void;
}

// TODO(backend): Replace with real status polling
function useSystemStatus() {
  return {
    cfWorker: { status: "ok" as const, label: "CF Worker" },
    backend: { status: "ok" as const, label: "FastAPI" },
  };
}

// TODO(backend): Replace with real panic mode state from backend
function usePanicMode() {
  const [active, setActive] = useState(false);
  const toggle = () => setActive((p) => !p);
  return { active, toggle };
}

export function Header({ user, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "A";

  const { cfWorker, backend } = useSystemStatus();
  const panic = usePanicMode();
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 px-6 py-3">
        <div className="flex h-12 items-center justify-between rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)] px-4 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/[0.05] hover:text-white md:hidden"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Status indicators */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" title="Cloudflare Worker: Connected">
                <Cloud className="h-3 w-3 text-white/30" />
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    cfWorker.status === "ok"
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  }`}
                />
                <span className="text-[11px] text-white/30">
                  {cfWorker.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5" title="FastAPI Backend: Online">
                <Server className="h-3 w-3 text-white/30" />
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    backend.status === "ok"
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  }`}
                />
                <span className="text-[11px] text-white/30">
                  {backend.label}
                </span>
              </div>
            </div>

            {/* Panic mode indicator */}
            {panic.active && (
              <div className="flex items-center gap-1.5 rounded-lg bg-red-500/15 px-2.5 py-1 animate-pulse">
                <Shield className="h-3 w-3 text-red-400" />
                <span className="text-[11px] font-medium text-red-400">
                  ПАНИКА АКТИВНА
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Panic button */}
            <button
              onClick={() => setShowPanicConfirm(true)}
              title={
                panic.active
                  ? "Отключить режим паники — вернуть нормальную маршрутизацию"
                  : "Включить режим паники — весь трафик на белую ссылку"
              }
              className={`flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition-all ${
                panic.active
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                  : "bg-red-500/10 text-red-400/70 border border-red-500/10 hover:bg-red-500/20 hover:text-red-400"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {panic.active ? "Снять панику" : "Паника"}
            </button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.05] outline-none">
                <span className="text-sm font-medium text-white/80">
                  {user.name || "Admin"}
                </span>
                <Avatar className="h-7 w-7 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-white/10 text-[11px] font-medium text-white/60">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-xl border-white/[0.08] bg-[oklch(0.14_0_0)]"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-white/80">
                    {user.name || "Admin"}
                  </p>
                  <p className="text-xs text-white/40">{user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/[0.06]" />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                  className="gap-2 rounded-lg text-white/60 focus:bg-white/[0.05] focus:text-white/80"
                >
                  <User className="h-4 w-4" />
                  Профиль
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.06]" />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
                  className="gap-2 rounded-lg text-red-400 focus:bg-red-500/10 focus:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Dialog open={showPanicConfirm} onOpenChange={setShowPanicConfirm}>
        <DialogContent className="sm:max-w-sm bg-[oklch(0.11_0_0)] border-white/[0.08] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              {panic.active
                ? "Отключить режим паники?"
                : "Включить режим паники?"}
            </DialogTitle>
            <DialogDescription className="text-white/40">
              {panic.active
                ? "Система вернётся к нормальной маршрутизации трафика по скорингу."
                : "ВСЕ запросы будут отправляться на белую ссылку. Используйте при экстренной модерации Google для защиты приложения."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent border-t-white/[0.06]">
            <Button
              variant="ghost"
              className="text-white/50 hover:text-white/70 hover:bg-white/[0.05]"
              onClick={() => setShowPanicConfirm(false)}
            >
              Отмена
            </Button>
            <Button
              onClick={() => {
                panic.toggle();
                setShowPanicConfirm(false);
              }}
              className={
                panic.active
                  ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20"
                  : "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
              }
            >
              {panic.active ? "Отключить" : "Включить панику"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
