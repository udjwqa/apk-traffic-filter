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
import { ShieldBan } from "lucide-react";

interface AddBanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (ip: string, reason: string) => void;
}

export function AddBanDialog({ open, onOpenChange, onAdd }: AddBanDialogProps) {
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("manual");

  const handleSubmit = () => {
    if (!ip.trim()) return;
    onAdd(ip.trim(), reason);
    setIp("");
    setReason("manual");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-[oklch(0.11_0_0)] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ShieldBan className="h-4 w-4 text-red-400" />
            Добавить в чёрный список
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-white/60">IP-адрес</Label>
            <Input
              value={ip}
              onChange={(e) => setIp((e.target as HTMLInputElement).value)}
              placeholder="192.168.1.1"
              className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder:text-white/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-white/60">Причина</Label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex h-9 w-full items-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-white/70 outline-none"
            >
              <option value="manual">Ручная блокировка</option>
              <option value="honeypot">Honeypot</option>
              <option value="abuse">Злоупотребление</option>
              <option value="fraud">Фрод</option>
            </select>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!ip.trim()}
            className="w-full gap-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
          >
            <ShieldBan className="h-4 w-4" />
            Забанить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
