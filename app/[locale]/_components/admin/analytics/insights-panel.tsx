// components/ui/insights-panel.tsx
import { useTranslations } from "next-intl";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react";
import { InsightItem } from "@/app/[locale]/_lib/analytics";

interface InsightsPanelProps {
  insights: InsightItem[];
  title?: string;
}

export function InsightsPanel({
  insights,
  title = "Key Insights",
}: InsightsPanelProps) {
  const t = useTranslations("AdminInsightsPanel" as any);
  const displayTitle = title === "Key Insights" ? t("default_title") : title;
  const getIcon = (type: InsightItem["type"]) => {
    switch (type) {
      case "positive":
        return <TrendingUpIcon className="w-4 h-4" />;
      case "negative":
        return <TrendingDownIcon className="w-4 h-4" />;
      default:
        return <MinusIcon className="w-4 h-4" />;
    }
  };

  const getColor = (type: InsightItem["type"]) => {
    switch (type) {
      case "positive":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "negative":
        return "bg-rose-50 border-rose-200 text-rose-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
        {displayTitle}
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${getColor(
              insight.type,
            )}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(insight.type)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium opacity-75 mb-1">
                  {insight.label}
                </p>
                <p className="text-base font-bold">{insight.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
