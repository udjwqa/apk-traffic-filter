"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, ShieldOff } from "lucide-react";
import { format } from "date-fns";
import type { BannedEntry } from "@/lib/types/dashboard";
import { ConfirmDialog } from "@/components/audit/confirm-dialog";
import { AddBanDialog } from "./add-ban-dialog";

const SOURCE_COLORS: Record<string, string> = {
  Ручной: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  Honeypot: "bg-red-400/10 text-red-400 border-red-400/20",
  Автоматический: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  Cloudflare: "bg-orange-400/10 text-orange-400 border-orange-400/20",
};

interface BanTableProps {
  entries: BannedEntry[];
  total: number;
  search: string;
  onSearchChange: (v: string) => void;
  onUnban: (id: string) => void;
  onAddBan: (ip: string, reason: string) => void;
}

export function BanTable({
  entries,
  total,
  search,
  onSearchChange,
  onUnban,
  onAddBan,
}: BanTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const confirmEntry = entries.find((e) => e.id === confirmId);

  return (
    <>
      <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-white/70">
              Чёрный список IP
            </h2>
            <Badge className="bg-red-400/10 text-[10px] text-red-400 border-red-400/20">
              {total}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/20" />
              <Input
                value={search}
                onChange={(e) =>
                  onSearchChange((e.target as HTMLInputElement).value)
                }
                placeholder="Поиск IP..."
                className="h-7 w-40 rounded-lg border-white/[0.06] bg-white/[0.02] pl-7 text-xs text-white placeholder:text-white/20"
              />
            </div>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              className="h-7 gap-1.5 rounded-lg bg-red-500/15 text-xs text-red-400 hover:bg-red-500/25 border border-red-500/15"
            >
              <Plus className="h-3 w-3" />
              Добавить
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[360px]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.04] hover:bg-transparent">
                <TableHead className="text-[11px] text-white/30">IP</TableHead>
                <TableHead className="text-[11px] text-white/30">
                  Источник
                </TableHead>
                <TableHead className="text-[11px] text-white/30">
                  Дата
                </TableHead>
                <TableHead className="text-[11px] text-white/30">
                  Заблокировал
                </TableHead>
                <TableHead className="text-[11px] text-white/30 w-20">
                  Действие
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-20 text-center text-xs text-white/20"
                  >
                    {search ? "Ничего не найдено" : "Список пуст"}
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="border-white/[0.04] hover:bg-white/[0.02]"
                  >
                    <TableCell className="py-2 text-xs font-mono text-white/70">
                      {entry.ip}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge
                        className={`text-[10px] border ${SOURCE_COLORS[entry.source] || "bg-white/5 text-white/40"}`}
                      >
                        {entry.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-white/40">
                      {format(new Date(entry.bannedAt), "dd.MM.yy HH:mm")}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-white/40">
                      {entry.bannedBy}
                    </TableCell>
                    <TableCell className="py-2">
                      <button
                        onClick={() => setConfirmId(entry.id)}
                        className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs text-emerald-400/60 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
                      >
                        <ShieldOff className="h-3 w-3" />
                        Разбанить
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {confirmEntry && (
        <ConfirmDialog
          open={!!confirmId}
          onOpenChange={(open) => {
            if (!open) setConfirmId(null);
          }}
          title={`Разбанить ${confirmEntry.ip}?`}
          description="IP будет удалён из чёрного списка и снова сможет проходить проверки."
          confirmLabel="Разбанить"
          variant="success"
          onConfirm={() => {
            onUnban(confirmEntry.id);
            setConfirmId(null);
          }}
        />
      )}

      <AddBanDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        onAdd={onAddBan}
      />
    </>
  );
}
