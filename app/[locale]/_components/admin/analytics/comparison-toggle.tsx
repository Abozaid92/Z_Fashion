// components/ui/comparison-toggle.tsx
"use client";

import { useQueryState } from "nuqs";
import { useTranslations } from "next-intl";
import { GitCompareIcon } from "lucide-react";

export function ComparisonToggle() {
  const t = useTranslations("ComparisonToggle" as any);
  const [showComparison, setShowComparison] = useQueryState("compare", {
    defaultValue: false,
    parse: (value) => value === "true",
    serialize: (value) => (value ? "true" : "false"),
  });

  return (
    <button
      onClick={() => setShowComparison(!showComparison)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        showComparison ?
          "bg-emerald-100 text-emerald-700 border-2 border-emerald-200"
        : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
      }`}
    >
      <GitCompareIcon className="w-4 h-4" />
      {t("compare_period")}
    </button>
  );
}
