"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { memo } from "react";
import { useTranslations } from "next-intl";

// Fetch function
async function fetchDashboardData() {
  const response = await fetch("/api/admin/dashboard");
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
}

// Mini Chart Component (ultra-lightweight SVG)
const MiniChart = memo(({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="w-20 h-12" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={`${points} 100,100 0,100`}
        fill={color}
        fillOpacity="0.1"
        stroke="none"
      />
    </svg>
  );
});

MiniChart.displayName = "MiniChart";

// Stat Card Component
const StatCard = memo(
  ({
    title,
    value,
    percentage,
    trend,
    icon: Icon,
    chartData,
    color,
    vsLabel,
  }: {
    title: string;
    value: string;
    percentage: number;
    trend: "up" | "down";
    icon: any;
    chartData: number[];
    color: string;
    vsLabel?: string;
  }) => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ?
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              : <TrendingDown className="w-4 h-4 text-red-500" />}
              <span
                className={`text-sm font-semibold ${
                  trend === "up" ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {percentage > 0 ? "+" : ""}
                {percentage.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">
                {vsLabel ?? "vs last week"}
              </span>
            </div>
          </div>
          <MiniChart data={chartData} color={color} />
        </div>
      </div>
    );
  },
);

StatCard.displayName = "StatCard";

export default function AdminStats() {
  const t = useTranslations("AdminStats" as any);
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 h-36"></div>
        ))}
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title={t("total_revenue")}
        value={`$${data.revenue.card.total.toLocaleString()}`}
        percentage={data.revenue.card.percentage}
        trend={data.revenue.card.trend}
        icon={DollarSign}
        chartData={data.revenue.chart.map((d: any) => d.value)}
        color="#10b981"
        vsLabel={t("vs_last_week")}
      />
      <StatCard
        title={t("total_orders")}
        value={data.orders.card.total.toLocaleString()}
        percentage={data.orders.card.percentage}
        trend={data.orders.card.trend}
        icon={ShoppingCart}
        chartData={data.orders.chart.map((d: any) => d.value)}
        color="#8b5cf6"
        vsLabel={t("vs_last_week")}
      />
      <StatCard
        title={t("user_growth")}
        value={data.users.card.total.toLocaleString()}
        percentage={data.users.card.percentage}
        trend={data.users.card.trend}
        icon={Users}
        chartData={data.users.chart.map((d: any) => d.value)}
        color="#06b6d4"
        vsLabel={t("vs_last_week")}
      />
      <StatCard
        title={t("total_visits")}
        value={data.visits.card.total.toLocaleString()}
        percentage={data.visits.card.percentage}
        trend={data.visits.card.trend}
        icon={Eye}
        chartData={[...Array(7)].map(
          (_, i) => data.visits.card.total * (0.85 + Math.random() * 0.3),
        )}
        color="#f59e0b"
        vsLabel={t("vs_last_week")}
      />
    </section>
  );
}
