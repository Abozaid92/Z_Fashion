// components/charts/product-charts.tsx
"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  BarChart,
  LineChart,
  AreaChart,
  ComposedChart,
  PieChart,
  Bar,
  Line,
  Area,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
} from "recharts";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  CreditCard,
  Activity,
  Target,
} from "lucide-react";
import type {
  RedisLeaderboardItem,
  DailyTrendItem,
} from "@/app/[locale]/_lib/product-analytics";
import { formatNumber } from "@/app/[locale]/_lib/analytics-utils";

interface ProductChartsProps {
  topCart: RedisLeaderboardItem[];
  topPurchased: RedisLeaderboardItem[];
  dailyTrends: DailyTrendItem[];
}

export function ProductCharts({
  topCart,
  topPurchased,
  dailyTrends,
}: ProductChartsProps) {
  // Calculate conversion insights
  const conversionInsights = useMemo(() => {
    if (dailyTrends.length === 0) return { avgConversion: 0, trend: "stable" };

    const totalCart = dailyTrends.reduce((sum, d) => sum + d.cart, 0);
    const totalPurchase = dailyTrends.reduce((sum, d) => sum + d.purchase, 0);
    const avgConversion = totalCart > 0 ? (totalPurchase / totalCart) * 100 : 0;

    // Determine trend
    const mid = Math.floor(dailyTrends.length / 2);
    const firstHalf = dailyTrends.slice(0, mid);
    const secondHalf = dailyTrends.slice(mid);

    const firstConv =
      firstHalf.reduce((sum, d) => sum + d.purchase, 0) /
      Math.max(
        1,
        firstHalf.reduce((sum, d) => sum + d.cart, 0),
      );
    const secondConv =
      secondHalf.reduce((sum, d) => sum + d.purchase, 0) /
      Math.max(
        1,
        secondHalf.reduce((sum, d) => sum + d.cart, 0),
      );

    const trend =
      secondConv > firstConv ? "improving"
      : secondConv < firstConv ? "declining"
      : "stable";

    return { avgConversion, trend };
  }, [dailyTrends]);

  // Prepare pie data for conversion visualization (Two Level Pie Chart)
  const pieData = useMemo(() => {
    const totalCart = dailyTrends.reduce((sum, d) => sum + d.cart, 0);
    const totalPurchase = dailyTrends.reduce((sum, d) => sum + d.purchase, 0);
    const abandoned = totalCart - totalPurchase;

    return [
      { name: "Purchased", value: totalPurchase, fill: "#10b981" },
      {
        name: "Abandoned",
        value: abandoned > 0 ? abandoned : 0,
        fill: "#ef4444",
      },
    ];
  }, [dailyTrends]);

  const innerPieData = useMemo(() => {
    const totalCart = dailyTrends.reduce((sum, d) => sum + d.cart, 0);
    const totalPurchase = dailyTrends.reduce((sum, d) => sum + d.purchase, 0);
    const conversionRate =
      totalCart > 0 ? (totalPurchase / totalCart) * 100 : 0;

    return [
      { name: "Conversion", value: conversionRate, fill: "#3b82f6" },
      { name: "Gap", value: 100 - conversionRate, fill: "#cbd5e1" },
    ];
  }, [dailyTrends]);

  return (
    <div className="space-y-6">
      {/* Chart 1 & 2: Tiny Bar Chart & Composed Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Added to Cart - Tiny Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">
              All-Time Top Added to Cart
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={topCart}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barSize={12}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis
                type="category"
                dataKey="slug"
                stroke="#64748b"
                fontSize={11}
                width={100}
                tickFormatter={(value) =>
                  value.length > 15 ? value.substring(0, 15) + "..." : value
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  return (
                    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
                      <p className="text-sm font-semibold text-slate-900 mb-2">
                        {payload[0].payload.slug}
                      </p>
                      <p className="text-sm text-slate-600">
                        Times Added:{" "}
                        <span className="font-bold">{payload[0].value}</span>
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="totalScore" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="totalScore"
                  position="right"
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-slate-700">
              💡 <span className="font-semibold">Insight:</span> These products
              show strong interest but may need conversion optimization.
            </p>
          </div>
        </div>

        {/* Top Purchased Products - Same Data Composed Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              All-Time Top Purchased
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={topPurchased}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis
                type="category"
                dataKey="slug"
                stroke="#64748b"
                fontSize={11}
                width={100}
                tickFormatter={(value) =>
                  value.length > 15 ? value.substring(0, 15) + "..." : value
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  return (
                    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
                      <p className="text-sm font-semibold text-slate-900 mb-2">
                        {payload[0].payload.slug}
                      </p>
                      <p className="text-sm text-slate-600">
                        Purchases:{" "}
                        <span className="font-bold">{payload[0].value}</span>
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="totalScore" fill="#10b981" radius={[0, 8, 8, 0]}>
                <LabelList
                  dataKey="totalScore"
                  position="right"
                  fontSize={12}
                />
              </Bar>
              <Line
                type="monotone"
                dataKey="totalScore"
                stroke="#059669"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-sm text-slate-700">
              💡 <span className="font-semibold">Insight:</span> Your best
              converters - consider featuring these products prominently.
            </p>
          </div>
        </div>
      </div>

      {/* Chart 3: Simple Area Chart - Daily Cart Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900">
            Daily Cart Activity Flow
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={dailyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      {new Date(label as any).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-slate-600">
                      Cart Additions:{" "}
                      <span className="font-bold">{payload[0].value}</span>
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="cart"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="#93c5fd"
              name="Cart Additions"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-slate-700">
            💡 <span className="font-semibold">Insight:</span> Cart activity
            shows volume density - peaks indicate high-interest periods or
            promotional success.
          </p>
        </div>
      </div>

      {/* Chart 4: Area Chart Fill By Value - Daily Purchase Trend */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900">
            Daily Purchase Trend
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={dailyTrends}>
            <defs>
              <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      {new Date(label as any).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-slate-600">
                      Purchases:{" "}
                      <span className="font-bold">{payload[0].value}</span>
                    </p>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="purchase"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#purchaseGradient)"
              name="Purchases"
            />
            <ReferenceLine
              y={
                dailyTrends.reduce((sum, d) => sum + d.purchase, 0) /
                dailyTrends.length
              }
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ value: "Avg", position: "right", fill: "#f59e0b" }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <p className="text-sm text-slate-700">
            💡 <span className="font-semibold">Insight:</span> Gradient fill
            tracking shows purchasing momentum - stable activity indicates
            consistent customer trust.
          </p>
        </div>
      </div>

      {/* Chart 5: Simple Line Chart - Dual-Scale Activity Tracking */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-slate-900">
            Dual-Scale Activity Tracking
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dailyTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      {new Date(label as any).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {payload.map((entry, idx) => (
                      <p key={idx} className="text-sm text-slate-600">
                        {entry.name}:{" "}
                        <span className="font-bold">{entry.value}</span>
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cart"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 3 }}
              name="Cart"
            />
            <Line
              type="monotone"
              dataKey="purchase"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 3 }}
              name="Purchase"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-sm text-slate-700">
            💡 <span className="font-semibold">Insight:</span> Simple line
            tracking allows comparing metrics clearly - useful for spotting
            trends.
          </p>
        </div>
      </div>

      {/* Chart 6: Two Level Pie Chart - Overall Conversion Rate */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-slate-900">
            Overall Conversion Rate
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={innerPieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
            >
              {innerPieData.map((entry, index) => (
                <Cell key={`inner-cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={90}
              outerRadius={120}
              paddingAngle={5}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`outer-cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      {payload[0].name}
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      {payload[0].value}
                      {(
                        (payload?.[0] as any)?.name?.match(
                          /Rate|Conversion|Gap/,
                        )
                      ) ?
                        "%"
                      : ""}
                    </p>
                  </div>
                );
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <p className="text-sm text-slate-700">
            💡 <span className="font-semibold">Insight:</span>{" "}
            {conversionInsights.avgConversion.toFixed(1)}% conversion rate is{" "}
            {conversionInsights.trend} -
            {conversionInsights.trend === "improving" ?
              " keep up the momentum!"
            : conversionInsights.trend === "declining" ?
              " consider reviewing checkout UX."
            : " maintaining steady performance."}
          </p>
        </div>
      </div>
    </div>
  );
}
