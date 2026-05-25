"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { cn } from "@/app/[locale]/_lib/utils";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  title: string;
  description: string;
}

export function DeleteDialog({
  open,
  onClose,
  onConfirm,
  isPending,
  title,
  description,
}: DeleteDialogProps) {
  const t = useTranslations("AdminDeleteDialog" as any);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isPending ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
              <AlertTriangle size={18} className="text-rose-600" />
            </div>
            <div>
              <h2
                id="delete-title"
                className="text-[14px] font-bold text-slate-900"
              >
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label={t("close_aria_label")}
            className="flex  size-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-3 pb-5">
          <p className="text-[13px] text-slate-500 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-[13px] font-semibold rounded-xl transition-all",
              isPending ?
                "bg-rose-400 text-white cursor-not-allowed"
              : "bg-rose-500 hover:bg-rose-600 text-white",
            )}
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {isPending ? t("deleting") : t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
