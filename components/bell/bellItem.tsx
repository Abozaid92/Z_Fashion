"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { UserNotificationTypes } from "@/app/api/utils/typesNotification";
import { Trash2, User2Icon } from "lucide-react";
import useUpdateIsReadInNotification from "@/hooks/useReadeOneNotificaion";
import { Dispatch, SetStateAction } from "react";
import { typeMutaion } from "@/hooks/useReadeOneNotificaion";
import useDeleteNotification from "@/hooks/useDeleteOneNotification";

interface typeProps {
  data: UserNotificationTypes;
  setSelectedNotification: Dispatch<
    SetStateAction<UserNotificationTypes | null>
  >;
  userId: string;
}

const BellItem = ({ data: n, setSelectedNotification, userId }: typeProps) => {
  const t = useTranslations("Notifications" as any);
  const { mutate } = useUpdateIsReadInNotification();
  const { mutate: mutateDelete } = useDeleteNotification();

  const handleOpenMessage = async () => {
    setSelectedNotification(n);
    // لو الإشعار لسه متقرأش، بنبعت للمطفرة (Mutation) تغير حالته
    if (!n.isRead) {
      const data: typeMutaion = { userId: userId, notificationId: n.id };
      mutate(data);
    }
  };

  const handleDeleteNoification = () => {
    const data: typeMutaion = { userId: userId, notificationId: n.id };
    mutate(data);
    mutateDelete(data);
  };
  return (
    <div
      onClick={handleOpenMessage}
      className={`group flex gap-3 p-3 border-b border-gray-50 transition-all duration-200 cursor-pointer relative
        ${
          !n.isRead ?
            "bg-emerald-50/40 border-r-4 border-r-emerald-500"
          : "bg-white hover:bg-gray-50"
        }`}
    >
      {/* Avatar - صورة المرسل */}
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 overflow-hidden border border-emerald-200 shadow-sm">
        {n.senderImage ?
          <Image
            src={n.senderImage}
            width={40}
            height={40}
            className="object-cover"
            alt={n.senderName || t("sender_alt")}
          />
        : <User2Icon size={18} className="text-emerald-600" />}
      </div>

      {/* Content - محتوى الإشعار */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-0.5">
          <h4 className="text-[13px] font-bold text-emerald-900 truncate">
            {n.senderName}
          </h4>
          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
            {new Date(n.createdAt).toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* العنوان - Title */}
        <p className="text-[12px] font-semibold text-gray-800 leading-tight line-clamp-1">
          {n.title}
        </p>

        {/* الوصف - Description */}
        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mt-0.5">
          {n.description}
        </p>
      </div>

      {/* Status & Actions - الحالة والتحكم */}
      <div className="flex flex-col justify-between items-center shrink-0 ml-1">
        {/* Unread Indicator Dot */}
        {!n.isRead ?
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
        : <div className="w-2.5 h-2.5" />}

        {/* Delete Button - بيظهر بس عند الهوفر */}
        <button
          aria-label={t("delete_notification_aria")}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteNoification();
          }}
          className="text-red-300 cursor-pointer hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default BellItem;
