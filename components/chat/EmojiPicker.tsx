"use client";

import { useTranslations } from "next-intl";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";

// ── Types ──────────────────────────────────────────────────
interface EmojiCategory {
  name: string;
  emojis: string[];
}

interface EmojiData {
  categories: EmojiCategory[];
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────
const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  onClose,
}) => {
  const [emojiData, setEmojiData] = useState<EmojiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  // ── Fetch emojis from JSON ────────────────────────────
  useEffect(() => {
    const fetchEmojis = async () => {
      try {
        const res = await fetch("/data/emojis.json");
        const data: EmojiData = await res.json();
        setEmojiData(data);
      } catch (err) {
        console.error("فشل تحميل الإيموجي:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmojis();
  }, []);

  // ── Filter emojis by search ───────────────────────────
  const filteredEmojis = useCallback((): string[] => {
    if (!emojiData) return [];
    return emojiData.categories[activeCategory]?.emojis ?? [];

    // بحث في كل الكاتيجوريز
  }, [emojiData, activeCategory]);

  // ── Render ────────────────────────────────────────────
  return (
    <div
      ref={pickerRef}
      className="absolute bottom-16 left-0 z-50 w-72 rounded-2xl border border-gray-200 bg-white shadow-2xl"
      style={{ maxHeight: "340px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
        <span className="text-xs font-semibold text-gray-600">إيموجي</span>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          type="button"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Category Tabs */}
      {emojiData && (
        <div className="flex gap-1 overflow-x-auto px-3 pb-2 scrollbar-hide">
          {emojiData.categories.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(idx)}
              type="button"
              className={`flex-shrink-0 cursor-pointer rounded-lg px-2.5 py-1 text-[10px] font-medium transition-all ${
                activeCategory === idx ?
                  "bg-emerald-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Emojis Grid */}
      <div className="overflow-y-auto px-2 pb-3" style={{ maxHeight: "200px" }}>
        {isLoading ?
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500" />
          </div>
        : <div className="grid grid-cols-8 gap-0.5">
            {filteredEmojis().map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                onClick={() => onEmojiSelect(emoji)}
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-all hover:bg-emerald-50 hover:scale-110 active:scale-95"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        }

        {!isLoading && filteredEmojis().length === 0 && (
          <p className="py-6 text-center text-xs text-gray-400">
            لا توجد نتائج 😕
          </p>
        )}
      </div>
    </div>
  );
};

EmojiPicker.displayName = "EmojiPicker";
export default EmojiPicker;
