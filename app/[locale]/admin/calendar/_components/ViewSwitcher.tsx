"use client";

import { ViewType } from "./types";

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const views: { value: ViewType; label: string }[] = [
  { value: "dayGridMonth", label: "Month" },
  { value: "timeGridWeek", label: "Week" },
  { value: "timeGridDay", label: "Day" },
  { value: "listMonth", label: "List" },
];

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div className="inline-flex items-center bg-slate-100 rounded-lg p-1 gap-1">
      {views.map((view) => (
        <button
          key={view.value}
          onClick={() => onViewChange(view.value)}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-all
            ${
              currentView === view.value
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }
          `}
          aria-label={`Switch to ${view.label} view`}
          aria-pressed={currentView === view.value}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
