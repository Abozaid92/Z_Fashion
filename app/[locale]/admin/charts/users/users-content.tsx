// app/charts/users/users-content.tsx
"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { AnalyticType } from "@prisma/client";
import {
  UsersIcon,
  UserPlusIcon,
  TrendingUpIcon,
  ActivityIcon,
} from "lucide-react";
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
import { UsersCharts } from "@/app/[locale]/_components/admin/analytics/users-charts";

export function UsersContent() {
  const t = useTranslations("AdminCharts.users" as any);
  const [timeframe] = useQueryState("timeframe", { defaultValue: "30days" });
  const [showComparison] = useQueryState("compare", {
    defaultValue: false,
    parse: (value) => value === "true",
  });

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["analytics", "USERS", timeframe],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics?type=USERS&timeframe=${timeframe}`,
      );
      return response.json();
    },
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const { data: previousData } = useQuery({
    queryKey: ["analytics", "USERS", "previous", timeframe],
    queryFn: async () => {
      const response = await fetch(
        `/api/analytics/previous?type=USERS&timeframe=${timeframe}`,
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
    return <LoadingState />;
  }

  if (!analyticsData?.data || analyticsData.data.length === 0) {
    return <EmptyState />;
  }

  const { data, meta } = analyticsData;
  const insights = generateInsights(data, meta);

  // Calculate additional metrics
  const avgDaily = Math.round(meta.total / data.length);
  const peakDay = data.reduce((max: any, curr: any) =>
    curr.value > max.value ? curr : max,
  );
  const activeGrowthDays = data.filter(
    (d: any, i: number) => i > 0 && d.value > data[i - 1].value,
  ).length;

  const stats = [
    {
      title: t("total"),
      value: formatNumber(meta.total),
      change: meta.percentageChange,
      trend: meta.trend,
      icon: <UsersIcon className="w-6 h-6" />,
    },
    {
      title: t("daily_avg"),
      value: formatNumber(avgDaily),
      change: meta.percentageChange,
      trend: meta.trend,
      icon: <UserPlusIcon className="w-6 h-6" />,
    },
    {
      title: t("peak_day"),
      value: formatNumber(peakDay.value),
      change: ((peakDay.value - avgDaily) / avgDaily) * 100,
      trend: "up" as const,
      icon: <TrendingUpIcon className="w-6 h-6" />,
    },
    {
      title: t("growth_days"),
      value: `${activeGrowthDays}/${data.length}`,
      change: (activeGrowthDays / data.length) * 100,
      trend:
        activeGrowthDays > data.length / 2 ?
          ("up" as const)
        : ("down" as const),
      icon: <ActivityIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
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
              <ExportButton data={data} filename="users-analytics" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Charts Column */}
          <div className="lg:col-span-2">
            <UsersCharts
              data={data}
              previousData={previousData}
              showComparison={showComparison}
            />
          </div>

          {/* Insights Sidebar */}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-slate-200 rounded-xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
