// app/charts/revenue/revenue-content.tsx
"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import {
  DollarSignIcon,
  TrendingUpIcon,
  WalletIcon,
  CreditCardIcon,
} from "lucide-react";
import { StatsCards } from "@/app/[locale]/_components/admin/analytics/stats-cards";
import { InsightsPanel } from "@/app/[locale]/_components/admin/analytics/insights-panel";
import { ExportButton } from "@/app/[locale]/_components/admin/analytics/export-button";
import { EmptyState } from "@/app/[locale]/_components/admin/analytics/empty-state";
import { TimeframeSelector } from "@/app/[locale]/_components/admin/analytics/timeframe-selector";
import { ComparisonToggle } from "@/app/[locale]/_components/admin/analytics/comparison-toggle";
import {
  formatCurrency,
  formatNumber,
  generateInsights,
} from "@/app/[locale]/_lib/analytics-utils";
import { RevenueCharts } from "@/app/[locale]/_components/admin/analytics/revenue-charts";

export function RevenueContent() {
  const t = useTranslations("AdminCharts.revenue" as any);
  const [timeframe] = useQueryState("timeframe", { defaultValue: "30days" });
  const [showComparison] = useQueryState("compare", {
    defaultValue: false,
    parse: (value) => value === "true",
  });

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics", "REVENUE", timeframe],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics?type=REVENUE&timeframe=${timeframe}`,
      );
      return response.json();
    },
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: previousData } = useQuery({
    queryKey: ["analytics", "REVENUE", "previous", timeframe],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/previous?type=REVENUE&timeframe=${timeframe}`,
      );
      return response.json();
    },
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!showComparison,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20 p-8 animate-pulse" />
    );
  }

  if (!analyticsData?.data || analyticsData.data.length === 0) {
    return <EmptyState />;
  }

  const { data, meta } = analyticsData;
  const insights = generateInsights(data, meta);
  const avgDaily = Math.round(meta.total / data.length);
  const peakDay = data.reduce((max: any, curr: any) =>
    curr.value > max.value ? curr : max,
  );

  const stats = [
    {
      title: t("total"),
      value: formatCurrency(meta.total),
      change: meta.percentageChange,
      trend: meta.trend,
      icon: <DollarSignIcon className="w-6 h-6" />,
    },
    {
      title: t("daily_avg"),
      value: formatCurrency(avgDaily),
      change: meta.percentageChange,
      trend: meta.trend,
      icon: <WalletIcon className="w-6 h-6" />,
    },
    {
      title: t("peak"),
      value: formatCurrency(peakDay.value),
      change: ((peakDay.value - avgDaily) / avgDaily) * 100,
      trend: "up" as const,
      icon: <TrendingUpIcon className="w-6 h-6" />,
    },
    {
      title: t("growth_rate"),
      value: `${meta.percentageChange.toFixed(1)}%`,
      change: meta.percentageChange,
      trend: meta.trend,
      icon: <CreditCardIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex flex-col items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-slate-600">{t("description")}</p>
            </div>
            <div className="flex items-center flex-wrap gap-3">
              <TimeframeSelector />
              <ComparisonToggle />
              <ExportButton data={data} filename="revenue-analytics" />
            </div>
          </div>
        </div>

        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueCharts
              data={data}
              previousData={previousData}
              showComparison={showComparison}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <InsightsPanel insights={insights} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
