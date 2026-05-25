"use client";

import { useBlockLists } from "@/hooks/use-block-lists";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Save } from "lucide-react";
import { ListBlock } from "./list-block";

export function ListsContent() {
  const {
    lists,
    isLoading,
    dirtyIds,
    savingIds,
    addItem,
    removeItem,
    saveList,
    saveAll,
  } = useBlockLists();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-56 bg-white/[0.05]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-40 w-full rounded-2xl bg-white/[0.03]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Управление списками
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Редактирование стоп-листов и блокировок
          </p>
        </div>
        {dirtyIds.size > 0 && (
          <Button
            onClick={saveAll}
            className="gap-2 rounded-xl bg-white text-black font-medium hover:bg-white/90"
          >
            <Save className="h-4 w-4" />
            Сохранить все ({dirtyIds.size})
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {lists.map((list) => (
          <ListBlock
            key={list.id}
            list={list}
            isDirty={dirtyIds.has(list.id)}
            isSaving={savingIds.has(list.id)}
            onAdd={(value) => addItem(list.id, value)}
            onRemove={(value) => removeItem(list.id, value)}
            onSave={() => saveList(list.id)}
          />
        ))}
      </div>
    </div>
  );
}
