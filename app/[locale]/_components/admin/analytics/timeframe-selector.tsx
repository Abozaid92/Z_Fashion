// components/ui/timeframe-selector.tsx
"use client";

import { useQueryState } from "nuqs";
import { useTranslations } from "next-intl";

const getTimeframes = (t: ReturnType<typeof useTranslations>) =>
  [
    { value: "7days", label: t("last_7_days") },
    { value: "30days", label: t("last_30_days") },
    { value: "90days", label: t("last_90_days") },
    { value: "thisYear", label: t("this_year") },
  ] as const;

export function TimeframeSelector() {
  const t = useTranslations("TimeframeSelector" as any);
  const [timeframe, setTimeframe] = useQueryState("timeframe", {
    defaultValue: "30days",
  });
  const timeframes = getTimeframes(t);

  return (
    <div className="flex items-center gap-2">
      <select
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value)}
        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all cursor-pointer"
      >
        {timeframes.map((tf) => (
          <option key={tf.value} value={tf.value}>
            {tf.label}
          </option>
        ))}
      </select>
    </div>
  );
}
