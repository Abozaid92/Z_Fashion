// components/charts/complaints-charts.tsx
"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { AnalyticsDataPoint } from "@/app/[locale]/_lib/analytics";
import { CustomTooltip } from "./custom-tooltip";
import { formatNumber } from "@/app/[locale]/_lib/analytics-utils";

// Lazy load Recharts components
const RadarChart = dynamic(
  () => import("recharts").then((mod) => mod.RadarChart),
  { ssr: false },
);

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);

const Radar = dynamic(() => import("recharts").then((m) => m.Radar), {
  ssr: false,
});
const PolarGrid = dynamic(() => import("recharts").then((m) => m.PolarGrid), {
  ssr: false,
});
const PolarAngleAxis = dynamic(
  () => import("recharts").then((m) => m.PolarAngleAxis),
  { ssr: false },
);
const PolarRadiusAxis = dynamic(
  () => import("recharts").then((m) => m.PolarRadiusAxis),
  { ssr: false },
);
const ScatterChart = dynamic(
  () => import("recharts").then((m) => m.ScatterChart),
  { ssr: false },
);
const Scatter = dynamic(() => import("recharts").then((m) => m.Scatter), {
  ssr: false,
});
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), {
  ssr: false,
});
const Line = dynamic(() => import("recharts").then((m) => m.Line), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), {
  ssr: false,
});
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), {
  ssr: false,
});
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), {
  ssr: false,
});
const Area = dynamic(() => import("recharts").then((m) => m.Area), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), {
  ssr: false,
});
const ZAxis = dynamic(() => import("recharts").then((m) => m.ZAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false },
);
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), {
  ssr: false,
});
const ReferenceLine = dynamic(
  () => import("recharts").then((m) => m.ReferenceLine),
  { ssr: false },
);

// ... باقي الـ Interface والـ Component بتاعك زي ما هو
interface ComplaintsChartsProps {
  data: AnalyticsDataPoint[];
  previousData?: AnalyticsDataPoint[];
  showComparison: boolean;
}

const SEVERITY_COLORS = ["#ef4444", "#f59e0b", "#eab308", "#84cc16"];

export function ComplaintsCharts({
  data,
  previousData,
  showComparison,
}: ComplaintsChartsProps) {
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

  // Prepare radar data (day of week complaints)
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
      complaints:
        dayCounts[idx] > 0 ? Math.round(dayTotals[idx] / dayCounts[idx]) : 0,
      fullMark: maxValue,
    }));
  }, [data, maxValue]);

  // Prepare scatter data (complaints vs day number)
  const scatterData = useMemo(() => {
    return data.map((d, idx) => ({
      dayNumber: idx + 1,
      complaints: d.value,
      date: d.date,
    }));
  }, [data]);

  // Prepare severity breakdown (simulated)
  const severityData = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    return [
      { name: "Critical", value: Math.round(total * 0.15) },
      { name: "High", value: Math.round(total * 0.25) },
      { name: "Medium", value: Math.round(total * 0.35) },
      { name: "Low", value: Math.round(total * 0.25) },
    ];
  }, [data]);

  // Prepare cumulative complaints data (NEW - transformed from chart #3 revenue style)
  const cumulativeComplaintsData = useMemo(() => {
    let cumulative = 0;
    return data.map((d) => {
      cumulative += d.value;
      return {
        date: d.date,
        daily: d.value,
        cumulative,
      };
    });
  }, [data]);

  // Prepare stacked category data (simulated)
  const categoryData = useMemo(() => {
    return data.map((d) => ({
      date: d.date,
      product: Math.round(d.value * 0.4),
      service: Math.round(d.value * 0.3),
      delivery: Math.round(d.value * 0.2),
      other: Math.round(d.value * 0.1),
    }));
  }, [data]);

  // Prepare trend with moving average
  const trendData = useMemo(() => {
    return data.map((d, idx) => {
      const window = 5;
      const start = Math.max(0, idx - window + 1);
      const slice = data.slice(start, idx + 1);
      const ma = slice.reduce((sum, p) => sum + p.value, 0) / slice.length;

      return {
        date: d.date,
        actual: d.value,
        trend: Math.round(ma),
      };
    });
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Chart 1: Radar Chart - Day of Week Pattern */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Complaints by Day of Week
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="day" stroke="#64748b" fontSize={12} />
            <PolarRadiusAxis stroke="#64748b" fontSize={10} />
            <Radar
              name="Avg Complaints"
              dataKey="complaints"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
            />
            <Tooltip
              content={<CustomTooltip valueFormatter={formatNumber} />}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Charts 2 & 3: Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Scatter Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Complaint Distribution Pattern
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart syncId="complaintsSync">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                dataKey="dayNumber"
                name="Day"
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                type="number"
                dataKey="complaints"
                name="Complaints"
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
                        Complaints:{" "}
                        <span className="font-bold">
                          {formatNumber(data.complaints)}
                        </span>
                      </p>
                    </div>
                  );
                }}
              />
              <Scatter name="Complaints" data={scatterData} fill="#ef4444" />
              <ReferenceLine
                y={avgValue}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{ value: "Avg", position: "right", fill: "#f59e0b" }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Pie Chart - Severity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Complaints by Severity
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip valueFormatter={formatNumber} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: TRANSFORMED - Daily vs Cumulative Complaints (was dual-axis, now like revenue chart #3) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Daily vs Cumulative Complaints
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={cumulativeComplaintsData} syncId="complaintsSync">
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
            <Line
              type="monotone"
              dataKey="daily"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", r: 3 }}
              name="Daily Complaints"
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={false}
              name="Cumulative"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 5: Stacked Bar - Category Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Complaints by Category
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={categoryData} syncId="complaintsSync">
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
              dataKey="product"
              stackId="a"
              fill="#ef4444"
              name="Product Issues"
            />
            <Bar
              dataKey="service"
              stackId="a"
              fill="#f59e0b"
              name="Service Issues"
            />
            <Bar
              dataKey="delivery"
              stackId="a"
              fill="#eab308"
              name="Delivery Issues"
            />
            <Bar dataKey="other" stackId="a" fill="#94a3b8" name="Other" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 6: Area Chart with Trend */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Complaints Trend Analysis
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={trendData} syncId="complaintsSync">
            <defs>
              <linearGradient
                id="complaintsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
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
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#ef4444"
              fill="url(#complaintsGradient)"
              strokeWidth={2}
              name="Daily Complaints"
            />
            <Line
              type="monotone"
              dataKey="trend"
              stroke="#10b981"
              strokeWidth={3}
              dot={false}
              name="5-Day Trend"
            />
            {showComparison && previousData && (
              <ReferenceLine
                y={avgValue}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                label={{ value: "Avg", position: "right" }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
