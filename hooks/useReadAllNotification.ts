import { readAllNotification } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { UserNotificationTypes } from "@/app/api/utils/typesNotification";

export interface typeMutaion {
  userId: string;
}

const useUpdateAllIsReadInNotification = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ userId }: typeMutaion) => readAllNotification(),

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

          return old.map((notif) => ({
            ...notif,
            isRead: true,
          }));
        },
      );

      return { prevData, userId };
    },

    onError: (err, variables, context) => {
      console.error("Update All Error:", err);
      // لو السيرفر وقع، رجع الحالة القديمة للكاش باستخدام الـ userId الصح
      if (context?.prevData) {
        queryClient.setQueryData(["bells", context.userId], context.prevData);
      }
      toast.error("فشل تحديث جميع الإشعارات");
    },

    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bells", variables.userId] });
    },
  });

  return mutation;
};

export default useUpdateAllIsReadInNotification;
