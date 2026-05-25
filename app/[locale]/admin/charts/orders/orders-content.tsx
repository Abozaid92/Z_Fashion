// app/charts/orders/orders-content.tsx
"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import {
  ShoppingCartIcon,
  PackageIcon,
  TrendingUpIcon,
  CheckCircleIcon,
} from "lucide-react";
import { ComplaintsCharts } from "@/app/[locale]/_components/admin/analytics/complaints-charts";
import { StatsCards } from "@/app/[locale]/_components/admin/analytics/stats-cards";
import { InsightsPanel } from "@/app/[locale]/_components/admin/analytics/insights-panel";
import { ExportButton } from "@/app/[locale]/_components/admin/analytics/export-button";
import { EmptyState } from "@/app/[locale]/_components/admin/analytics/empty-state";
import { TimeframeSelector } from "@/app/[locale]/_components/admin/analytics/timeframe-selector";
import { ComparisonToggle } from "@/app/[locale]/_components/admin/analytics/comparison-toggle";
import {
  formatNumber,
  generateInsights,
} from "@/app/[locale]/_lib/analytics-utils";
import { OrdersCharts } from "@/app/[locale]/_components/admin/analytics/orders-charts";

export function OrdersContent() {
  const t = useTranslations("AdminCharts.orders" as any);
  const [timeframe] = useQueryState("timeframe", { defaultValue: "30days" });
  const [showComparison] = useQueryState("compare", {
    defaultValue: false,
    parse: (value) => value === "true",
  });

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics", "ORDERS", timeframe],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics?type=ORDERS&timeframe=${timeframe}`,
      );
      return response.json();
    },
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: previousData } = useQuery({
    queryKey: ["analytics", "ORDERS", "previous", timeframe],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/previous?type=ORDERS&timeframe=${timeframe}`,
      );
      return response.json();
    },
    enabled: !!showComparison,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) {
    return <LoadingState />;
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
  const completionRate =
    data.filter((d: any) => d.value > avgDaily).length / data.length;

  const stats = [
    {
      title: t("total"),
      value: formatNumber(meta.total),
      change: meta.percentageChange,
      trend: meta.trend,
      icon: <ShoppingCartIcon className="w-6 h-6" />,
    },
    {
      title: t("daily_avg"),
      value: formatNumber(avgDaily),
      change: meta.percentageChange,
      trend: meta.trend,
      icon: <PackageIcon className="w-6 h-6" />,
    },
    {
      title: t("peak_volume"),
      value: formatNumber(peakDay.value),
      change: ((peakDay.value - avgDaily) / avgDaily) * 100,
      trend: "up" as const,
      icon: <TrendingUpIcon className="w-6 h-6" />,
    },
    {
      title: t("above_avg"),
      value: `${(completionRate * 100).toFixed(0)}%`,
      change: completionRate * 100,
      trend: completionRate > 0.5 ? ("up" as const) : ("down" as const),
      icon: <CheckCircleIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20">
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
              <ExportButton data={data} filename="orders-analytics" />
            </div>
          </div>
        </div>

        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OrdersCharts
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

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-slate-200 rounded-xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
