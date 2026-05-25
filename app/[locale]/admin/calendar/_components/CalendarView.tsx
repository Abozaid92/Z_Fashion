"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  useCalendarEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "./useCalendarAPI";
import { CalendarEvent, ViewType, ContextMenuPosition } from "./types";
import { EventModal } from "./EventModal";
import { ContextMenu } from "./ContextMenu";
import { SearchBar } from "./SearchBar";
import { ViewSwitcher } from "./ViewSwitcher";
import { SideAgenda } from "./SideAgenda";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import dynamic from "next/dynamic";
import "./calendar-styles.css";

import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
});

export default function CalendarView() {
  const calendarRef = useRef<any>(null);
  const [currentView, setCurrentView] = useState<ViewType>("dayGridMonth");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { data, isLoading } = useCalendarEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  useEffect(() => {
    const savedView = localStorage.getItem("calendar-view") as ViewType;
    if (savedView) setCurrentView(savedView);

    const handleResize = () => {
      if (window.innerWidth < 768) setCurrentView("listWeek");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("calendar-view", currentView);
  }, [currentView]);

  const filteredEvents = useMemo(
    () =>
      data?.events.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ) || [],
    [data?.events, searchQuery],
  );

  const calendarEvents = useMemo(
    () =>
      filteredEvents.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        backgroundColor: event.color || "#10b981",
        borderColor: event.color || "#10b981",
        textColor: "#ffffff",
      })),
    [filteredEvents],
  );

  const handleEventClick = (info: any) => {
    const event = data?.events.find((e) => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setSelectedDate(undefined);
      setModalOpen(true);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedEvent(null);
    setSelectedDate(new Date(selectInfo.start));
    setModalOpen(true);
  };

  const handleDateClick = (info: any) => {
    setSelectedEvent(null);
    setSelectedDate(new Date(info.date));
    setModalOpen(true);
  };

  const handleEventDrop = (info: any) => {
    updateEvent.mutate({
      id: info.event.id,
      start: info.event.start.toISOString(),
      end: info.event.end?.toISOString() || info.event.start.toISOString(),
    });
  };

  const handleEventResize = (info: any) => {
    updateEvent.mutate({
      id: info.event.id,
      end: info.event.end?.toISOString() || info.event.start.toISOString(),
    });
  };

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (eventData.id) {
      updateEvent.mutate(eventData as CalendarEvent & { id: string });
    } else {
      createEvent.mutate(eventData);
    }
  };

  const handleContextMenu = (info: any) => {
    info.jsEvent.preventDefault();
    setContextMenu({
      x: info.jsEvent.clientX,
      y: info.jsEvent.clientY,
      eventId: info.event.id,
    });
  };

  const handleDeleteFromContext = () => {
    if (contextMenu) deleteEvent.mutate(contextMenu.eventId);
  };

  const handleDuplicateFromContext = () => {
    if (contextMenu) {
      const event = data?.events.find((e) => e.id === contextMenu.eventId);
      if (event) {
        createEvent.mutate({
          title: `${event.title} (Copy)`,
          start: event.start,
          end: event.end,
          allDay: event.allDay,
          color: event.color,
        });
      }
    }
  };

  const handleChangeColorFromContext = (color: string) => {
    if (contextMenu) updateEvent.mutate({ id: contextMenu.eventId, color });
  };

  const navigateToToday = () => calendarRef.current?.getApi()?.today();
  const navigatePrev = () => calendarRef.current?.getApi()?.prev();
  const navigateNext = () => calendarRef.current?.getApi()?.next();

  useKeyboardShortcuts({
    onNewEvent: () => {
      setSelectedEvent(null);
      setSelectedDate(undefined);
      setModalOpen(true);
    },
    onToday: navigateToToday,
    onNext: navigateNext,
    onPrev: navigatePrev,
  });

  if (isLoading) {
    return <div className="animate-pulse h-[600px] bg-slate-200 rounded-2xl" />;
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={navigateToToday}
                  className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Today
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={navigatePrev}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={navigateNext}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <ViewSwitcher
                  currentView={currentView}
                  onViewChange={setCurrentView}
                />
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setSelectedDate(undefined);
                    setModalOpen(true);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
                >
                  + New
                </button>
              </div>
            </div>

            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className="p-4 calendar-container">
            <FullCalendar
              {...({ ref: calendarRef } as any)}
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
                interactionPlugin,
              ]}
              initialView={currentView}
              headerToolbar={false}
              events={calendarEvents}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={3}
              weekends={true}
              eventClick={handleEventClick}
              select={handleDateSelect}
              dateClick={handleDateClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              eventRightClick={handleContextMenu}
              height="auto"
              aspectRatio={1.8}
              eventDisplay="block"
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                meridiem: "short",
              }}
            />
          </div>
        </div>

        <div className="hidden lg:block">
          <SideAgenda
            events={filteredEvents}
            onEventClick={(event) => {
              setSelectedEvent(event);
              setSelectedDate(undefined);
              setModalOpen(true);
            }}
          />
        </div>
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        event={selectedEvent}
        initialDate={selectedDate}
      />

      <ContextMenu
        position={contextMenu}
        onClose={() => setContextMenu(null)}
        onDelete={handleDeleteFromContext}
        onDuplicate={handleDuplicateFromContext}
        onChangeColor={handleChangeColorFromContext}
      />
    </>
  );
}
