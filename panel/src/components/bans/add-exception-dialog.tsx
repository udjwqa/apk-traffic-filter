"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

interface AddExceptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (ip: string, label: string, deviceId?: string) => void;
}

export function AddExceptionDialog({
  open,
  onOpenChange,
  onAdd,
}: AddExceptionDialogProps) {
  const [ip, setIp] = useState("");
  const [label, setLabel] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const handleSubmit = () => {
    if (!ip.trim() || !label.trim()) return;
    onAdd(ip.trim(), label.trim(), deviceId.trim() || undefined);
    setIp("");
    setLabel("");
    setDeviceId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-[oklch(0.11_0_0)] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Добавить исключение
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-white/60">IP-адрес</Label>
            <Input
              value={ip}
              onChange={(e) => setIp((e.target as HTMLInputElement).value)}
              placeholder="10.0.1.100"
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder:text-white/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-white/60">Метка</Label>
            <Input
              value={label}
              onChange={(e) => setLabel((e.target as HTMLInputElement).value)}
              placeholder="Разработчик, Тестер QA..."
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder:text-white/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-white/60">
              Device ID (необязательно)
            </Label>
            <Input
              value={deviceId}
              onChange={(e) =>
                setDeviceId((e.target as HTMLInputElement).value)
              }
              placeholder="DEV-001-ABCD"
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder:text-white/20"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!ip.trim() || !label.trim()}
            className="w-full gap-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20"
          >
            <ShieldCheck className="h-4 w-4" />
            Добавить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
