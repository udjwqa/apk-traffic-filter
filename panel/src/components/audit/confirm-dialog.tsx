"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  variant: "danger" | "success";
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  variant,
  onConfirm,
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-[oklch(0.11_0_0)] border-white/[0.08] text-white">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription className="text-white/40">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-transparent border-t-white/[0.06]">
          <Button
            variant="ghost"
            className="text-white/50 hover:text-white/70 hover:bg-white/[0.05]"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={
              variant === "danger"
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20"
            }
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
