import {
  AnnouncementBarItem,
  AnnouncementBarResponse,
  deleteAnnouncementBar,
  deleteNotification,
  fetchAnnouncementBars,
  fetchNotifications,
  getNotificationStats,
  postAnnouncementBar,
  postNotification,
} from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";

import {
  typeResponse,
  NotificationItem,
  CreateNotifPayload,
} from "@/app/[locale]/utils/admin/notifications/notitficationsTypes";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

// ── Filter types ──────────────────────────────────────────────────────────────

export type SortBy = "opens_count" | "targetUsers";
export type SortOrder = "asc" | "desc";

export interface NotifFilters {
  sortBy: SortBy;
  order: SortOrder;
}

// ── Extended payload type ─────────────────────────────────────────────────────

export type CreateNotifPayloadExtended = CreateNotifPayload & {
  barColor?: string;
  barLink?: string;
};

// ── Query keys ────────────────────────────────────────────────────────────────

export const NOTIF_KEY = (currentPage: number, filters: NotifFilters) =>
  ["global-notifications", currentPage, filters.sortBy, filters.order] as const;

export const ANNOUNCEMENT_KEY = (page: number) =>
  ["announcement-bars", page] as const;

// ── useNotifications ──────────────────────────────────────────────────────────

export function useNotifications(
  currentPage: number,
  filters: NotifFilters,
  placeholderData?: typeResponse,
) {
  return useQuery({
    queryKey: NOTIF_KEY(currentPage, filters),
    queryFn: () => fetchNotifications(filters as any),
    // queryFn: () => fetchNotifications(currentPage, filters as any),
    placeholderData,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
}

// ── useCreateNotification ─────────────────────────────────────────────────────

export function useCreateNotification(currentPage: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotifPayloadExtended) =>
      postNotification(payload),

    onMutate: async (payload) => {
      await qc.cancelQueries({
        queryKey: ["global-notifications", currentPage],
      });

      const snapshot = qc.getQueryData<typeResponse>([
        "global-notifications",
        currentPage,
      ]);
      const tempId = `__temp__${Date.now()}`;

      const optimistic: NotificationItem = {
        id: tempId,
        sender: "ADMIN",
        title: payload.title,
        description: payload.description,
        senderName: payload.senderName,
        senderImage: payload.senderImage?.trim() || null,
        opens_count: 0,
        targetUsers: 0,
        notificationTypes: payload.notificationType ?? ["IN_APP", "PUSH"],
        pushImage: undefined,
        pushUrl: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      qc.setQueryData<typeResponse>(
        ["global-notifications", currentPage],
        (prev) => {
          if (!prev) return { notifications: [optimistic], total: 1 };
          return {
            ...prev,
            notifications: [optimistic, ...prev.notifications],
            total: prev.total + 1,
          };
        },
      );

      return { snapshot, tempId };
    },

    onSuccess: ({ id }, _, ctx) => {
      if (!ctx) return;
      qc.setQueryData<typeResponse>(
        ["global-notifications", currentPage],
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            notifications: prev.notifications.map((n) =>
              n.id === ctx.tempId ? { ...n, id } : n,
            ),
          };
        },
      );
      // qc.invalidateQueries({ queryKey: ["notifications"] });
      // qc.invalidateQueries({ queryKey: ["notifications", "stats"] });
    },

    onError: (_, __, ctx) => {
      if (ctx?.snapshot !== undefined) {
        qc.setQueryData(["global-notifications", currentPage], ctx.snapshot);
      }
    },
  });
}

// ── useDeleteNotification ─────────────────────────────────────────────────────

export function useDeleteNotification(currentPage: number) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return deleteNotification(id);
    },

    onMutate: async (idToDelete) => {
      await qc.cancelQueries({
        queryKey: ["global-notifications", currentPage],
      });

      const snapshot = qc.getQueryData<typeResponse>([
        "global-notifications",
        currentPage,
      ]);

      qc.setQueryData<typeResponse>(
        ["global-notifications", currentPage],
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            notifications: prev.notifications.filter(
              (n) => n.id !== idToDelete,
            ),
            total: Math.max(0, prev.total - 1),
          };
        },
      );

      return { snapshot };
    },

    onError: (err, id, ctx) => {
      if (ctx?.snapshot) {
        qc.setQueryData(["global-notifications", currentPage], ctx.snapshot);
      }
      toast.error("failed to Delete notification");
      // console.log(err);
    },
  });
}

// ── useNotificationStats ──────────────────────────────────────────────────────

export const useNotificationStats = () => {
  return useQuery({
    queryKey: ["notifications", "stats"],
    queryFn: getNotificationStats,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// ═════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENT BAR HOOKS
// ═════════════════════════════════════════════════════════════════════════════

// ── useAnnouncementBars ───────────────────────────────────────────────────────

export function useAnnouncementBars(page = 1) {
  return useQuery({
    queryKey: ANNOUNCEMENT_KEY(page),
    queryFn: () => fetchAnnouncementBars(page),
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });
}

// ── useCreateAnnouncementBar ──────────────────────────────────────────────────

export function useCreateAnnouncementBar(page = 1) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotifPayloadExtended) =>
      postAnnouncementBar(payload),

    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: ANNOUNCEMENT_KEY(page) });

      const snapshot = qc.getQueryData<AnnouncementBarResponse>(
        ANNOUNCEMENT_KEY(page),
      );
      const tempId = `__temp__${Date.now()}`;

      const optimistic: AnnouncementBarItem = {
        id: tempId,
        title: payload.title,
        description: payload.description,
        senderName: payload.senderName,
        senderImage: payload.senderImage?.trim() || null,
        barColor: payload.barColor ?? "#e8f3ec",
        barLink: payload.barLink ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      qc.setQueryData<AnnouncementBarResponse>(
        ANNOUNCEMENT_KEY(page),
        (prev) => {
          if (!prev) return { bars: [optimistic], total: 1 };
          return {
            ...prev,
            bars: [optimistic, ...prev.bars],
            total: prev.total + 1,
          };
        },
      );

      return { snapshot, tempId };
    },

    onSuccess: ({ id }, _, ctx) => {
      if (!ctx) return;
      qc.setQueryData<AnnouncementBarResponse>(
        ANNOUNCEMENT_KEY(page),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            bars: prev.bars.map((b) =>
              b.id === ctx.tempId ? { ...b, id } : b,
            ),
          };
        },
      );
    },

    onError: (_, __, ctx) => {
      if (ctx?.snapshot !== undefined) {
        qc.setQueryData(ANNOUNCEMENT_KEY(page), ctx.snapshot);
      }
      toast.error("Failed to create announcement bar");
    },
  });
}

// ── useDeleteAnnouncementBar ──────────────────────────────────────────────────

export function useDeleteAnnouncementBar(page = 1) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAnnouncementBar(id),

    onMutate: async (idToDelete) => {
      await qc.cancelQueries({ queryKey: ANNOUNCEMENT_KEY(page) });

      const snapshot = qc.getQueryData<AnnouncementBarResponse>(
        ANNOUNCEMENT_KEY(page),
      );

      qc.setQueryData<AnnouncementBarResponse>(
        ANNOUNCEMENT_KEY(page),
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            bars: prev.bars.filter((b) => b.id !== idToDelete),
            total: Math.max(0, prev.total - 1),
          };
        },
      );

      return { snapshot };
    },

    onError: (err, _, ctx) => {
      if (ctx?.snapshot) {
        qc.setQueryData(ANNOUNCEMENT_KEY(page), ctx.snapshot);
      }
      toast.error("Failed to delete announcement bar");
      // console.log(err);
    },
  });
}
