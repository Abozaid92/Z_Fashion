// components/charts/revenue-charts.tsx
"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { AnalyticsDataPoint } from "@/app/[locale]/_lib/analytics";
import { CustomTooltip } from "./custom-tooltip";
import {
  formatCurrency,
  formatNumber,
} from "@/app/[locale]/_lib/analytics-utils";

// Lazy load Recharts components
const AreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false },
);
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false },
);
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
  ssr: false,
});
const ComposedChart = dynamic(
  () => import("recharts").then((mod) => mod.ComposedChart),
  { ssr: false },
);

const Line = dynamic(() => import("recharts").then((mod) => mod.Line), {
  ssr: false,
});
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false },
);
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false },
);
const ReferenceLine = dynamic(
  () => import("recharts").then((mod) => mod.ReferenceLine),
  { ssr: false },
);
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), {
  ssr: false,
});
const Brush = dynamic(() => import("recharts").then((mod) => mod.Brush), {
  ssr: false,
});
interface RevenueChartsProps {
  data: AnalyticsDataPoint[];
  previousData?: AnalyticsDataPoint[];
  showComparison: boolean;
}

export function RevenueCharts({
  data,
  previousData,
  showComparison,
}: RevenueChartsProps) {
  const { maxValue, avgValue } = useMemo(() => {
    const values = data.map((d) => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      maxValue: Math.max(...values),
      avgValue: sum / values.length,
    };
  }, [data]);

  // Prepare combined data
  const combinedData = useMemo(() => {
    if (!showComparison || !previousData) return data;

    return data.map((curr, idx) => ({
      ...curr,
      previousValue: previousData[idx]?.value || 0,
    }));
  }, [data, previousData, showComparison]);

  // Prepare stacked data (revenue breakdown simulation)
  const stackedData = useMemo(() => {
    return data.map((d) => {
      const product = Math.round(d.value * 0.5);
      const service = Math.round(d.value * 0.3);
      const other = d.value - product - service;

      return {
        date: d.date,
        product,
        service,
        other,
      };
    });
  }, [data]);

  // Prepare revenue with transaction count data (NEW - dual axis like complaints chart #4)
  const revenueTransactionData = useMemo(() => {
    return data.map((d, idx) => {
      // Simulate transaction count (higher revenue = more transactions)
      const baseTransactions = 50;
      const revenueRatio = d.value / avgValue;
      const transactionCount = Math.round(baseTransactions * revenueRatio);

      return {
        date: d.date,
        revenue: d.value,
        transactions: transactionCount,
      };
    });
  }, [data, avgValue]);

  // Prepare growth rate data
  const growthData = useMemo(() => {
    return data.map((d, idx) => {
      const growthRate =
        idx === 0 ? 0 : (
          ((d.value - data[idx - 1].value) / data[idx - 1].value) * 100
        );
      return {
        date: d.date,
        revenue: d.value,
        growthRate: isFinite(growthRate) ? growthRate : 0,
      };
    });
  }, [data]);

  // Prepare waterfall data (changes from previous day)
  const waterfallData = useMemo(() => {
    return data.map((d, idx) => {
      const change = idx === 0 ? d.value : d.value - data[idx - 1].value;
      return {
        date: d.date,
        change,
        positive: change >= 0 ? change : 0,
        negative: change < 0 ? Math.abs(change) : 0,
      };
    });
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Chart 1: Stacked Area Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Revenue Stream Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={stackedData} syncId="revenueSync">
            <defs>
              <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="serviceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="otherGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              content={<CustomTooltip valueFormatter={formatCurrency} />}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="product"
              stackId="1"
              stroke="#10b981"
              fill="url(#productGradient)"
              name="Products"
            />
            <Area
              type="monotone"
              dataKey="service"
              stackId="1"
              stroke="#0ea5e9"
              fill="url(#serviceGradient)"
              name="Services"
            />
            <Area
              type="monotone"
              dataKey="other"
              stackId="1"
              stroke="#f59e0b"
              fill="url(#otherGradient)"
              name="Other"
            />
            <Brush dataKey="date" height={30} stroke="#10b981" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Multi-Line Chart with Dual Axis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Revenue vs Growth Rate
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={growthData} syncId="revenueSync">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `${value.toFixed(0)}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
                    <p className="text-sm font-semibold text-slate-900 mb-3">
                      {new Date(label as any).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {payload.map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-6 mb-1"
                      >
                        <span className="text-sm text-slate-600">
                          {entry.name}:
                        </span>
                        <span className="text-sm font-bold">
                          {entry.name === "Revenue" ?
                            formatCurrency(Number(entry.value))
                          : `${Number(entry.value).toFixed(1)}%`}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend />
            <ReferenceLine
              y={0}
              yAxisId="right"
              stroke="#94a3b8"
              strokeDasharray="3 3"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 4 }}
              name="Revenue"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="growthRate"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#f59e0b", r: 3 }}
              name="Growth %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: TRANSFORMED - Revenue vs Transaction Count (was single-axis, now dual-axis like complaints chart #4) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Revenue Volume vs Transaction Count
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={revenueTransactionData} syncId="revenueSync">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              fontSize={12}
              label={{
                value: "Revenue",
                angle: -90,
                position: "insideLeft",
              }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              fontSize={12}
              label={{
                value: "Transactions",
                angle: 90,
                position: "insideRight",
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                return (
                  <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
                    <p className="text-sm font-semibold text-slate-900 mb-3">
                      {new Date(label as any).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    {payload.map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-6 mb-1"
                      >
                        <span className="text-sm text-slate-600">
                          {entry.name}:
                        </span>
                        <span className="text-sm font-bold">
                          {entry.name === "Revenue" ?
                            formatCurrency(Number(entry.value))
                          : formatNumber(Number(entry.value))}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 4 }}
              name="Revenue"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="transactions"
              stroke="#0ea5e9"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#0ea5e9", r: 3 }}
              name="Transactions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts 4 & 5: Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 4: Grouped Bar Chart with Comparison */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Period Comparison
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={<CustomTooltip valueFormatter={formatCurrency} />}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                name="Current"
              />
              {showComparison && (
                <Bar
                  dataKey="previousValue"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                  name="Previous"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 5: Waterfall Chart (Daily Changes) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Daily Revenue Changes
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={waterfallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={<CustomTooltip valueFormatter={formatCurrency} />}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Bar dataKey="positive" stackId="a" fill="#10b981" name="Gain" />
              <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Loss" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
