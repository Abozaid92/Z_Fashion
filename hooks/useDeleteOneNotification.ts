import { deleteOneNotification } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserNotificationTypes } from "@/app/api/utils/typesNotification";

export interface typeDeleteMutation {
  userId: string;
  notificationId: string;
}

const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId }: typeDeleteMutation) =>
      deleteOneNotification(notificationId),

    onMutate: async ({ userId, notificationId }) => {
      await queryClient.cancelQueries({ queryKey: ["bells", userId] });

      const prevData = queryClient.getQueryData<UserNotificationTypes[]>([
        "bells",
        userId,
      ]);

      queryClient.setQueryData(
        ["bells", userId],
        (old: UserNotificationTypes[] | undefined) => {
          if (!old) return [];
          return old.filter((notif) => notif.id !== notificationId);
        },
      );

      return { prevData, userId };
    },

    onError: (err, variables, context) => {
      console.error("Delete Error:", err);
      if (context?.prevData) {
        queryClient.setQueryData(["bells", context.userId], context.prevData);
      }
      toast.error("عفواً، فشل حذف الإشعار");
    },

    onSettled: (data, error, variables) => {
      // queryClient.invalidateQueries({ queryKey: ["bells", variables.userId] });
    },
  });
};

export default useDeleteNotification;
