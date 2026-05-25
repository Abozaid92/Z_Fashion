// app/charts/views/views-content.tsx
"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { EyeIcon, HomeIcon, PackageIcon, InfoIcon } from "lucide-react";
import { StatsCards } from "@/app/[locale]/_components/admin/analytics/stats-cards";
import { EmptyState } from "@/app/[locale]/_components/admin/analytics/empty-state";
import {
  formatCurrency,
  formatNumber,
  generateInsights,
} from "@/app/[locale]/_lib/analytics-utils";
import { NetProfitCharts } from "@/app/[locale]/_components/admin/analytics/net-profit-charts";
import { ViewAnalyticsResponse } from "@/app/[locale]/_lib/view-analytics";
import { ViewCharts } from "@/app/[locale]/_components/admin/analytics/view-charts";

export function ViewsContent() {
  const t = useTranslations("AdminCharts.views" as any);
  const { data: analyticsData, isLoading } = useQuery<ViewAnalyticsResponse>({
    queryKey: ["analytics", "views"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/views");
      return response.json();
    },
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (!analyticsData?.success || !analyticsData.data) {
    return <EmptyState title="No View Data Available" />;
  }

  const { data } = analyticsData;
  const homeViews =
    data.distribution.find((d) => d.name === "Home Page")?.value || 0;
  const productViews =
    data.distribution.find((d) => d.name === "Product Page")?.value || 0;
  const aboutViews =
    data.distribution.find((d) => d.name === "About Page")?.value || 0;

  const stats = [
    {
      title: "Total Page Views",
      value: formatNumber(data.total),
      change: 0,
      trend: "up" as const,
      icon: <EyeIcon className="w-6 h-6" />,
    },
    {
      title: "Homepage Visits",
      value: formatNumber(homeViews),
      change: data.total > 0 ? (homeViews / data.total) * 100 : 0,
      trend: "up" as const,
      icon: <HomeIcon className="w-6 h-6" />,
    },
    {
      title: "Product Page Visits",
      value: formatNumber(productViews),
      change: data.total > 0 ? (productViews / data.total) * 100 : 0,
      trend: "up" as const,
      icon: <PackageIcon className="w-6 h-6" />,
    },
    {
      title: "About Page Visits",
      value: formatNumber(aboutViews),
      change: data.total > 0 ? (aboutViews / data.total) * 100 : 0,
      trend: "up" as const,
      icon: <InfoIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20">
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
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <ViewCharts distribution={data.distribution} />

          {/* Insights Panel */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
                Traffic Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-violet-50 border-violet-200 text-violet-700">
                  <p className="text-sm font-medium mb-2">Most Popular Page</p>
                  <p className="text-base font-bold">
                    {
                      data.distribution.reduce((max, item) =>
                        item.value > max.value ? item : max,
                      ).name
                    }
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 text-slate-700">
                  <p className="text-sm font-medium mb-2">Average Per Page</p>
                  <p className="text-base font-bold">
                    {formatNumber(
                      Math.round(data.total / data.distribution.length),
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-700">
                  <p className="text-sm font-medium mb-2">Total Engagement</p>
                  <p className="text-base font-bold">
                    {formatNumber(data.total)} visits
                  </p>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    💡 <span className="font-semibold">Tip:</span> Homepage
                    receives the most traffic, making it the perfect place for
                    featured products and key messaging.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/20 p-8">
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
