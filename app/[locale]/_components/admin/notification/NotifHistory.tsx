"use client";

import { memo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Bell, Activity } from "lucide-react";
import { NotifRow, NotifRowSkeleton } from "./NotifRow";
import Pagination from "@/components/Pagination";
import { notificationPerPAge } from "@/lib/constants";
import type { NotificationItem } from "@/app/[locale]/utils/admin/notifications/notitficationsTypes";
import { parseAsInteger, useQueryState } from "nuqs";

import { useAnnouncementBars } from "@/hooks/useNotifications";

// ─────────────────────────────────────────────────────────────────────────────
// NotifHistory — owns expandedId, Pagination uses nuqs internally
// ─────────────────────────────────────────────────────────────────────────────

export const NotifHistory = memo(function NotifHistory({
  notifications,
  isLoading,
  notifCount,
}: {
  notifications: NotificationItem[];
  isLoading: boolean;
  notifCount: number | undefined;
}) {
  const t = useTranslations("NotifHistory" as any);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // State للتحكم في التاب النشط
  const [activeTab, setActiveTab] = useState<"notifications" | "announcements">(
    "notifications",
  );

  // بنقرأ رقم الصفحة من الـ URL عشان الهوك بتاع الـ Announcements
  const [page] = useQueryState(
    "notificationsNumber",
    parseAsInteger.withDefault(1),
  );

  // استخدام الهوك لجلب الـ Announcement Bars
  const { data: announcementData, isLoading: isLoadingAnnouncements } =
    useAnnouncementBars(page);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // تحديد الداتا والحالة اللي هتتعرض بناءً على التاب النشط
  const currentData =
    activeTab === "notifications" ? notifications : (
      announcementData?.bars || []
    );
  const currentLoading =
    activeTab === "notifications" ? isLoading : isLoadingAnnouncements;
  const currentCount =
    activeTab === "notifications" ? notifCount : announcementData?.total || 0;

  return (
    <section
      className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden"
      aria-label={t("aria_label")}
    >
      {/* ── Header & Tabs ── */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* أزرار التبديل (Tabs) بتصميم Clean */}
        <div className="flex items-center p-1 bg-slate-100/80 rounded-lg w-fit border border-slate-100">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
              activeTab === "notifications" ?
                "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t("tab_notifications")}
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
              activeTab === "announcements" ?
                "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t("tab_announcements")}
          </button>
        </div>

        {!currentLoading && (
          <span className="text-[10px] text-slate-400 bg-slate-100 rounded-full px-3 py-1.5 font-bold tabular-nums shrink-0">
            {t("total")}{" "}
            <span className="font-black text-slate-800">{currentCount}</span>
          </span>
        )}
      </div>

      {/* ── Loading State ── */}
      {currentLoading && (
        <ul role="list">
          {Array.from({ length: notificationPerPAge }).map((_, i) => (
            <NotifRowSkeleton key={i} />
          ))}
        </ul>
      )}

      {/* ── Empty State ── */}
      {!currentLoading && currentData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            {activeTab === "notifications" ?
              <Bell size={18} className="text-slate-400" />
            : <Activity size={18} className="text-slate-400" />}
          </div>
          <p className="text-sm font-bold text-slate-600">
            {activeTab === "notifications" ?
              t("empty_notifications")
            : t("empty_announcements")}
          </p>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            {t("empty_created_items_hint")}
          </p>
        </div>
      )}

      {/* ── Data List ── */}
      {!currentLoading && currentData.length > 0 && (
        <ul role="list" className="divide-y divide-slate-50">
          {currentData.map((n: any) => (
            <NotifRow
              key={n.id}
              notif={n}
              expanded={expandedId === n.id}
              onToggle={() => handleToggle(n.id)}
              // مررتلك البروب ده عشان تستخدمه جوه NotifRow وتحدد بناءً عليه هتستدعي هوك حذف الـ Notif ولا الـ Announcement
              isAnnouncement={activeTab === "announcements"}
            />
          ))}
        </ul>
      )}

      {/* ── Pagination ── */}
      <Pagination
        count={currentCount || 1}
        typePaginationState="notificationsNumber"
        typePerPage={notificationPerPAge}
      />
    </section>
  );
});
