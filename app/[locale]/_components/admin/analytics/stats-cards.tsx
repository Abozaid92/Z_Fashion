// components/ui/stats-cards.tsx
import { useTranslations } from "next-intl";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { StatCard } from "@/app/[locale]/_lib/analytics";

interface StatsCardsProps {
  stats: StatCard[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations("AdminStatsCards" as any);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">
                {stat.title}
              </p>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                {stat.value}
              </h3>
            </div>
            {stat.icon && (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-emerald-600">
                {stat.icon}
              </div>
            )}
          </div>
          <div className="flex items-center flex-col gap-2">
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                stat.trend === "up" ?
                  "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
              }`}
            >
              {stat.trend === "up" ?
                <ArrowUpIcon className="w-3 h-3" />
              : <ArrowDownIcon className="w-3 h-3" />}
              {Math.abs(stat.change)}%
            </div>
            <span className="text-xs text-slate-500">
              {t("vs_previous_period")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
