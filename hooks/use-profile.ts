// TanStack Query v5 Hooks
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserProfile, AdminAction } from "@/app/[locale]/_lib/profile";

const API_BASE = "/api/users/profile";

// Fetch user profile (works for both user and admin views)
export function useUserProfile(targetUserId?: string) {
  return useQuery({
    queryKey: ["user-profile", targetUserId || "me"],
    queryFn: async () => {
      const url =
        targetUserId ? `${API_BASE}?targetUserId=${targetUserId}` : API_BASE;

      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch profile");
      }

      return res.json() as Promise<UserProfile>;
    },
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Admin: Send notification
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      title: string;
      description: string;
    }) => {
      const res = await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to send notification");
      return res.json() as Promise<AdminAction>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

// Admin: Toggle user status
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      newStatus: "ACTIVE" | "BANNED";
    }) => {
      const res = await fetch("/api/admin/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update status");
      return res.json() as Promise<AdminAction>;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile", variables.userId],
      });
    },
  });
}
