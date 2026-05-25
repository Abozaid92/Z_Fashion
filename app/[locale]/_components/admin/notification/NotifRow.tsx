"use client";

import { useTranslations } from "next-intl";
import { memo } from "react";
import { Eye, Trash2, Palette, Link as LinkIcon } from "lucide-react";
import { cn } from "@/app/[locale]/_lib/utils";
import { formatRelativeTime } from "@/app/[locale]/_lib/utils";
import type { NotificationItem } from "@/app/[locale]/utils/admin/notifications/notitficationsTypes";
import {
  useDeleteNotification,
  useDeleteAnnouncementBar,
} from "@/hooks/useNotifications";
import { parseAsInteger, useQueryState } from "nuqs";

// ─────────────────────────────────────────────────────────────────────────────
// SenderAvatar — exported (used in NotifComposer too)
// ─────────────────────────────────────────────────────────────────────────────

export const SenderAvatar = memo(function SenderAvatar({
  name,
  image,
}: {
  name: string;
  image: string | null;
}) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-white"
      />
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shrink-0 ring-2 ring-white">
      <span className="text-[10px] font-bold text-slate-600 uppercase">
        {name?.slice(0, 2)}
      </span>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// NotifRowSkeleton
// ─────────────────────────────────────────────────────────────────────────────

export const NotifRowSkeleton = memo(function NotifRowSkeleton() {
  return (
    <li className="px-5 py-4 border-b border-slate-50 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-slate-100 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-3 w-full bg-slate-100 rounded-lg animate-pulse" />
          <div className="flex gap-3">
            <div className="h-2.5 w-16 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-2.5 w-12 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-2.5 w-10 bg-slate-100 rounded-lg animate-pulse ml-auto" />
          </div>
        </div>
      </div>
    </li>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// NotifRow
// ─────────────────────────────────────────────────────────────────────────────

export const NotifRow = memo(function NotifRow({
  notif,
  expanded,
  onToggle,
  isAnnouncement = false,
}: {
  notif: any; // استخدمنا any هنا عشان نقبل الـ NotificationItem أو الـ AnnouncementBarItem
  expanded: boolean;
  onToggle: () => void;
  isAnnouncement?: boolean;
}) {
  const t = useTranslations("NotifRow" as any);
  const isTemp = notif.id.startsWith("__temp__");

  const [currentPage] = useQueryState(
    "notificationsNumber",
    parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  );

  // استدعاء الهوكس
  const { mutate: deleteNotificationMutate } =
    useDeleteNotification(currentPage);
  const { mutate: deleteAnnouncementMutate } =
    useDeleteAnnouncementBar(currentPage);

  // دالة الحذف الموحدة
  const handleDeleteItem = (itemId: string) => {
    if (isAnnouncement) {
      deleteAnnouncementMutate(itemId);
    } else {
      deleteNotificationMutate(itemId);
    }
  };

  const openRate =
    !isAnnouncement && notif.targetUsers ?
      ((notif.opens_count / notif.targetUsers) * 100).toFixed(1)
    : 0;

  return (
    <li
      className={cn(
        "group border-b border-slate-50 last:border-0",
        isTemp && "opacity-60",
      )}
    >
      {/* Main row */}
      <div className="px-5 py-4 hover:bg-slate-50/60 transition-colors duration-150">
        <div className="flex items-start gap-3">
          <SenderAvatar
            name={notif.senderName || "Admin"}
            image={notif.senderImage}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[13px] font-bold text-slate-900 truncate">
                {notif.title}
              </p>
              {isTemp && (
                <span className="shrink-0 text-[9px] font-bold text-amber-500 bg-amber-50 border border-amber-200 rounded-full px-1.5 py-0.5 uppercase tracking-wide">
                  {t("sending")}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 truncate leading-relaxed">
              {notif.description}
            </p>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-lime-400 shrink-0" />
                <span className="text-[10px] font-semibold text-slate-500">
                  {notif.senderName || "Admin"}
                </span>
              </div>

              {/* إخفاء عدد المشاهدات لو ده إعلان */}
              {!isAnnouncement && notif.opens_count > 0 && (
                <div className="flex items-center gap-1">
                  <Eye size={12} className="text-black border rounded-full" />
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    {notif.opens_count.toLocaleString()} {t("opens")}
                  </span>
                </div>
              )}

              <time
                className="text-[10px] text-slate-300 ml-auto"
                dateTime={notif.createdAt}
              >
                {formatRelativeTime(notif.createdAt)}
              </time>

              {!isTemp && (
                <>
                  <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={expanded}
                    aria-label={
                      expanded ? t("hide_details") : t("view_details")
                    }
                    className={cn(
                      "shrink-0 w-6 h-6 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-200",
                      expanded ?
                        "bg-lime-100 text-lime-600"
                      : "text-black hover:bg-slate-100 opacity-90 group-hover:opacity-100",
                    )}
                  >
                    <Eye size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(notif.id)}
                    aria-label={t("delete")}
                    className="shrink-0 w-6 h-6 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-200 text-slate-300 hover:bg-rose-50 hover:text-rose-500 opacity-90 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && !isTemp && (
        <div className="border-t border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-5 py-4 space-y-3">
          <div className="flex items-stretch gap-2">
            {
              !isAnnouncement ?
                // ── احصائيات الإشعارات ──
                <>
                  <div className="flex-1 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <span className="text-base font-extrabold text-sky-600 tabular-nums">
                      {notif.opens_count?.toLocaleString() || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {t("total_opens")}
                    </span>
                  </div>
                  <div className="flex-1 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <span className="text-base font-extrabold text-sky-600 tabular-nums">
                      {notif.targetUsers?.toLocaleString() || 0}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {t("target_users")}
                    </span>
                  </div>
                  <div className="flex-1 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <span className="text-base font-extrabold text-sky-600 tabular-nums">
                      {openRate}%
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {t("open_rate")}
                    </span>
                  </div>
                  <div className="flex-1 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <span className="text-base font-extrabold text-lime-600 tabular-nums truncate max-w-[80px]">
                      {notif.sender || "Admin"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {t("sender_role")}
                    </span>
                  </div>
                </>
                // ── تفاصيل شريط الإعلانات (Announcement Bar) ──
              : <>
                  <div className="flex-1 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-200"
                        style={{ backgroundColor: notif.barColor || "#e8f3ec" }}
                      />
                      <span className="text-sm font-extrabold text-slate-700">
                        {notif.barColor || "#e8f3ec"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                      <Palette size={10} /> {t("bar_color")}
                    </span>
                  </div>

                  <div className="flex-1 bg-white border border-slate-100 rounded-xl flex flex-col items-center justify-center py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-2">
                    <span className="text-sm font-extrabold text-sky-600 truncate max-w-full">
                      {notif.barLink || t("no_link")}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium flex items-center gap-1">
                      <LinkIcon size={10} /> {t("bar_link")}
                    </span>
                  </div>
                </>

            }
          </div>

          <div className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden text-[11px]">
            {[
              {
                label: t("sender_label"),
                value: notif.senderName || t("admin"),
              },
              { label: t("full_body_label"), value: notif.description },
              {
                label: t("sent_label"),
                value: new Date(notif.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
              },
              {
                label: t("last_update_label"),
                value: new Date(notif.updatedAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }),
              },
            ].map(({ label, value }) => (
              <div key={String(label)} className="flex gap-3 px-3.5 py-2.5">
                <span className="text-slate-400 w-24 shrink-0 font-semibold">
                  {label}
                </span>
                <span className="text-slate-700 flex-1 break-words font-medium">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </li>
  );
});
