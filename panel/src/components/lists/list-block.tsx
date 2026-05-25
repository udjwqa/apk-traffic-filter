"use client";

import { Button } from "@/components/ui/button";
import { Save, Loader2, FileText } from "lucide-react";
import type { BlockList } from "@/lib/types/dashboard";
import { TagInput } from "./tag-input";

interface ListBlockProps {
  list: BlockList;
  isDirty: boolean;
  isSaving: boolean;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  onSave: () => void;
}

export function ListBlock({
  list,
  isDirty,
  isSaving,
  onAdd,
  onRemove,
  onSave,
}: ListBlockProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.11_0_0)] p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
            <FileText className="h-3.5 w-3.5 text-white/40" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white/80">{list.name}</h3>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="font-mono text-[11px] text-white/25">
                {list.filename}
              </span>
              <span className="text-[11px] text-white/20">
                {list.items.length} записей
              </span>
            </div>
            <p className="mt-1 text-[11px] text-white/30">
              {list.description}
            </p>
          </div>
        </div>

        {isDirty && (
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="h-7 gap-1.5 rounded-lg bg-white/10 text-xs text-white/70 hover:bg-white/15"
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            Сохранить
          </Button>
        )}
      </div>

      <TagInput
        items={list.items}
        onAdd={onAdd}
        onRemove={onRemove}
        placeholder={`Добавить в ${list.filename}...`}
      />
    </div>
  );
}
