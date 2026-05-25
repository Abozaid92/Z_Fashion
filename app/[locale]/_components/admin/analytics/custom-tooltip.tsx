// components/charts/custom-tooltip.tsx
import { useTranslations } from "next-intl";
import { TooltipProps } from "recharts";
import {
  formatNumber,
  formatCurrency,
} from "@/app/[locale]/_lib/analytics-utils";

interface CustomTooltipProps extends TooltipProps<number, string> {
  valueFormatter?: (value: number) => string;
  showComparison?: boolean;
}

export function CustomTooltip({
  active,
  payload,
  label,
  valueFormatter = formatNumber,
  showComparison = false,
}: any) {
  //CustomTooltipProps
  const t = useTranslations("AdminCustomTooltip" as any);
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-xl">
      <p className="text-sm font-semibold text-slate-900 mb-3">
        {new Date(label).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>
      <div className="space-y-2">
        {payload.map((entry: any, index: any) => (
          <div key={index} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-slate-600 capitalize">
                {entry.name?.replace(/([A-Z])/g, " $1").trim() || "Value"}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {valueFormatter(Number(entry.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
