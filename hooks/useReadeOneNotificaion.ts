import { readOneNotification } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserNotificationTypes } from "@/app/api/utils/typesNotification";
export interface typeMutaion {
  userId: string;
  notificationId: string;
}

const useUpdateIsReadInNotification = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ notificationId }: typeMutaion) =>
      readOneNotification(notificationId),

    onMutate: async ({ userId, notificationId }) => {
      await queryClient.cancelQueries({ queryKey: ["bells", userId] });

      const prevData = queryClient.getQueryData<UserNotificationTypes[]>([
        "bells",
        userId,
      ]);

      queryClient.setQueryData(
        ["bells", userId],
        (old: UserNotificationTypes[] | undefined) => {
          if (!old || old.length === 0) return old;
          const updatedNotifications = old.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif,
          );

          return updatedNotifications;
        },
      );

      return { prevData, userId }; // بنباصي الـ userId للـ onError
    },

    onError: (err, variables, context) => {
      console.error("Mutation Error:", err);
      if (context?.prevData) {
        queryClient.setQueryData(["bells", context.userId], context.prevData);
      }
      toast.error("عفواً، فشل تحديث حالة الإشعار");
    },

    onSettled: (data, error, variables) => {
      // إعادة جلب البيانات للتأكد إن الكاش متزامن 100% مع السيرفر
      queryClient.invalidateQueries({ queryKey: ["bells", variables.userId] });
    },
  });

  return mutation;
};

export default useUpdateIsReadInNotification;
