"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import {
  useNotifications,
  useCreateNotification,
  useNotificationStats,
} from "@/hooks/useNotifications";
import { StatsGrid } from "../../_components/admin/notification/StatsGrid";
import { NotifComposer } from "../../_components/admin/notification/NotifComposer";
import {
  orderParser,
  sortByParser,
} from "../../_components/admin/notification/NotifFilter";

export function NotificationsClient() {
  const t = useTranslations("AdminNotifications" as any);
  // ── Pagination — shared with hooks + Pagination component via nuqs ────────
  const [currentPage] = useQueryState(
    "notificationsNumber",
    parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  );

  // ── Session ───────────────────────────────────────────────────────────────
  const { data: session } = useSession();
  const sessionName = session?.user?.name ?? "Admin";
  const sessionImage = session?.user?.image ?? null;

  // ── Server state GetNotification (client hooks)
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    sortByParser.withOptions({ shallow: false }),
  );

  const [order, setOrder] = useQueryState(
    "order",
    orderParser.withOptions({ shallow: false }),
  );
  const filters = { sortBy, order };
  const { data: notifData, isLoading: isLoadingNotifs } = useNotifications(
    currentPage,
    filters,
  );

  // stable reference — avoids unnecessary child rerenders when notifData is undefined
  const notifications = useMemo(
    () => notifData?.notifications ?? [],
    [notifData],
  );
  const notifCount = notifData?.total;

  const {
    mutate: createNotif,
    isPending,
    isSuccess,
    isError,
    reset: resetMutation,
  } = useCreateNotification(currentPage);

  const { data: statsData, isLoading: isLoadingStats } = useNotificationStats();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_0%_0%,rgba(163,230,53,0.10),transparent)] pointer-events-none" />
        <div className="relative px-4 sm:px-6 lg:px-8 py-7">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-[0_2px_12px_rgba(132,204,22,0.4)]">
              <Bell size={14} className="text-white" />
            </div>
            <span className="text-[11px] font-extrabold text-lime-600 tracking-widest uppercase">
              {t("broadcast_center")}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {t("global_notifications")}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {t("send_notifications_description")}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        <StatsGrid
          stats={statsData}
          isLoading={isLoadingStats}
          notifCount={notifCount}
        />

        <NotifComposer
          createNotif={createNotif}
          isPending={isPending}
          isSuccess={isSuccess}
          isError={isError}
          resetMutation={resetMutation}
          sessionName={sessionName}
          sessionImage={sessionImage}
          notifications={notifications}
          isLoadingNotifs={isLoadingNotifs}
          notifCount={notifCount}
        />
      </div>
    </div>
  );
}

export default NotificationsClient;
