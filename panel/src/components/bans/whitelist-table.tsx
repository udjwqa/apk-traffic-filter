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
import { Search, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { WhitelistEntry } from "@/lib/types/dashboard";
import { ConfirmDialog } from "@/components/audit/confirm-dialog";
import { AddExceptionDialog } from "./add-exception-dialog";

interface WhitelistTableProps {
  entries: WhitelistEntry[];
  total: number;
  search: string;
  onSearchChange: (v: string) => void;
  onRemove: (id: string) => void;
  onAdd: (ip: string, label: string, deviceId?: string) => void;
}

export function WhitelistTable({
  entries,
  total,
  search,
  onSearchChange,
  onRemove,
  onAdd,
}: WhitelistTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const confirmEntry = entries.find((e) => e.id === confirmId);

  return (
    <>
      <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-white/70">
              Белый список (Исключения)
            </h2>
            <Badge className="bg-emerald-400/10 text-[10px] text-emerald-400 border-emerald-400/20">
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
                placeholder="Поиск..."
                className="h-7 w-40 rounded-lg border-white/[0.06] bg-white/[0.02] pl-7 text-xs text-white placeholder:text-white/20"
              />
            </div>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              className="h-7 gap-1.5 rounded-lg bg-emerald-500/15 text-xs text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/15"
            >
              <Plus className="h-3 w-3" />
              Добавить исключение
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.04] hover:bg-transparent">
                <TableHead className="text-[11px] text-white/30">IP</TableHead>
                <TableHead className="text-[11px] text-white/30">
                  Device ID
                </TableHead>
                <TableHead className="text-[11px] text-white/30">
                  Метка
                </TableHead>
                <TableHead className="text-[11px] text-white/30">
                  Дата
                </TableHead>
                <TableHead className="text-[11px] text-white/30">
                  Добавил
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
                    colSpan={6}
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
                    <TableCell className="py-2 text-xs font-mono text-white/40">
                      {entry.deviceId || "—"}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge className="bg-white/[0.05] text-[10px] text-white/60 border-white/[0.08]">
                        {entry.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-white/40">
                      {format(new Date(entry.addedAt), "dd.MM.yy")}
                    </TableCell>
                    <TableCell className="py-2 text-xs text-white/40">
                      {entry.addedBy}
                    </TableCell>
                    <TableCell className="py-2">
                      <button
                        onClick={() => setConfirmId(entry.id)}
                        className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs text-red-400/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                        Удалить
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
          title={`Удалить ${confirmEntry.ip} из белого списка?`}
          description={`${confirmEntry.label} потеряет привилегированный доступ и будет проходить стандартные проверки.`}
          confirmLabel="Удалить"
          variant="danger"
          onConfirm={() => {
            onRemove(confirmEntry.id);
            setConfirmId(null);
          }}
        />
      )}

      <AddExceptionDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        onAdd={onAdd}
      />
    </>
  );
}
