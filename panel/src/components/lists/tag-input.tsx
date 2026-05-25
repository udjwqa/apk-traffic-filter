"use client";

import { useState, useCallback } from "react";
import { X, Plus } from "lucide-react";

interface TagInputProps {
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder?: string;
}

export function TagInput({
  items,
  onAdd,
  onRemove,
  placeholder = "Добавить...",
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addValues = useCallback(
    (text: string) => {
      const values = text
        .split(/[,\n]+/)
        .map((v) => v.trim())
        .filter(Boolean);
      values.forEach(onAdd);
    },
    [onAdd]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) {
        addValues(input);
        setInput("");
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (text.includes(",") || text.includes("\n")) {
      e.preventDefault();
      addValues(text);
      setInput("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="group flex items-center gap-1 rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs text-white/70 transition-colors hover:bg-white/[0.1]"
          >
            {item}
            <button
              onClick={() => onRemove(item)}
              className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white/60"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <Plus className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/20" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="h-8 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] pl-8 pr-3 text-xs text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/15 focus:bg-white/[0.03]"
        />
      </div>
    </div>
  );
}
