"use client";

import { CalendarEvent } from "./types";
import { format, isToday, isTomorrow } from "date-fns";

interface SideAgendaProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function SideAgenda({ events, onEventClick }: SideAgendaProps) {
  const upcomingEvents = events
    .filter((evt) => new Date(evt.start) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 10);

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Upcoming Events
        </h3>
        <div className="text-center py-8 text-slate-500">
          <p>No upcoming events</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Upcoming Events
      </h3>
      <div className="space-y-2">
        {upcomingEvents.map((event) => {
          const startDate = new Date(event.start);

          return (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group relative"
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                style={{ backgroundColor: event.color || "#10b981" }}
              />
              <div className="ml-2">
                <p className="font-medium text-slate-900 truncate group-hover:text-emerald-600 transition-colors">
                  {event.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="font-medium">{getDateLabel(startDate)}</span>
                  {!event.allDay && (
                    <>
                      <span>•</span>
                      <span>{format(startDate, "h:mm a")}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
