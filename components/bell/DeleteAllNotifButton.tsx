import { useTranslations } from "next-intl";
import useDeleteAllReadNotifications from "@/hooks/useDeleteAllNotifications";
import { typeMutaion } from "@/hooks/useReadAllNotification";
import { Trash2 } from "lucide-react";
import React from "react";

const DeleteAllNotifButton = ({ session }: { session: string }) => {
  const t = useTranslations("Notifications" as any);
  const { mutate } = useDeleteAllReadNotifications();
  const handleDeleteAllNotification = () => {
    const data: typeMutaion = { userId: session };
    mutate(data);
  };

  return (
    <button
      onClick={handleDeleteAllNotification}
      className="w-full cursor-pointer flex items-center justify-center gap-2 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-[0.98]"
    >
      <Trash2 size={14} />
      {t("delete_all_read")}
    </button>
  );
};

export default DeleteAllNotifButton;
