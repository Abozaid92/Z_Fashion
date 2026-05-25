// app/charts/net-profit/net-profit-content.tsx
"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import {
  PiggyBankIcon,
  TrendingUpIcon,
  PercentIcon,
  TargetIcon,
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
import { NetProfitCharts } from "@/app/[locale]/_components/admin/analytics/net-profit-charts";
import { DOMAIN } from "@/lib/constants";

export function NetProfitContent() {
  const t = useTranslations("AdminCharts.net_profit" as any);
  const [timeframe] = useQueryState("timeframe", { defaultValue: "30days" });
  const [showComparison] = useQueryState("compare", {
    defaultValue: false,
    parse: (value) => value === "true",
  });

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics", "NET_PROFIT", timeframe],
    queryFn: async () => {
      const response = await fetch(
        `${DOMAIN}/api/analytics?type=NET_PROFIT&timeframe=${timeframe}`,
      );
      return response.json();
    },
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: previousData } = useQuery({
    queryKey: ["analytics", "NET_PROFIT", "previous", timeframe],
    queryFn: async () => {
      const response = await fetch(
        `${DOMAIN}/api/analytics/previous?type=NET_PROFIT&timeframe=${timeframe}`,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/20 p-8 animate-pulse" />
    );
  }

  if (!analyticsData?.data || analyticsData.data.length === 0) {
    return <EmptyState />;
  }

  const { data, meta } = analyticsData;
  const insights = generateInsights(data, meta);
  const avgDaily = Math.round(meta.total / data.length);
  // التعديل: إضافة any لمنع خطأ التايب سكريبت
  const peakDay = data.reduce((max: any, curr: any) =>
    curr.value > max.value ? curr : max,
  );
  const profitMargin = 25; // Simulated margin

  const stats = [
    {
      title: t("total"),
      value: formatCurrency(meta.total),
      change: meta.percentageChange,
      trend: meta.trend,
      icon: <PiggyBankIcon className="w-6 h-6" />,
    },
    {
      title: t("daily_avg"),
      value: formatCurrency(avgDaily),
      change: meta.percentageChange,
      trend: meta.trend,
      icon: <TrendingUpIcon className="w-6 h-6" />,
    },
    {
      title: t("profit_margin"),
      value: `${profitMargin}%`,
      change: profitMargin,
      trend: "up" as const,
      icon: <PercentIcon className="w-6 h-6" />,
    },
    {
      title: t("peak"),
      value: formatCurrency(peakDay.value),
      change: ((peakDay.value - avgDaily) / avgDaily) * 100,
      trend: "up" as const,
      icon: <TargetIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-green-50/20">
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
              <ExportButton data={data} filename="net-profit-analytics" />
            </div>
          </div>
        </div>

        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NetProfitCharts
              data={data}
              previousData={previousData}
              showComparison={showComparison}
            />
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <InsightsPanel insights={insights} title={t("insights_title")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
