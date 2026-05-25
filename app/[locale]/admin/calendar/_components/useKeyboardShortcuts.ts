"use client";

import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  onNewEvent: () => void;
  onToday: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function useKeyboardShortcuts({ onNewEvent, onToday, onNext, onPrev }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        onNewEvent();
      }

      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        onToday();
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onNewEvent, onToday, onNext, onPrev]);
}
