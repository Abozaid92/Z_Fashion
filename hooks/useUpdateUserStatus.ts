// app/admin/users/_hooks/useUpdateUserStatus.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DOMAIN } from "@/lib/constants";

// الفانكشن اللي بتكلم الـ API
async function patchUserStatus(payload: { status: string; userId: string }) {
  const { data } = await axios.patch(`${DOMAIN}/api/users/details`, payload);
  return data;
}

export function useUpdateUserStatus(
  filters: any,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchUserStatus,

    onMutate: async (newStatusPayload) => {
      // 1. إلغاء الريكويستات الجارية لضمان عدم حدوث تضارب
      await queryClient.cancelQueries({ queryKey: ["users", "list", filters] });
      await queryClient.cancelQueries({ queryKey: ["users-stats"] });

      // 2. أخذ نسخة احتياطية من الكاش الحالي
      const previousUsers = queryClient.getQueryData([
        "users",
        "list",
        filters,
      ]);
      const previousStats = queryClient.getQueryData(["users-stats"]);

      // 3. تحديث قائمة المستخدمين تفاؤلياً (Optimistic)
      queryClient.setQueryData(["users", "list", filters], (old: any) => {
        if (!old) return old;
        const usersList = Array.isArray(old) ? old : old.users || [];
        const updatedList = usersList.map((user: any) =>
          user.id === newStatusPayload.userId ?
            { ...user, status: newStatusPayload.status }
          : user,
        );
        return Array.isArray(old) ? updatedList : (
            { ...old, users: updatedList }
          );
      });

      // 4. تحديث الإحصائيات (Stats) تفاؤلياً
      queryClient.setQueryData(["users-stats"], (oldStats: any) => {
        if (!oldStats || !Array.isArray(oldStats)) return oldStats;

        const usersList =
          Array.isArray(previousUsers) ? previousUsers : (
            (previousUsers as any)?.users || []
          );
        const userBeforeUpdate = usersList.find(
          (u: any) => u.id === newStatusPayload.userId,
        );
        const oldStatus = userBeforeUpdate?.status;

        if (!oldStatus || oldStatus === newStatusPayload.status)
          return oldStats;

        return oldStats.map((item: any) => {
          if (item.status === oldStatus) {
            return {
              ...item,
              _count: { status: Math.max(0, item._count.status - 1) },
            };
          }
          if (item.status === newStatusPayload.status) {
            return { ...item, _count: { status: item._count.status + 1 } };
          }
          return item;
        });
      });

      return { previousUsers, previousStats };
    },

    // في حالة الخطأ نرجع الداتا القديمة
    onError: (err, newPayload, context) => {
      queryClient.setQueryData(
        ["users", "list", filters],
        context?.previousUsers,
      );
      queryClient.setQueryData(["users-stats"], context?.previousStats);
    },

    // دايماً بنعمل ريفريش للداتا من السيرفر بعد ما نخلص لضمان الدقة
    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: ["users", "list", filters] });
      // queryClient.invalidateQueries({ queryKey: ["users-stats"] });
    },

    onSuccess: () => {
      if (onSuccessCallback) onSuccessCallback();
    },
  });
}
