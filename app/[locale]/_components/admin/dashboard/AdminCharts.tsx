"use client";

import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { useTranslations } from "next-intl";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  RadialBar,
  RadialBarChart,
} from "recharts";

// Fetch function
async function fetchDashboardData() {
  const response = await fetch("/api/admin/dashboard");
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
}

// ✅ ADD 1: Fetch comment stats
async function fetchCommentStats() {
  const response = await fetch("/api/products/comments/adminStats");
  if (!response.ok) throw new Error("Failed to fetch comment stats");
  return response.json();
}

// 1. Profit Volatility Analysis
const ProfitVolatilityChart = memo(
  ({ data }: { data: Array<{ day: string; value: number }> }) => {
    const t = useTranslations("AdminChartsUI" as any);
    const l = useTranslations("AdminChartsLabels" as any);
    const max = Math.max(...data.map((d) => d.value));
    const min = Math.min(...data.map((d) => d.value));
    const avg = data.reduce((sum, d) => sum + d.value, 0) / data.length;

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {t("profit_volatility_analysis")}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              name={l("profit")}
            />
            <Line
              type="monotone"
              data={data.map((d) => ({ ...d, value: avg }))}
              dataKey="value"
              stroke="#fbbf24"
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
              name={l("average")}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-gray-600">{`${t("peak")}: $${max.toFixed(0)}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">{`${t("low")}: $${min.toFixed(0)}`}</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ProfitVolatilityChart.displayName = "ProfitVolatilityChart";

// 2. Revenue vs Growth Rate
const RevenueGrowthChart = memo(
  ({ revenueData, ordersData }: { revenueData: any; ordersData: any }) => {
    const t = useTranslations("AdminChartsUI" as any);
    const l = useTranslations("AdminChartsLabels" as any);
    const combinedData = revenueData.chart.map((item: any, index: number) => ({
      day: item.day,
      revenue: item.value,
      growthRate: ordersData.chart[index]?.value || 0,
    }));

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {t("revenue_vs_growth")}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
            <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#fbbf24"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="revenue"
              fill="#10b981"
              name={t("revenue")}
              radius={[8, 8, 0, 0]}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="growthRate"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={{ fill: "#fbbf24", r: 4 }}
              name={t("growth_percent")}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  },
);

RevenueGrowthChart.displayName = "RevenueGrowthChart";

// 3. Cumulative User Growth
const CumulativeUserGrowthChart = memo(
  ({ data }: { data: Array<{ day: string; value: number }> }) => {
    const t = useTranslations("AdminChartsUI" as any);
    const cumulativeData = data.reduce(
      (acc, item, index) => {
        const cumulative =
          index === 0 ? item.value : acc[index - 1].cumulative + item.value;
        return [...acc, { day: item.day, value: item.value, cumulative }];
      },
      [] as Array<{ day: string; value: number; cumulative: number }>,
    );

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {t("cumulative_user_growth")}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cumulativeData}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUsers)"
              name={t("users")}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  },
);

CumulativeUserGrowthChart.displayName = "CumulativeUserGrowthChart";

// 4. Orders Multi-View Analysis
const OrdersMultiViewChart = memo(
  ({ data }: { data: Array<{ day: string; value: number }> }) => {
    const t = useTranslations("AdminChartsUI" as any);
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {t("orders_multi_view_analysis")}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar
              dataKey="value"
              fill="#8b5cf6"
              name={t("orders")}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  },
);

OrdersMultiViewChart.displayName = "OrdersMultiViewChart";

// 5. Traffic Distribution
const TrafficDistributionChart = memo(
  ({ data }: { data: Array<{ name: string; value: number }> }) => {
    const t = useTranslations("AdminChartsUI" as any);
    const COLORS = ["#10b981", "#06b6d4", "#8b5cf6"];
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {t("traffic_distribution")}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-6 space-y-3">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {entry.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {entry.value}
                </span>
                <span className="text-xs text-gray-500">
                  ({((entry.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          {t("track_pages")}
        </p>
      </div>
    );
  },
);

TrafficDistributionChart.displayName = "TrafficDistributionChart";

// ✅ ADD 2: Comments Distribution Chart
const CommentsDistributionChart = memo(
  ({
    data,
    total,
  }: {
    data: Array<{ label: string; value: number; percentage: number }>;
    total: number;
  }) => {
    // باليتة ألوان جديدة تماماً (Indigo & Violet) هادية ومريحة للعين
    const COLORS = ["#312e81", "#4f46e5", "#818cf8", "#c7d2fe", "#e2e8f0"];

    // تجهيز الداتا عشان تناسب الـ Radial Bar وتاخد الألوان بالترتيب
    const chartData = data.map((item, index) => ({
      name: item.label,
      value: item.value,
      percentage: item.percentage,
      fill: COLORS[index % COLORS.length],
    }));

    // دالة لتعديل شكل الـ Tooltip عشان يكون أنيق
    const CustomTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100">
            <p className="text-sm font-bold text-slate-800">
              {payload[0].payload.name}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Count:{" "}
              <span className="font-bold text-slate-900">
                {payload[0].value}
              </span>
            </p>
            <p className="text-xs text-slate-500">
              Percentage:{" "}
              <span className="font-bold text-slate-900">
                {payload[0].payload.percentage}%
              </span>
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full min-h-[450px]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Ratings Overview
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Circular track distribution
            </p>
          </div>
          <div className="px-4 py-2 bg-indigo-50/50 rounded-2xl border border-indigo-50 text-center">
            <span className="block text-2xl font-black text-indigo-600 leading-none">
              {total}
            </span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Reviews
            </span>
          </div>
        </div>

        <div className="flex-1 w-full h-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="40%" // زقينالها شوية شمال عشان نسيب مساحة للـ Legend
              cy="50%"
              innerRadius="30%"
              outerRadius="100%"
              barSize={18}
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                background={{ fill: "#f8fafc" }} // لون الخلفية للمسار الدائري
                dataKey="value"
                cornerRadius={12} // حواف دائرية للبارز بتدي نعومة في التصميم
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "transparent" }}
              />
              <Legend
                iconSize={12}
                iconType="circle"
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{
                  fontFamily: "inherit",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#475569",
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  },
);

CommentsDistributionChart.displayName = "CommentsDistributionChart";

export default function AdminCharts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // ✅ ADD 3: second query
  const { data: commentStats } = useQuery({
    queryKey: ["comment-stats"],
    queryFn: fetchCommentStats,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 h-96"></div>
        ))}
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <>
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-10">
        <ProfitVolatilityChart data={data.net_profit.chart} />
        <RevenueGrowthChart
          revenueData={data.revenue}
          ordersData={data.orders}
        />
        <CumulativeUserGrowthChart data={data.users.chart} />
        <OrdersMultiViewChart data={data.orders.chart} />
      </section>

      {/* ✅ ONLY CHANGE: layout to allow 2 charts */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TrafficDistributionChart data={data.visits.distribution} />

        {commentStats && (
          <CommentsDistributionChart
            data={commentStats.stats}
            total={commentStats.totalComments}
          />
        )}
      </section>
    </>
  );
}
