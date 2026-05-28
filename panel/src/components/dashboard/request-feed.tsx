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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pause, Play, Trash2, Wifi, WifiOff } from "lucide-react";
import { format } from "date-fns";
import type { RequestLogEntry } from "@/lib/types/dashboard";
import { RequestDetailModal } from "./request-detail-modal";

interface RequestFeedProps {
  entries: RequestLogEntry[];
  isConnected: boolean;
  isPaused: boolean;
  pause: () => void;
  resume: () => void;
  clear: () => void;
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

const FeedRow = memo(function FeedRow({
  entry,
  onClick,
}: {
  entry: RequestLogEntry;
  onClick: () => void;
}) {
  return (
    <TableRow
      onClick={onClick}
      className="cursor-pointer border-white/[0.04] transition-colors hover:bg-white/[0.03] animate-in fade-in-0 slide-in-from-top-1 duration-300"
    >
      <TableCell className="py-2 text-xs text-white/50 whitespace-nowrap">
        {format(new Date(entry.timestamp), "HH:mm:ss")}
      </TableCell>
      <TableCell className="py-2 text-xs">
        <span className="text-white/70">{entry.ip}</span>
        <span className="ml-1.5 text-white/30">
          {entry.countryCode}
        </span>
      </TableCell>
      <TableCell className="py-2 text-xs">
        <span className="text-white/60">{entry.deviceModel}</span>
        <span className="ml-1.5 text-white/30">{entry.os}</span>
      </TableCell>
      <TableCell className={`py-2 text-xs font-mono font-medium ${scoreColor(entry.score)}`}>
        {entry.score}
      </TableCell>
      <TableCell className="py-2">
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
      <TableCell className="py-2 text-xs text-white/40">
        {entry.rejectionCode || "—"}
      </TableCell>
    </TableRow>
  );
});

export function RequestFeed({
  entries,
  isConnected,
  isPaused,
  pause,
  resume,
  clear,
}: RequestFeedProps) {
  const [selectedEntry, setSelectedEntry] = useState<RequestLogEntry | null>(
    null
  );

  return (
    <>
      <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-white/60">
              Поток запросов
            </h2>
            <div className="flex items-center gap-1.5">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400/70">
                    Подключено
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-400" />
                  <span className="text-[11px] text-red-400/70">
                    Отключено
                  </span>
                </>
              )}
            </div>
            <Badge className="bg-white/[0.05] text-[10px] text-white/40 border-white/[0.08]">
              {entries.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={isPaused ? resume : pause}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/60"
              title={isPaused ? "Продолжить" : "Пауза"}
            >
              {isPaused ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={clear}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/60"
              title="Очистить"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="min-w-[600px]">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.04] hover:bg-transparent">
                <TableHead className="text-[11px] text-white/30 w-20">
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
                <TableHead className="text-[11px] text-white/30 w-28">
                  Код отказа
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-sm text-white/20"
                  >
                    Ожидание данных...
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <FeedRow
                    key={entry.id}
                    entry={entry}
                    onClick={() => setSelectedEntry(entry)}
                  />
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </ScrollArea>
      </div>

      <RequestDetailModal
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null);
        }}
      />
    </>
  );
}
