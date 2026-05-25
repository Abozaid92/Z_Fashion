// components/charts/orders-charts.tsx
"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { AnalyticsDataPoint } from "@/app/[locale]/_lib/analytics";
import { CustomTooltip } from "./custom-tooltip";
import { formatNumber } from "@/app/[locale]/_lib/analytics-utils";

// Lazy load Recharts components
const ComposedChart = dynamic(
  () => import("recharts").then((mod) => mod.ComposedChart),
  { ssr: false },
);
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});
const ScatterChart = dynamic(
  () => import("recharts").then((mod) => mod.ScatterChart),
  { ssr: false },
);
const RadarChart = dynamic(
  () => import("recharts").then((mod) => mod.RadarChart),
  { ssr: false },
);
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
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
const Scatter = dynamic(() => import("recharts").then((mod) => mod.Scatter), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const Radar = dynamic(() => import("recharts").then((mod) => mod.Radar), {
  ssr: false,
});
const PolarGrid = dynamic(
  () => import("recharts").then((mod) => mod.PolarGrid),
  { ssr: false },
);
const PolarAngleAxis = dynamic(
  () => import("recharts").then((mod) => mod.PolarAngleAxis),
  { ssr: false },
);
const PolarRadiusAxis = dynamic(
  () => import("recharts").then((mod) => mod.PolarRadiusAxis),
  { ssr: false },
);
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});
const ZAxis = dynamic(() => import("recharts").then((mod) => mod.ZAxis), {
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
interface OrdersChartsProps {
  data: AnalyticsDataPoint[];
  previousData?: AnalyticsDataPoint[];
  showComparison: boolean;
}

const COLORS = [
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
];

export function OrdersCharts({
  data,
  previousData,
  showComparison,
}: OrdersChartsProps) {
  // Calculate max and min for reference lines
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
    }));
  }, [data, previousData, showComparison]);

  // Prepare Pie Chart data (weekly aggregation)
  const pieData = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < data.length; i += 7) {
      const weekData = data.slice(i, i + 7);
      const total = weekData.reduce((sum, d) => sum + d.value, 0);
      weeks.push({
        name: `Week ${weeks.length + 1}`,
        value: total,
      });
    }
    return weeks;
  }, [data]);

  // Prepare Scatter Chart data (value vs day of week)
  const scatterData = useMemo(() => {
    return data.map((d) => {
      const date = new Date(d.date);
      return {
        dayOfWeek: date.getDay(),
        value: d.value,
        date: d.date,
      };
    });
  }, [data]);

  // Prepare Radar Chart data (day of week performance)
  const radarData = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayTotals = Array(7).fill(0);
    const dayCounts = Array(7).fill(0);

    data.forEach((d) => {
      const dayOfWeek = new Date(d.date).getDay();
      dayTotals[dayOfWeek] += d.value;
      dayCounts[dayOfWeek]++;
    });

    return dayNames.map((name, idx) => ({
      day: name,
      orders:
        dayCounts[idx] > 0 ? Math.round(dayTotals[idx] / dayCounts[idx]) : 0,
      fullMark: maxValue,
    }));
  }, [data, maxValue]);

  // Prepare Stacked Bar data (segmentation by range)
  const stackedData = useMemo(() => {
    return data.map((d) => {
      const low = Math.min(d.value * 0.3, d.value);
      const medium = Math.min(d.value * 0.4, d.value - low);
      const high = d.value - low - medium;

      return {
        date: d.date,
        low: Math.round(low),
        medium: Math.round(medium),
        high: Math.round(high),
      };
    });
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Chart 1: Composed Chart (Line + Bar + Area) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Orders Multi-View Analysis
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={combinedData} syncId="orderSync">
            <defs>
              <linearGradient
                id="orderAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
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
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              content={<CustomTooltip valueFormatter={formatNumber} />}
            />
            <Legend />
            <ReferenceLine
              y={avgValue}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ value: "Avg", position: "right", fill: "#f59e0b" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              fill="url(#orderAreaGradient)"
              stroke="none"
              name="Volume"
            />
            <Bar
              dataKey="value"
              fill="#0ea5e9"
              radius={[4, 4, 0, 0]}
              name="Orders"
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 3 }}
              name="Trend"
            />
            {showComparison && (
              <Line
                type="monotone"
                dataKey="previousValue"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Previous"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Charts 2 & 3: Side by Side - Pie and Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Weekly Distribution
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip valueFormatter={formatNumber} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Radar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Day of Week Performance
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <PolarRadiusAxis stroke="#64748b" fontSize={10} />
              <Radar
                name="Avg Orders"
                dataKey="orders"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Tooltip
                content={<CustomTooltip valueFormatter={formatNumber} />}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Scatter Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Order Pattern by Day of Week
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart syncId="orderSync">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="dayOfWeek"
              name="Day"
              domain={[0, 6]}
              tickFormatter={(val) =>
                ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][val]
              }
              stroke="#64748b"
              fontSize={12}
            />
            <YAxis
              type="number"
              dataKey="value"
              name="Orders"
              stroke="#64748b"
              fontSize={12}
            />
            <ZAxis range={[60, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      {new Date(data.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-slate-600">
                      Orders:{" "}
                      <span className="font-bold">
                        {formatNumber(data.value)}
                      </span>
                    </p>
                  </div>
                );
              }}
            />
            <Scatter name="Orders" data={scatterData} fill="#0ea5e9" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 5: Stacked Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Order Volume Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={stackedData} syncId="orderSync">
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
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              content={<CustomTooltip valueFormatter={formatNumber} />}
            />
            <Legend />
            <Bar
              dataKey="high"
              stackId="a"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              name="High Volume"
            />
            <Bar
              dataKey="medium"
              stackId="a"
              fill="#f59e0b"
              name="Medium Volume"
            />
            <Bar dataKey="low" stackId="a" fill="#ef4444" name="Low Volume" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
