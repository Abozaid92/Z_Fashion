// components/charts/users-charts.tsx
"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { AnalyticsDataPoint } from "@/app/[locale]/_lib/analytics";
import { CustomTooltip } from "./custom-tooltip";
import { formatNumber } from "@/app/[locale]/_lib/analytics-utils";

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
const RadialBarChart = dynamic(
  () => import("recharts").then((mod) => mod.RadialBarChart),
  { ssr: false },
);
const Treemap = dynamic(() => import("recharts").then((mod) => mod.Treemap), {
  ssr: false,
});
const FunnelChart = dynamic(
  () => import("recharts").then((mod) => mod.FunnelChart),
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
const RadialBar = dynamic(
  () => import("recharts").then((mod) => mod.RadialBar),
  { ssr: false },
);
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
const Funnel = dynamic(() => import("recharts").then((mod) => mod.Funnel), {
  ssr: false,
});
const LabelList = dynamic(
  () => import("recharts").then((mod) => mod.LabelList),
  { ssr: false },
);
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
  ssr: false,
});
interface UsersChartsProps {
  data: AnalyticsDataPoint[];
  previousData?: AnalyticsDataPoint[];
  showComparison: boolean;
}

export function UsersCharts({
  data,
  previousData,
  showComparison,
}: UsersChartsProps) {
  // Calculate max and min for reference lines
  const { maxValue, minValue } = useMemo(() => {
    const values = data.map((d) => d.value);
    return {
      maxValue: Math.max(...values),
      minValue: Math.min(...values),
    };
  }, [data]);

  // Prepare combined data for comparison
  const combinedData = useMemo(() => {
    if (!showComparison || !previousData) return data;

    return data.map((curr, idx) => ({
      ...curr,
      previousValue: previousData[idx]?.value || 0,
    }));
  }, [data, previousData, showComparison]);

  // Prepare data for Funnel Chart (weekly aggregation)
  const funnelData = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < data.length; i += 7) {
      const weekData = data.slice(i, i + 7);
      const total = weekData.reduce((sum, d) => sum + d.value, 0);
      weeks.push({
        name: `Week ${weeks.length + 1}`,
        value: total,
        fill: `hsl(${160 + weeks.length * 10}, 70%, 50%)`,
      });
    }
    return weeks;
  }, [data]);

  // Prepare data for Treemap (daily categorization)
  const treemapData = useMemo(() => {
    const categories = [
      { name: "High Activity", min: maxValue * 0.7, color: "#10b981" },
      { name: "Medium Activity", min: maxValue * 0.4, color: "#f59e0b" },
      { name: "Low Activity", min: 0, color: "#ef4444" },
    ];

    return categories.map((cat) => ({
      name: cat.name,
      children: data
        .filter((d) => {
          const nextCat = categories.find((c) => c.min > cat.min);
          return d.value >= cat.min && (!nextCat || d.value < nextCat.min);
        })
        .map((d) => ({
          name: new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value: d.value,
          fill: cat.color,
        })),
    }));
  }, [data, maxValue]);

  // Prepare RadialBar data (weekly averages)
  const radialData = useMemo(() => {
    const weeks = [];
    for (let i = 0; i < data.length; i += 7) {
      const weekData = data.slice(i, i + 7);
      const avg =
        weekData.reduce((sum, d) => sum + d.value, 0) / weekData.length;
      weeks.push({
        name: `W${weeks.length + 1}`,
        value: Math.round(avg),
        fill: `hsl(${160 + weeks.length * 15}, 65%, 50%)`,
      });
    }
    return weeks.slice(0, 4); // Show only first 4 weeks
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Chart 1: Line Chart with Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Daily User Trend
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={combinedData} syncId="userSync">
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
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
              y={maxValue}
              stroke="#10b981"
              strokeDasharray="3 3"
              label={{ value: "Max", position: "top", fill: "#10b981" }}
            />
            <ReferenceLine
              y={minValue}
              stroke="#ef4444"
              strokeDasharray="3 3"
              label={{ value: "Min", position: "bottom", fill: "#ef4444" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Current Period"
            />
            {showComparison && (
              <Line
                type="monotone"
                dataKey="previousValue"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Previous Period"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Area Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Cumulative User Growth
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={combinedData} syncId="userSync">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
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
            <Area
              type="monotone"
              dataKey="value"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#areaGradient)"
              name="Users"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Daily User Distribution
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} syncId="userSync">
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
            <Bar
              dataKey="value"
              fill="#0ea5e9"
              radius={[8, 8, 0, 0]}
              name="Users"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Charts 4 & 5: Side by Side - RadialBar and Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 4: RadialBar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Weekly Averages
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadialBarChart
              innerRadius="10%"
              outerRadius="90%"
              data={radialData}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                {...({
                  minAngle: 15,
                  background: true,
                  clockWise: true,
                  dataKey: "value",
                  cornerRadius: 10,
                } as any)}
              >
                <LabelList
                  dataKey="name"
                  position="insideStart"
                  fill="#fff"
                  fontSize={14}
                />
              </RadialBar>
              <Tooltip
                content={<CustomTooltip valueFormatter={formatNumber} />}
              />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 5: Funnel Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Weekly User Funnel
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <FunnelChart>
              <Tooltip
                content={<CustomTooltip valueFormatter={formatNumber} />}
              />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList
                  position="right"
                  fill="#000"
                  stroke="none"
                  dataKey="name"
                  fontSize={14}
                />
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 6: Treemap */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          User Activity Heatmap
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <Treemap
            data={treemapData}
            dataKey="value"
            stroke="#fff"
            fill="#10b981"
            content={({ x, y, width, height, name, value }) => {
              if (width < 50 || height < 30) return <g> </g>; // Skip rendering small boxes
              return (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                      fill:
                        value > maxValue * 0.7 ? "#10b981"
                        : value > maxValue * 0.4 ? "#f59e0b"
                        : "#ef4444",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                  <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                    fontWeight="bold"
                  >
                    {name}
                  </text>
                  <text
                    x={x + width / 2}
                    y={y + height / 2 + 16}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={10}
                  >
                    {formatNumber(value)}
                  </text>
                </g>
              );
            }}
          />
        </ResponsiveContainer>
      </div>
    </div>
  );
}
