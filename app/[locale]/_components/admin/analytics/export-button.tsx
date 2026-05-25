// components/ui/export-button.tsx
"use client";

import { useTranslations } from "next-intl";
import { DownloadIcon } from "lucide-react";
import { exportToCSV } from "@/app/[locale]/_lib/analytics-utils";
import { AnalyticsDataPoint } from "@/app/[locale]/_lib/analytics";

interface ExportButtonProps {
  data: AnalyticsDataPoint[];
  filename: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  const t = useTranslations("ExportButton" as any);
  const handleExport = () => {
    exportToCSV(data, filename);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 font-medium text-sm shadow-lg shadow-slate-900/10 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-0.5"
    >
      <DownloadIcon className="w-4 h-4" />
      {t("export_csv")}
    </button>
  );
}
