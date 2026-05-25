"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSocket } from "@/context/SocketProvider";
import { useSession } from "next-auth/react";
import useGetNotification from "@/hooks/useGetNotification";
import { useQueryClient } from "@tanstack/react-query";
import { UserNotificationTypes } from "@/app/api/utils/typesNotification";
import BellOnceItem from "./bell/BellOnceItem";
import BellItem from "./bell/bellItem";
import HeaderBell from "./bell/HeaderBell";
import DeleteAllNotifButton from "./bell/DeleteAllNotifButton";

// تعريف سريع للـ Type عشان ميديناش Error في السطر بتاع userProfile

export default function BellModal({ session }: { session: string | null }) {
  const t = useTranslations("Notifications" as any);

  const { data, isLoading } = useGetNotification(session as string);
  // // console.log("this is data bell notification", data);
  const queryClient = useQueryClient();
  const socket = useSocket();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // UI State: للتحكم في عرض تفاصيل إشعار محدد
  const [selectedNotification, setSelectedNotification] =
    useState<UserNotificationTypes | null>(null);

  const unread = data?.filter((n: any) => !n.isRead).length;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSelectedNotification(null); // نقفل التفاصيل كمان لو قفل المودال من بره
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!session || !socket) return;

    const handleNewNotification = (newNotif: UserNotificationTypes) => {
      // console.log("إشعار جديد وصل:", newNotif);

      queryClient.setQueryData(["bells", session], (oldData: any) => {
        if (!oldData || !oldData[0]) return oldData;

        const updatedProfile = {
          ...oldData[0],
          notification: [newNotif, ...oldData[0].notification],
        };
        return [updatedProfile];
      });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification");
    };
  }, [socket, session, queryClient]);

  return (
    <div className="flex justify-center">
      <div ref={ref} className="relative">
        {/* === Trigger Button === */}
        <button
          onClick={() => {
            setOpen(!open);
            if (open) setSelectedNotification(null); // ريست لما يقفل الجرس
          }}
          aria-label={t("bell_aria", { count: unread ?? 0 })}
          className="relative p-2 rounded-full text-black hover:bg-emerald-100 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-lime-300"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>

          {!isLoading && unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {/* === Dropdown Modal === */}
        {open && (
          <div className="absolute right-0 mt-3 w-80 sm:w-80 w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-emerald-100 overflow-hidden z-50 -mr-24 md:-mr-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {!session ?
              /* رسالة تسجيل الدخول في حالة عدم وجود سيشن */
              <div className="p-8 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600">
                  يرجى تسجيل الدخول أولاً
                </p>
              </div>
            : selectedNotification ?
              /* bell details */
              <BellOnceItem
                setSelectedNotification={setSelectedNotification}
                selectedNotification={selectedNotification}
              />
            : /* عرض قائمة الإشعارات (الوضع الطبيعي) */
              <>
                {/* Header */}
                <HeaderBell session={session} />

                {/* Notification List */}
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {isLoading ?
                    <div className="p-8 text-center">
                      <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  : data?.length === 0 ?
                    <div className="p-8 text-center text-xs text-gray-400">
                      {t("no_notifications_yet")}
                    </div>
                  : data?.map((n: any) => (
                      <BellItem
                        key={n.id}
                        userId={session}
                        data={n}
                        setSelectedNotification={setSelectedNotification}
                      />
                    ))
                  }
                </div>

                {/* Footer */}
                {data?.length > 0 && (
                  <div className="p-2 bg-gray-50 border-t border-gray-100">
                    <DeleteAllNotifButton session={session} />
                  </div>
                )}
              </>
            }
          </div>
        )}
      </div>
    </div>
  );
}
