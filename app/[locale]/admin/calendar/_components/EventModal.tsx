"use client";

import { useEffect, useState } from "react";
import { CalendarEvent, EventFormData } from "./types";
import { format } from "date-fns";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CalendarEvent>) => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
}

const COLORS = [
  { name: "Emerald", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Pink", value: "#ec4899" },
  { name: "Lime", value: "#84cc16" },
];

export function EventModal({ isOpen, onClose, onSave, event, initialDate }: EventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    start: "",
    end: "",
    allDay: false,
    color: "#10b981",
  });

  useEffect(() => {
    if (isOpen) {
      if (event) {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        setFormData({
          title: event.title,
          start: format(startDate, "yyyy-MM-dd'T'HH:mm"),
          end: format(endDate, "yyyy-MM-dd'T'HH:mm"),
          allDay: event.allDay || false,
          color: event.color || "#10b981",
        });
      } else if (initialDate) {
        const dateStr = format(initialDate, "yyyy-MM-dd");
        setFormData({
          title: "",
          start: `${dateStr}T09:00`,
          end: `${dateStr}T10:00`,
          allDay: false,
          color: "#10b981",
        });
      } else {
        const now = new Date();
        const dateStr = format(now, "yyyy-MM-dd");
        setFormData({
          title: "",
          start: `${dateStr}T09:00`,
          end: `${dateStr}T10:00`,
          allDay: false,
          color: "#10b981",
        });
      }
    }
  }, [isOpen, event, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const eventData: Partial<CalendarEvent> = {
      title: formData.title.trim(),
      start: new Date(formData.start).toISOString(),
      end: new Date(formData.end).toISOString(),
      allDay: formData.allDay,
      color: formData.color,
    };

    if (event) eventData.id = event.id;

    onSave(eventData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 id="modal-title" className="text-2xl font-bold text-slate-900">
            {event ? "Edit Event" : "New Event"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-slate-700 mb-2">
              Event Title
            </label>
            <input
              id="event-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              autoFocus
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="all-day"
              type="checkbox"
              checked={formData.allDay}
              onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="all-day" className="text-sm font-medium text-slate-700">
              All day event
            </label>
          </div>

          <div>
            <label htmlFor="start-time" className="block text-sm font-medium text-slate-700 mb-2">
              Start
            </label>
            <input
              id="start-time"
              type={formData.allDay ? "date" : "datetime-local"}
              value={formData.allDay ? formData.start.split("T")[0] : formData.start}
              onChange={(e) => {
                const value = formData.allDay ? `${e.target.value}T00:00` : e.target.value;
                setFormData({ ...formData, start: value });
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="end-time" className="block text-sm font-medium text-slate-700 mb-2">
              End
            </label>
            <input
              id="end-time"
              type={formData.allDay ? "date" : "datetime-local"}
              value={formData.allDay ? formData.end.split("T")[0] : formData.end}
              onChange={(e) => {
                const value = formData.allDay ? `${e.target.value}T23:59` : e.target.value;
                setFormData({ ...formData, end: value });
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Color</label>
            <div className="grid grid-cols-4 gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`
                    relative h-12 rounded-lg border-2 transition-all hover:scale-105
                    ${formData.color === color.value ? "border-slate-900 shadow-lg" : "border-transparent hover:border-slate-300"}
                  `}
                  style={{ backgroundColor: color.value }}
                  aria-label={`Select ${color.name}`}
                >
                  {formData.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              {event ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
