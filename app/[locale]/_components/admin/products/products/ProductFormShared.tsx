"use client";

import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { cn } from "@/app/[locale]/_lib/utils";

export function SectionLabel({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
      <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </span>
      <div>
        <p className="text-[13px] font-semibold text-slate-800">{title}</p>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Field({
  label,
  required,
  error,
  hint,
  id,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1"
      >
        {label}
        {required && (
          <span className="text-rose-400 normal-case text-xs">*</span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

export const inputCls = (err?: boolean) =>
  cn(
    "w-full px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 bg-white",
    "border rounded-lg outline-none transition-all duration-150",
    "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
    err ?
      "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10"
    : "border-slate-200 hover:border-slate-300 focus:border-lime-400 focus:ring-2 focus:ring-lime-500/15",
  );

export function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: readonly { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ value, label }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={cn(
              "h-8 px-4 text-[12px] font-semibold rounded-lg border transition-all duration-150 select-none",
              active ?
                "bg-lime-500 border-lime-500 text-white shadow-sm shadow-lime-500/25"
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
