"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { Send, Eye, TrendingUp, Users } from "lucide-react";
import { cn } from "@/app/[locale]/_lib/utils";
import type { NotificationStats } from "@/app/api/utils/typesNotification";

// ─────────────────────────────────────────────────────────────────────────────
// StatPillSkeleton (بدون تغيير)
// ─────────────────────────────────────────────────────────────────────────────
const StatPillSkeleton = memo(function StatPillSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-4 py-4 flex items-center gap-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-5 w-14 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-3 w-20 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// StatPill (بدون تغيير)
// ─────────────────────────────────────────────────────────────────────────────
const StatPill = memo(function StatPill({
  Icon,
  value,
  label,
  gradient,
}: {
  Icon: React.FC<{ size: number; className?: string }>;
  value: string;
  label: string;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-4 py-4 flex items-center gap-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all duration-300">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          gradient,
        )}
      >
        <Icon size={16} className="text-white" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-900 leading-none tabular-nums">
          {value}
        </p>
        <p className="text-[11px] text-slate-400 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// StatsGrid (المعدل لربط البيانات فقط)
// ─────────────────────────────────────────────────────────────────────────────
export const StatsGrid = memo(function StatsGrid({
  stats, // نستقبل الـ stats بدلاً من المصفوفة كاملة
  isLoading,
  notifCount = 0,
}: {
  stats: NotificationStats | undefined; // البيانات القادمة من الـ API
  isLoading: boolean;
  notifCount: number | undefined;
}) {
  const t = useTranslations("StatsGrid" as any);
  // console.log("Stats data:", stats);

  if (isLoading || !stats) {
    return (
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPillSkeleton />
        <StatPillSkeleton />
        <StatPillSkeleton />
        <StatPillSkeleton />
      </dl>
    );
  }

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 1. إجمالي ما تم إرساله (يأتي كـ Prop) */}
      <StatPill
        Icon={Send}
        value={String(notifCount)}
        label={t("total_sent")}
        gradient="bg-gradient-to-br from-lime-400 to-lime-600"
      />

      {/* 2. إجمالي الفتحات (من الـ API الجديد) */}
      <StatPill
        Icon={Eye}
        value={stats.totalOpens.toLocaleString()}
        label={t("total_opens")}
        gradient="bg-gradient-to-br from-sky-400 to-sky-600"
      />

      {/* 3. معدل الفتح العام (محسوب جاهز من الباك أند) */}
      <StatPill
        Icon={TrendingUp}
        value={stats.globalOpenRate + "%"}
        label={t("open_rate")}
        gradient="bg-gradient-to-br from-violet-400 to-violet-600"
      />

      {/* 4. إجمالي المستهدفين (من الـ API الجديد) */}
      <StatPill
        Icon={Users}
        value={stats.totalTargets.toLocaleString()}
        label={t("avg_open_rate")}
        gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
      />
    </dl>
  );
});
