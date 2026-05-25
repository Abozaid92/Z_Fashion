// components/ui/empty-state.tsx
import { useTranslations } from "next-intl";
import { BarChart3Icon } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const t = useTranslations("EmptyState" as any);
  const defaultTitle = title || t("no_data_available");
  const defaultDescription = description || t("no_data_description");

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6">
        <BarChart3Icon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{defaultTitle}</h3>
      <p className="text-slate-600 text-center max-w-md">
        {defaultDescription}
      </p>
    </div>
  );
}
