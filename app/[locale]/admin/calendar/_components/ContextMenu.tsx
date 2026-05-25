"use client";

import { useEffect, useRef } from "react";
import { ContextMenuPosition } from "./types";

interface ContextMenuProps {
  position: ContextMenuPosition | null;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onChangeColor: (color: string) => void;
}

const QUICK_COLORS = [
  { name: "Emerald", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
];

export function ContextMenu({ position, onClose, onDelete, onDuplicate, onChangeColor }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (position) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [position, onClose]);

  if (!position) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-150"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
      role="menu"
    >
      <button
        onClick={() => {
          onDuplicate();
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors"
        role="menuitem"
      >
        Duplicate
      </button>

      <div className="px-4 py-2 border-t border-b border-slate-200 my-2">
        <div className="text-xs font-medium text-slate-500 mb-2">Change Color</div>
        <div className="flex gap-2">
          {QUICK_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                onChangeColor(color.value);
                onClose();
              }}
              className="w-8 h-8 rounded-md border-2 border-transparent hover:border-slate-400 transition-all hover:scale-110"
              style={{ backgroundColor: color.value }}
              aria-label={`Change to ${color.name}`}
              role="menuitem"
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
        role="menuitem"
      >
        Delete Event
      </button>
    </div>
  );
}
