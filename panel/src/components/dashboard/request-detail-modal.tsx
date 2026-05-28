"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check } from "lucide-react";
import type { RequestLogEntry } from "@/lib/types/dashboard";
import { format } from "date-fns";

interface RequestDetailModalProps {
  entry: RequestLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestDetailModal({
  entry,
  open,
  onOpenChange,
}: RequestDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "headers" | "jsMetrics" | "playIntegrity" | "raw"
  >("headers");

  if (!entry) return null;

  const copyJson = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(entry.rawPayload, null, 2)
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs = [
    { id: "headers" as const, label: "Заголовки" },
    { id: "jsMetrics" as const, label: "JS метрики" },
    { id: "playIntegrity" as const, label: "Play Integrity" },
    { id: "raw" as const, label: "Raw JSON" },
  ];

  const renderJsMetrics = () => {
    const js = (entry.rawPayload.jsMetrics || {}) as Record<string, unknown>;
    if (!js || Object.keys(js).length === 0) {
      return (
        <p className="text-xs text-white/30">
          Нет JS-метрик (запрос без tracker.js)
        </p>
      );
    }

    const battery = (js.battery || {}) as Record<string, unknown>;
    const accel = (js.accelerometer || {}) as Record<string, unknown>;
    const input = (js.input || {}) as Record<string, unknown>;
    const webgl = (js.webgl || {}) as Record<string, unknown>;
    const scr = (js.screen || {}) as Record<string, unknown>;
    const hw = (js.hardware || {}) as Record<string, unknown>;

    const batteryLevel = battery.level != null ? Math.round(Number(battery.level) * 100) : null;
    const isBatterySuspicious = batteryLevel === 100 && battery.chargingTime === 0;
    const isStaticDevice = Number(accel.samples || 0) > 0 && Number(accel.averageDeviation ?? 1) < 0.08;
    const isMouseNoTouch = Number(input.mouseClicks || 0) > 0 && Number(input.touchEvents || 0) === 0;
    const isNoTouchSupport = input.touchSupported === false;

    const gpuBlockList = ["swiftshader", "virtualbox", "vmware", "llvmpipe", "android emulator"];
    const renderer = String(webgl.renderer || "").toLowerCase();
    const isEmulatorGpu = gpuBlockList.some((g) => renderer.includes(g));

    type Status = "ok" | "warn" | "danger";
    const rows: { label: string; value: string; status: Status }[] = [
      {
        label: "Батарея",
        value: batteryLevel != null
          ? `${batteryLevel}% ${battery.charging ? "(зарядка)" : ""}`
          : "N/A",
        status: isBatterySuspicious ? "danger" : "ok",
      },
      {
        label: "Акселерометр",
        value: Number(accel.samples || 0) > 0
          ? `deviation=${accel.averageDeviation} (${accel.samples} samples)`
          : "N/A",
        status: isStaticDevice ? "danger" : "ok",
      },
      {
        label: "WebGL GPU",
        value: String(webgl.renderer || "N/A"),
        status: isEmulatorGpu ? "danger" : "ok",
      },
      {
        label: "WebGL Vendor",
        value: String(webgl.vendor || "N/A"),
        status: "ok",
      },
      {
        label: "Таймзона",
        value: String(js.timezone || "N/A"),
        status: ["Etc/UTC", "UTC", "Etc/GMT"].includes(String(js.timezone)) ? "warn" : "ok",
      },
      {
        label: "Мышь / Тач",
        value: `${Number(input.mouseClicks || 0)} кликов / ${Number(input.touchEvents || 0)} тачей`,
        status: isMouseNoTouch ? "danger" : "ok",
      },
      {
        label: "Touch Support",
        value: input.touchSupported ? "Да" : "Нет",
        status: isNoTouchSupport ? "warn" : "ok",
      },
      {
        label: "Экран",
        value: scr.width
          ? `${scr.width}×${scr.height} @${scr.pixelRatio}x`
          : "N/A",
        status: "ok",
      },
      {
        label: "Язык",
        value: String(js.language || "N/A"),
        status: String(js.language || "").startsWith("en") ? "warn" : "ok",
      },
      {
        label: "CPU / RAM",
        value: `${hw.concurrency || "?"} cores / ${hw.memory || "?"} GB`,
        status: "ok",
      },
      {
        label: "Canvas FP",
        value: String(((js.canvas || {}) as Record<string, unknown>).hash || "N/A"),
        status: "ok",
      },
    ];

    const statusColors: Record<Status, string> = {
      ok: "text-emerald-400",
      warn: "text-amber-400",
      danger: "text-red-400",
    };
    const statusLabels: Record<Status, string> = {
      ok: "ОК",
      warn: "Подозрение",
      danger: "Подозрение",
    };

    return (
      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2"
          >
            <span className="text-xs text-white/40 w-28 shrink-0">
              {row.label}
            </span>
            <span className="flex-1 text-xs text-white/70 truncate px-2">
              {row.value}
            </span>
            <span className={`text-[10px] font-medium ${statusColors[row.status]}`}>
              {statusLabels[row.status]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderPlayIntegrity = () => {
    const pi = (entry.rawPayload.playIntegrity || {}) as Record<string, unknown>;
    if (!pi || Object.keys(pi).length === 0) {
      return (
        <p className="text-xs text-white/30">
          Нет данных Play Integrity (проверка не выполнялась)
        </p>
      );
    }

    const tp = (pi.tokenPayloadExternal || pi) as Record<string, unknown>;
    const device = (tp.deviceIntegrity || {}) as Record<string, unknown>;
    const app = (tp.appIntegrity || {}) as Record<string, unknown>;
    const account = (tp.accountDetails || {}) as Record<string, unknown>;
    const req = (tp.requestDetails || {}) as Record<string, unknown>;

    const deviceVerdict = (device.deviceRecognitionVerdict || []) as string[];
    const appVerdict = String(app.appRecognitionVerdict || "UNEVALUATED");
    const licenseVerdict = String(account.appLicensingVerdict || "UNEVALUATED");
    const packageName = String(req.requestPackageName || "");

    const meetsBasic = deviceVerdict.includes("MEETS_BASIC_INTEGRITY");
    const meetsDevice = deviceVerdict.includes("MEETS_DEVICE_INTEGRITY");
    const meetsStrong = deviceVerdict.includes("MEETS_STRONG_INTEGRITY");
    const virtualOnly = deviceVerdict.includes("MEETS_VIRTUAL_INTEGRITY") && !meetsDevice;

    type S = "ok" | "warn" | "danger";
    const rows: { label: string; value: string; status: S }[] = [
      {
        label: "Device Integrity",
        value: deviceVerdict.length > 0 ? deviceVerdict.join(", ") : "Нет вердикта",
        status: meetsDevice || meetsStrong ? "ok" : virtualOnly ? "danger" : deviceVerdict.length === 0 ? "danger" : "warn",
      },
      {
        label: "BASIC",
        value: meetsBasic ? "Пройдено" : "Не пройдено",
        status: meetsBasic ? "ok" : "danger",
      },
      {
        label: "DEVICE",
        value: meetsDevice ? "Пройдено" : "Не пройдено",
        status: meetsDevice ? "ok" : "danger",
      },
      {
        label: "STRONG",
        value: meetsStrong ? "Пройдено" : "Не пройдено",
        status: meetsStrong ? "ok" : "warn",
      },
      {
        label: "App Recognition",
        value: appVerdict === "PLAY_RECOGNIZED" ? "PLAY_RECOGNIZED" : appVerdict,
        status: appVerdict === "PLAY_RECOGNIZED" ? "ok" : "danger",
      },
      {
        label: "App Licensing",
        value: licenseVerdict,
        status: licenseVerdict === "LICENSED" ? "ok" : licenseVerdict === "UNEVALUATED" ? "warn" : "danger",
      },
      {
        label: "Package",
        value: packageName || "N/A",
        status: "ok",
      },
    ];

    const colors: Record<S, string> = { ok: "text-emerald-400", warn: "text-amber-400", danger: "text-red-400" };
    const labels: Record<S, string> = { ok: "Пройдено", warn: "Внимание", danger: "Не пройдено" };

    return (
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
            <span className="text-xs text-white/40 w-32 shrink-0">{r.label}</span>
            <span className="flex-1 text-xs text-white/70 truncate px-2 font-mono">{r.value}</span>
            <span className={`text-[10px] font-medium ${colors[r.status]}`}>{labels[r.status]}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === "headers") {
      return (
        <div className="space-y-1">
          {Object.entries(entry.rawPayload.headers).map(([key, value]) => (
            <div key={key} className="flex gap-2 text-xs">
              <span className="shrink-0 font-medium text-white/50">{key}:</span>
              <span className="break-all text-white/70">{String(value)}</span>
            </div>
          ))}
        </div>
      );
    }
    if (activeTab === "jsMetrics") {
      return renderJsMetrics();
    }
    if (activeTab === "playIntegrity") {
      return renderPlayIntegrity();
    }
    if (activeTab === "raw") {
      return (
        <pre className="text-xs text-white/60 whitespace-pre-wrap break-all">
          {JSON.stringify(entry.rawPayload, null, 2)}
        </pre>
      );
    }
    const data = entry.rawPayload[activeTab];
    return (
      <pre className="text-xs text-white/60">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-[oklch(0.11_0_0)] border-white/[0.08] text-white max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-white">
              {entry.ip}
            </DialogTitle>
            <Badge
              className={`text-[10px] ${
                entry.verdict === "grey"
                  ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                  : "bg-amber-400/10 text-amber-400 border-amber-400/20"
              }`}
            >
              {entry.verdict === "grey" ? "Серый" : "Белый"}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span>
              {format(new Date(entry.timestamp), "dd.MM.yyyy HH:mm:ss")}
            </span>
            <span>
              {entry.country} ({entry.countryCode})
            </span>
            <span>{entry.deviceModel}</span>
            <span>Score: {entry.score}</span>
          </div>
        </DialogHeader>

        <div className="flex gap-1 rounded-xl bg-white/[0.03] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ScrollArea className="h-[300px] rounded-xl bg-white/[0.02] p-3">
          <div className="font-mono">{renderContent()}</div>
        </ScrollArea>

        <button
          onClick={copyJson}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] py-2 text-xs text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/70"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              Скопировано
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Скопировать JSON
            </>
          )}
        </button>
      </DialogContent>
    </Dialog>
  );
}
