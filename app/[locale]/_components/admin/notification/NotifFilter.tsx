"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { ArrowDownUp, BarChart2 } from "lucide-react";
import { cn } from "@/app/[locale]/_lib/utils";
import type { SortBy, SortOrder } from "@/hooks/useNotifications";

// ── nuqs parsers ──────────────────────────────────────────────────────────────

export const sortByParser = parseAsStringLiteral([
  "opens_count",
  "targetUsers",
] as const).withDefault("opens_count");

export const orderParser = parseAsStringLiteral([
  "desc",
  "asc",
] as const).withDefault("desc");

// ── Get sortByLabels and orderLabels from translations ────────────────────────

const getSortByLabels = (
  t: ReturnType<typeof useTranslations>,
): Record<SortBy, string> => ({
  opens_count: t("sort_by_opens_count"),
  targetUsers: t("sort_by_target_users"),
});

const getOrderLabels = (
  t: ReturnType<typeof useTranslations>,
): Record<SortOrder, string> => ({
  desc: t("sort_order_high_to_low"),
  asc: t("sort_order_low_to_high"),
});

// ── shared select className ───────────────────────────────────────────────────

const selectCls = cn(
  "h-8 pl-7 pr-3 text-[11px] font-semibold text-slate-700",
  "bg-white border border-slate-200 rounded-lg outline-none cursor-pointer",
  "hover:border-slate-300 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/15",
  "transition-all duration-150 appearance-none",
);

// ─────────────────────────────────────────────────────────────────────────────
// NotifFilters
// ─────────────────────────────────────────────────────────────────────────────

export const NotifFilters = memo(function NotifFilters() {
  const t = useTranslations("NotifFilter" as any);
  const sortByLabels = getSortByLabels(t);
  const orderLabels = getOrderLabels(t);

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    sortByParser.withOptions({ shallow: false }),
  );

  const [order, setOrder] = useQueryState(
    "order",
    orderParser.withOptions({ shallow: false }),
  );

  const activeLabel = `${sortByLabels[sortBy]} · ${orderLabels[order]}`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Sort by */}
        <div className="relative flex items-center">
          <BarChart2
            size={11}
            className="absolute left-2 text-slate-400 pointer-events-none"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className={selectCls}
            aria-label={t("sort_by_aria_label")}
          >
            <option
              value="opens_count"
              className="font-semibold cursor-pointer"
            >
              {t("opens_count")}
            </option>
            <option
              value="targetUsers"
              className="font-semibold cursor-pointer"
            >
              {t("target_users")}
            </option>
          </select>
        </div>

        {/* Order */}
        <div className="relative flex items-center">
          <ArrowDownUp
            size={11}
            className="absolute left-2 text-slate-400 pointer-events-none"
          />
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as SortOrder)}
            className={selectCls}
            aria-label={t("order_aria_label")}
          >
            <option value="desc" className="font-semibold cursor-pointer">
              {t("low_to_high")}
            </option>
            <option value="asc" className="font-semibold cursor-pointer">
              {t("high_to_low")}
            </option>
          </select>
        </div>
      </div>

      {/* Active filter label */}
      <p className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shrink-0" />
        <span>
          {t("sort_by")}{" "}
          <span className="text-slate-600 font-extrabold">{activeLabel}</span>
        </span>
      </p>
    </div>
  );
});
