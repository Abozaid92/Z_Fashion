"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { useOrderStatusStats } from "@/hooks/useGetStatsDetails";
import { STATUS_SUMMARY } from "@/app/[locale]/utils/stats_Type";

const statusStyles: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  PROCESSING: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-100",
  },
  SHIPPED: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-100",
  },
  DELIVERED: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
  CANCELLED: {
    bg: "bg-red-100",
    text: "text-slate-500",
    border: "border-red-200",
  },
};

const Status = () => {
  const t = useTranslations("AdminStatus" as any);
  // استخدام الهوك الجديد
  const { data: statusDetails = [], isLoading } = useOrderStatusStats();

  const Skeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-slate-50 border border-slate-100 animate-pulse rounded-xl px-3 py-3 text-center"
        >
          <div className="h-3 w-12 bg-slate-200 rounded mx-auto mb-2"></div>
          <div className="h-6 w-8 bg-slate-300 rounded mx-auto"></div>
        </div>
      ))}
    </>
  );

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {isLoading ?
        <Skeleton />
      : STATUS_SUMMARY.map((item: any) => {
          const style = statusStyles[item.status] || {
            bg: "bg-slate-50",
            text: "text-slate-700",
            border: "border-slate-100",
          };

          return (
            <div
              key={item.status}
              className={`${style.bg} ${style.border} rounded-xl border px-3 py-3 text-center transition-all`}
            >
              <dt className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                {t(`statuses.${item.status.toLowerCase()}`)}
              </dt>
              <dd className={`mt-0.5 text-xl font-black ${style.text}`}>
                {/* {item._count.status} */}
                {statusDetails.find((el) => el.status === item.status)?._count
                  .status || 0}
              </dd>
            </div>
          );
        })
      }
    </dl>
  );
};

export default memo(Status);
