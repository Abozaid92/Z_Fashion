export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  color?: string;
  createdAt?: Date | string;
}

export interface EventFormData {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
}

export interface ApiResponse {
  events: CalendarEvent[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type ViewType = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listMonth" | "listWeek";

export interface ContextMenuPosition {
  x: number;
  y: number;
  eventId: string;
}
