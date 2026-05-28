"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { BlockList } from "@/lib/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useBlockLists() {
  const [lists, setLists] = useState<BlockList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const originalRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    fetch(`${API_URL}/api/lists`)
      .then((r) => r.json())
      .then((data: BlockList[]) => {
        setLists(data);
        data.forEach((l) =>
          originalRef.current.set(l.id, JSON.stringify(l.items))
        );
      })
      .catch(() => {
        setLists([]);
        originalRef.current.clear();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const dirtyIds = new Set(
    lists
      .filter((l) => JSON.stringify(l.items) !== originalRef.current.get(l.id))
      .map((l) => l.id)
  );

  const addItem = useCallback((listId: string, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId && !l.items.includes(trimmed)
          ? { ...l, items: [...l.items, trimmed] }
          : l
      )
    );
  }, []);

  const removeItem = useCallback((listId: string, value: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, items: l.items.filter((i) => i !== value) }
          : l
      )
    );
  }, []);

  const saveList = useCallback(
    async (listId: string) => {
      const list = lists.find((l) => l.id === listId);
      if (!list) return;

      setSavingIds((prev) => new Set(prev).add(listId));
      try {
        await fetch(`${API_URL}/api/lists/${listId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: list.items }),
        });
        originalRef.current.set(listId, JSON.stringify(list.items));
      } finally {
        setSavingIds((prev) => {
          const next = new Set(prev);
          next.delete(listId);
          return next;
        });
      }
    },
    [lists]
  );

  const saveAll = useCallback(async () => {
    const dirty = lists.filter(
      (l) => JSON.stringify(l.items) !== originalRef.current.get(l.id)
    );
    await Promise.all(dirty.map((l) => saveList(l.id)));
  }, [lists, saveList]);

  return { lists, isLoading, dirtyIds, savingIds, addItem, removeItem, saveList, saveAll };
}
