// components/charts/net-profit-charts.tsx
"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { AnalyticsDataPoint } from "@/app/[locale]/_lib/analytics";
import { CustomTooltip } from "./custom-tooltip";
import { formatCurrency } from "@/app/[locale]/_lib/analytics-utils";

// Lazy load Recharts components
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false },
);
const AreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false },
);
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
  ssr: false,
});
const ComposedChart = dynamic(
  () => import("recharts").then((mod) => mod.ComposedChart),
  { ssr: false },
);
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});

const Line = dynamic(() => import("recharts").then((mod) => mod.Line), {
  ssr: false,
});
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
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
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
  ssr: false,
});
const ErrorBar = dynamic(() => import("recharts").then((mod) => mod.ErrorBar), {
  ssr: false,
});
interface NetProfitChartsProps {
  data: AnalyticsDataPoint[];
  previousData?: AnalyticsDataPoint[];
  showComparison: boolean;
}

const PROFIT_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];

export function NetProfitCharts({
  data,
  previousData,
  showComparison,
}: NetProfitChartsProps) {
  const { maxValue, minValue, avgValue } = useMemo(() => {
    const values = data.map((d) => d.value);
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      maxValue: Math.max(...values),
      minValue: Math.min(...values),
      avgValue: sum / values.length,
    };
  }, [data]);

  // Prepare combined data
  const combinedData = useMemo(() => {
    if (!showComparison || !previousData) return data;

    return data.map((curr, idx) => ({
      ...curr,
      previousValue: previousData[idx]?.value || 0,
      variance: curr.value - (previousData[idx]?.value || 0),
    }));
  }, [data, previousData, showComparison]);

  // Prepare margin data (profit margin simulation)
  const marginData = useMemo(() => {
    return data.map((d) => {
      const revenue = d.value / 0.25; // Assuming 25% margin
      const cost = revenue - d.value;
      const margin = (d.value / revenue) * 100;

      return {
        date: d.date,
        revenue,
        cost,
        profit: d.value,
        margin,
      };
    });
  }, [data]);

  // Prepare volatility data with error bars
  const volatilityData = useMemo(() => {
    return data.map((d, idx) => {
      const window = 3;
      const start = Math.max(0, idx - window);
      const slice = data.slice(start, idx + 1);
      const avg = slice.reduce((sum, p) => sum + p.value, 0) / slice.length;
      const variance =
        slice.reduce((sum, p) => sum + Math.pow(p.value - avg, 2), 0) /
        slice.length;
      const stdDev = Math.sqrt(variance);

      return {
        date: d.date,
        profit: d.value,
        error: stdDev,
      };
    });
  }, [data]);

  // Prepare pie data (profit distribution by quartile)
  const quartileData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const q1 = sorted.slice(0, Math.floor(sorted.length / 4));
    const q2 = sorted.slice(
      Math.floor(sorted.length / 4),
      Math.floor(sorted.length / 2),
    );
    const q3 = sorted.slice(
      Math.floor(sorted.length / 2),
      Math.floor((sorted.length * 3) / 4),
    );
    const q4 = sorted.slice(Math.floor((sorted.length * 3) / 4));

    return [
      { name: "Top 25%", value: q1.reduce((sum, d) => sum + d.value, 0) },
      { name: "High 25%", value: q2.reduce((sum, d) => sum + d.value, 0) },
      { name: "Mid 25%", value: q3.reduce((sum, d) => sum + d.value, 0) },
      { name: "Low 25%", value: q4.reduce((sum, d) => sum + d.value, 0) },
    ];
  }, [data]);

  // Prepare moving averages (3-day, 7-day)
  const movingAvgData = useMemo(() => {
    return data.map((d, idx) => {
      const ma3 =
        idx >= 2 ?
          (data[idx - 2].value + data[idx - 1].value + d.value) / 3
        : d.value;
      const ma7 =
        idx >= 6 ?
          data.slice(idx - 6, idx + 1).reduce((sum, p) => sum + p.value, 0) / 7
        : d.value;

      return {
        date: d.date,
        actual: d.value,
        ma3,
        ma7,
      };
    });
  }, [data]);

  // Prepare range data (high-low simulation)
  const rangeData = useMemo(() => {
    return data.map((d, idx) => {
      const fluctuation = d.value * 0.15;
      const high = d.value + fluctuation;
      const low = d.value - fluctuation;

      return {
        date: d.date,
        high,
        low,
        profit: d.value,
        range: [low, high],
      };
    });
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Chart 1: Composed Chart with Multiple Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Profit & Margin Analysis
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={marginData} syncId="profitSync">
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.1} />
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
                          {entry.name === "Margin" ?
                            `${Number(entry.value).toFixed(1)}%`
                          : formatCurrency(Number(entry.value))}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="profit"
              fill="url(#profitGradient)"
              stroke="#059669"
              strokeWidth={2}
              name="Net Profit"
            />
            <Bar
              yAxisId="left"
              dataKey="cost"
              fill="#94a3b8"
              opacity={0.3}
              name="Costs"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="margin"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: "#f59e0b", r: 4 }}
              name="Margin"
            />
            <ReferenceLine
              yAxisId="left"
              y={avgValue}
              stroke="#059669"
              strokeDasharray="3 3"
              label={{ value: "Avg", position: "right", fill: "#059669" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Line Chart with Error Bars (Volatility) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Profit Volatility Analysis
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={volatilityData} syncId="profitSync">
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
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 5 }}
              name="Profit"
            >
              <ErrorBar
                dataKey="error"
                width={4}
                strokeWidth={2}
                stroke="#ef4444"
              />
            </Line>
            <ReferenceLine
              y={maxValue}
              stroke="#10b981"
              strokeDasharray="3 3"
              label={{ value: "Peak", position: "top", fill: "#10b981" }}
            />
            <ReferenceLine
              y={minValue}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ value: "Low", position: "bottom", fill: "#ef4444" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts 3 & 4: Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Pie Chart - Quartile Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Profit Distribution by Quartile
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={quartileData}
                cx="50%"
                cy="50%"
                labelLine
                label={({ name, value, percent }) =>
                  `${name}: ${formatCurrency(value)} (${((percent || 0) * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {quartileData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PROFIT_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip valueFormatter={formatCurrency} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Area Chart with Range */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Profit Range Projection
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={rangeData}>
              <defs>
                <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a7f3d0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#a7f3d0" stopOpacity={0.1} />
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
              <Area
                type="monotone"
                dataKey="high"
                stroke="#34d399"
                fill="url(#rangeGradient)"
                name="High Range"
              />
              <Area
                type="monotone"
                dataKey="low"
                stroke="#34d399"
                fill="#fff"
                name="Low Range"
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: "#059669", r: 4 }}
                name="Actual"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 5: Multi-Line Moving Averages */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Profit Trend with Moving Averages
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={movingAvgData} syncId="profitSync">
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
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#94a3b8"
              strokeWidth={1}
              dot={false}
              name="Daily"
            />
            <Line
              type="monotone"
              dataKey="ma3"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="3-Day MA"
            />
            <Line
              type="monotone"
              dataKey="ma7"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              name="7-Day MA"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 6: Variance Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Period-over-Period Comparison
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={combinedData} syncId="profitSync">
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
              radius={[8, 8, 0, 0]}
              name="Current Period"
            />
            {showComparison && (
              <>
                <Bar
                  dataKey="previousValue"
                  fill="#e2e8f0"
                  radius={[8, 8, 0, 0]}
                  name="Previous Period"
                />
                <ReferenceLine y={0} stroke="#64748b" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
