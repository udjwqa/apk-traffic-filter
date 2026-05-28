"use client";

import { useState, memo } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldBan,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import type { RequestLogEntry } from "@/lib/types/dashboard";
import { RequestDetailModal } from "@/components/dashboard/request-detail-modal";
import { ConfirmDialog } from "./confirm-dialog";

interface AuditTableProps {
  entries: RequestLogEntry[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onBanIp: (ip: string) => Promise<{ success: boolean }>;
  onWhitelistIp: (ip: string) => Promise<{ success: boolean }>;
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

const AuditRow = memo(function AuditRow({
  entry,
  onSelect,
  onBan,
  onWhitelist,
}: {
  entry: RequestLogEntry;
  onSelect: () => void;
  onBan: () => void;
  onWhitelist: () => void;
}) {
  return (
    <TableRow className="border-white/[0.04] transition-colors hover:bg-white/[0.03]">
      <TableCell
        onClick={onSelect}
        className="cursor-pointer py-2.5 text-xs text-white/50 whitespace-nowrap"
      >
        {format(new Date(entry.timestamp), "dd.MM HH:mm:ss")}
      </TableCell>
      <TableCell onClick={onSelect} className="cursor-pointer py-2.5 text-xs">
        <span className="text-white/70">{entry.ip}</span>
        <span className="ml-1.5 text-white/30">{entry.countryCode}</span>
      </TableCell>
      <TableCell onClick={onSelect} className="cursor-pointer py-2.5 text-xs">
        <span className="text-white/60">{entry.deviceModel}</span>
        <span className="ml-1.5 text-white/30">{entry.os}</span>
      </TableCell>
      <TableCell
        onClick={onSelect}
        className={`cursor-pointer py-2.5 text-xs font-mono font-medium ${scoreColor(entry.score)}`}
      >
        {entry.score}
      </TableCell>
      <TableCell onClick={onSelect} className="cursor-pointer py-2.5">
        <Badge
          className={`text-[10px] border ${
            entry.verdict === "grey"
              ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
              : "bg-amber-400/10 text-amber-400 border-amber-400/20"
          }`}
        >
          {entry.verdict === "grey" ? "Серый" : "Белый"}
        </Badge>
      </TableCell>
      <TableCell
        onClick={onSelect}
        className="cursor-pointer py-2.5 text-xs text-white/40"
      >
        {entry.rejectionCode || "—"}
      </TableCell>
      <TableCell className="py-2.5">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBan();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400/50 transition-colors hover:bg-red-500/10 hover:text-red-400"
            title="Забанить IP"
          >
            <ShieldBan className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWhitelist();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-400/50 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
            title="В белый список"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export function AuditTable({
  entries,
  isLoading,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onBanIp,
  onWhitelistIp,
}: AuditTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<RequestLogEntry | null>(
    null
  );
  const [confirmAction, setConfirmAction] = useState<{
    type: "ban" | "whitelist";
    ip: string;
  } | null>(null);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === "ban") {
      await onBanIp(confirmAction.ip);
    } else {
      await onWhitelistIp(confirmAction.ip);
    }
    setConfirmAction(null);
  };

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <>
      <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)]">
        <ScrollArea className="h-[520px]">
          <div className="min-w-[700px]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.04] hover:bg-transparent">
                <TableHead className="text-[11px] text-white/30 w-28">
                  Время
                </TableHead>
                <TableHead className="text-[11px] text-white/30">
                  IP / Страна
                </TableHead>
                <TableHead className="text-[11px] text-white/30">
                  Устройство / ОС
                </TableHead>
                <TableHead className="text-[11px] text-white/30 w-16">
                  Скоринг
                </TableHead>
                <TableHead className="text-[11px] text-white/30 w-20">
                  Вердикт
                </TableHead>
                <TableHead className="text-[11px] text-white/30 w-32">
                  Код отказа
                </TableHead>
                <TableHead className="text-[11px] text-white/30 w-20">
                  Действия
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i} className="border-white/[0.04]">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j} className="py-2.5">
                          <Skeleton className="h-4 w-full bg-white/[0.04]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : entries.map((entry) => (
                    <AuditRow
                      key={entry.id}
                      entry={entry}
                      onSelect={() => setSelectedEntry(entry)}
                      onBan={() =>
                        setConfirmAction({ type: "ban", ip: entry.ip })
                      }
                      onWhitelist={() =>
                        setConfirmAction({
                          type: "whitelist",
                          ip: entry.ip,
                        })
                      }
                    />
                  ))}
            </TableBody>
          </Table>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
          <p className="text-xs text-white/30">
            {total > 0
              ? `${from}–${to} из ${total.toLocaleString("ru-RU")}`
              : "Нет записей"}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30">
              Стр. {page} из {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-7 w-7 p-0 text-white/40 hover:text-white/60 hover:bg-white/[0.05]"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-7 w-7 p-0 text-white/40 hover:text-white/60 hover:bg-white/[0.05]"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <RequestDetailModal
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null);
        }}
      />

      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => {
            if (!open) setConfirmAction(null);
          }}
          title={
            confirmAction.type === "ban"
              ? `Забанить IP ${confirmAction.ip}?`
              : `Добавить ${confirmAction.ip} в белый список?`
          }
          description={
            confirmAction.type === "ban"
              ? "IP будет внесён в перманентный чёрный список. Все запросы с этого адреса будут блокироваться."
              : "IP будет добавлен в исключения. Запросы с этого адреса всегда будут пропускаться на серую ссылку."
          }
          confirmLabel={
            confirmAction.type === "ban" ? "Забанить" : "Добавить"
          }
          variant={confirmAction.type === "ban" ? "danger" : "success"}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
