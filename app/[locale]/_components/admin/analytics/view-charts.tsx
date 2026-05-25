// components/charts/view-charts.tsx
"use client";

import dynamic from "next/dynamic";
import { ViewDistribution } from "@/app/[locale]/_lib/view-analytics";
import { formatNumber } from "@/app/[locale]/_lib/analytics-utils";

const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});

const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false },
);
interface ViewChartsProps {
  distribution: ViewDistribution[];
}

const COLORS = {
  "Home Page": "#10b981",
  "Product Page": "#0ea5e9",
  "About Page": "#f59e0b",
};

export function ViewCharts({ distribution }: ViewChartsProps) {
  return (
    <div className="space-y-6">
      {/* Donut Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Traffic Distribution
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${((percent || 0) * 100).toFixed(1)}%`
              }
              outerRadius={130}
              innerRadius={80}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={3}
            >
              {distribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name as keyof typeof COLORS] || "#94a3b8"}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const data = payload[0];
                return (
                  <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
                    <p className="text-sm font-semibold text-slate-900 mb-2">
                      {data.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      Visits:{" "}
                      <span className="font-bold">
                        {formatNumber(Number(data.value))}
                      </span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Share:{" "}
                      <span className="font-bold">
                        {data.payload.percent ?
                          (data.payload.percent * 100).toFixed(1)
                        : 0}
                        %
                      </span>
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm font-medium text-slate-700">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Track which pages are attracting the most visitor attention
          </p>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Page Breakdown
        </h3>
        <div className="space-y-4">
          {distribution.map((item, index) => {
            const total = distribution.reduce((sum, d) => sum + d.value, 0);
            const percentage = total > 0 ? (item.value / total) * 100 : 0;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor:
                          COLORS[item.name as keyof typeof COLORS] || "#94a3b8",
                      }}
                    />
                    <span className="text-sm font-medium text-slate-900">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">
                      {formatNumber(item.value)}
                    </span>
                    <span className="text-xs text-slate-500 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor:
                        COLORS[item.name as keyof typeof COLORS] || "#94a3b8",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
