// app/charts/products/products-content.tsx
"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCartIcon,
  DollarSignIcon,
  TrendingUpIcon,
  TargetIcon,
} from "lucide-react";
import { StatsCards } from "@/app/[locale]/_components/admin/analytics/stats-cards";
import { EmptyState } from "@/app/[locale]/_components/admin/analytics/empty-state";
import {
  formatCurrency,
  formatNumber,
  generateInsights,
} from "@/app/[locale]/_lib/analytics-utils";
import { NetProfitCharts } from "@/app/[locale]/_components/admin/analytics/net-profit-charts";
import { ProductCharts } from "@/app/[locale]/_components/admin/analytics/product-charts";
import { ProductAnalyticsResponse } from "@/app/[locale]/_lib/product-analytics";
export function ProductsContent() {
  const t = useTranslations("AdminCharts.products" as any);
  const { data: analyticsData, isLoading } = useQuery<ProductAnalyticsResponse>(
    {
      queryKey: ["analytics", "products"],
      queryFn: async () => {
        const response = await fetch("/api/analytics/products");
        return response.json();
      },
      staleTime: 60 * 60 * 24,
      gcTime: 60 * 60 * 24 * 100,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (!analyticsData?.success || !analyticsData.data) {
    return <EmptyState title="No Product Data Available" />;
  }

  const { data } = analyticsData;
  const { allTimeStats, dailyTrends } = data;

  // Calculate stats
  const totalCartActions = dailyTrends.reduce((sum, d) => sum + d.cart, 0);
  const totalPurchases = dailyTrends.reduce((sum, d) => sum + d.purchase, 0);
  const conversionRate =
    totalCartActions > 0 ? (totalPurchases / totalCartActions) * 100 : 0;
  const avgDailyCart =
    dailyTrends.length > 0 ?
      Math.round(totalCartActions / dailyTrends.length)
    : 0;

  const stats = [
    {
      title: "Total Cart Additions",
      value: formatNumber(totalCartActions),
      change: 0,
      trend: "up" as const,
      icon: <ShoppingCartIcon className="w-6 h-6" />,
    },
    {
      title: "Total Purchases",
      value: formatNumber(totalPurchases),
      change: 0,
      trend: "up" as const,
      icon: <DollarSignIcon className="w-6 h-6" />,
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      change: conversionRate,
      trend: conversionRate > 50 ? ("up" as const) : ("down" as const),
      icon: <TargetIcon className="w-6 h-6" />,
    },
    {
      title: "Avg Daily Carts",
      value: formatNumber(avgDailyCart),
      change: 0,
      trend: "up" as const,
      icon: <TrendingUpIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          {/* Charts Column */}
          <div className="lg:col-span-3">
            <ProductCharts
              topCart={allTimeStats.topCart}
              topPurchased={allTimeStats.topPurchased}
              dailyTrends={dailyTrends}
            />
          </div>

          {/* Insights Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Summary Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full"></div>
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border bg-indigo-50 border-indigo-200 text-indigo-700">
                    <p className="text-sm font-medium opacity-75 mb-1">
                      Top Cart Product
                    </p>
                    <p className="text-base font-bold truncate">
                      {allTimeStats.topCart[0]?.slug || "N/A"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-700">
                    <p className="text-sm font-medium opacity-75 mb-1">
                      Top Sold Product
                    </p>
                    <p className="text-base font-bold truncate">
                      {allTimeStats.topPurchased[0]?.slug || "N/A"}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 text-slate-700">
                    <p className="text-sm font-medium opacity-75 mb-1">
                      Data Points
                    </p>
                    <p className="text-base font-bold">
                      {dailyTrends.length} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Insights Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                  Key Insights
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-700">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">🎯</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium opacity-75 mb-1">
                          Conversion Health
                        </p>
                        <p className="text-base font-bold">
                          {conversionRate > 60 ?
                            "Excellent"
                          : conversionRate > 40 ?
                            "Good"
                          : "Needs Improvement"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-700">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">📊</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium opacity-75 mb-1">
                          Total Products Tracked
                        </p>
                        <p className="text-base font-bold">
                          {allTimeStats.topCart.length +
                            allTimeStats.topPurchased.length}{" "}
                          unique
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-purple-50 border-purple-200 text-purple-700">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">💡</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium opacity-75 mb-1">
                          Recommendation
                        </p>
                        <p className="text-xs leading-relaxed">
                          {conversionRate < 50 ?
                            "Consider A/B testing checkout flow"
                          : "Maintain current conversion strategies"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Tips */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  💼 Action Items
                </h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span>Feature top purchased items on homepage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span>Optimize high-cart, low-purchase products</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span>Monitor daily trends for seasonal patterns</span>
                  </li>
                </ul>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 p-8">
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
