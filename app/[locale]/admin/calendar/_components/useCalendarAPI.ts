"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarEvent, ApiResponse } from "./types";
import { toast } from "sonner";
import { DOMAIN } from "@/lib/constants";

const API_BASE = `${DOMAIN}/api/admin/calendar`;
const QUERY_KEY = ["calendar-events", 1, 500] as const;

// Fetch Events
export function useCalendarEvents() {
  return useQuery<ApiResponse>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}?page=1&limit=500`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Create Event
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Partial<CalendarEvent>) => {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onMutate: async (newEvent) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<ApiResponse>(QUERY_KEY);

      if (previous) {
        queryClient.setQueryData<ApiResponse>(QUERY_KEY, {
          ...previous,
          events: [
            ...previous.events,
            { ...newEvent, id: `temp-${Date.now()}` } as CalendarEvent,
          ],
        });
      }
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous)
        queryClient.setQueryData(QUERY_KEY, context.previous);
      toast.error("Failed to create event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Event created");
    },
  });
}

// Update Event
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Partial<CalendarEvent> & { id: string }) => {
      const res = await fetch(API_BASE, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<ApiResponse>(QUERY_KEY);

      if (previous) {
        queryClient.setQueryData<ApiResponse>(QUERY_KEY, {
          ...previous,
          events: previous.events.map((e) =>
            e.id === updated.id ? { ...e, ...updated } : e,
          ),
        });
      }
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous)
        queryClient.setQueryData(QUERY_KEY, context.previous);
      toast.error("Failed to update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Event updated");
    },
  });
}

// Delete Event
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<ApiResponse>(QUERY_KEY);

      if (previous) {
        queryClient.setQueryData<ApiResponse>(QUERY_KEY, {
          ...previous,
          events: previous.events.filter((e) => e.id !== deletedId),
        });
      }
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous)
        queryClient.setQueryData(QUERY_KEY, context.previous);
      toast.error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success("Event deleted");
    },
  });
}
