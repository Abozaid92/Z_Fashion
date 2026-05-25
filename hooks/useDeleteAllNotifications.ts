import { deleteAllNotification } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserNotificationTypes } from "@/app/api/utils/typesNotification";
import { typeMutaion } from "./useReadAllNotification";

const useDeleteAllReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: typeMutaion) => deleteAllNotification(),

    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey: ["bells", userId] });

      const prevData = queryClient.getQueryData<UserNotificationTypes[]>([
        "bells",
        userId,
      ]);

      queryClient.setQueryData(
        ["bells", userId],
        (old: UserNotificationTypes[] | undefined) => {
          if (!old) return [];
          return old.filter((notif) => notif.isRead === false);
        },
      );

      return { prevData, userId };
    },

    onError: (err, variables, context) => {
      console.error("Delete All Error:", err);
      if (context?.prevData) {
        queryClient.setQueryData(["bells", context.userId], context.prevData);
      }
      toast.error("فشل حذف الإشعارات المقروءة");
    },
  });
};

export default useDeleteAllReadNotifications;
