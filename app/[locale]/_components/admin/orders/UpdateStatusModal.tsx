// app/admin/orders/_components/UpdateStatusModal.tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X, RefreshCw } from "lucide-react";
import type { Order } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// Constants  (exported → shared with OrdersClient badge)
// ─────────────────────────────────────────────────────────────
export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type StatusKey = (typeof ORDER_STATUSES)[number] | string;

export const STATUS_CONFIG: Record<
  string,
  { label: string; badge: string; ring: string }
> = {
  PENDING: {
    label: "pending",
    badge: "bg-amber-50   text-amber-700  border-amber-200",
    ring: "ring-amber-300",
  },
  PROCESSING: {
    label: "processing",
    badge: "bg-sky-50     text-sky-700    border-sky-200",
    ring: "ring-sky-300",
  },
  SHIPPED: {
    label: "shipped",
    badge: "bg-violet-50  text-violet-700 border-violet-200",
    ring: "ring-violet-300",
  },
  DELIVERED: {
    label: "delivered",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ring: "ring-emerald-400",
  },
  CANCELLED: {
    label: "cancelled",
    badge: "bg-slate-100  text-slate-500  border-slate-200",
    ring: "ring-slate-300",
  },
};

export const getStatusBadge = (status: StatusKey) =>
  STATUS_CONFIG[status]?.badge ??
  "bg-slate-100 text-slate-500 border-slate-200";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
interface Props {
  order: Order | null;
  onClose: () => void;
  onConfirm: (orderId: string, status: string) => void;
  isPending: boolean;
}

export default function UpdateStatusModal({
  order,
  onClose,
  onConfirm,
  isPending,
}: Props) {
  const t = useTranslations("AdminUpdateStatusModal" as any);
  const isOpen = !!order;
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (order) setSelected(order.status);
  }, [order]);

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const isUnchanged = selected === order?.status;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={() => !isPending && onClose()}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-lime-50 text-lime-600">
              <RefreshCw size={14} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                {t("modal_title")}
              </h2>
              <p className="font-mono text-[11px] text-slate-400">
                #{order?.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-40"
          >
            <X size={14} />
          </button>
        </div>

        {/* Current status */}
        <div className="px-5 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            {t("current_status_label")}
          </p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(order?.status ?? "")}`}
          >
            <span className="size-1.5 rounded-full bg-current opacity-60" />
            {t(`statuses.${(order?.status ?? "").toLowerCase()}`)}
          </span>
        </div>

        {/* Status options */}
        <div className="px-5 pt-3 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            {t("change_to_label")}
          </p>
          <div className="space-y-1.5">
            {ORDER_STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const isActive = selected === s;
              return (
                <button
                  key={s}
                  onClick={() => setSelected(s)}
                  disabled={isPending}
                  className={`
                    w-full flex items-center gap-3 rounded-xl border px-3.5 py-2.5
                    text-left text-sm font-medium transition-all duration-100
                    disabled:cursor-not-allowed
                    ${
                      isActive ?
                        `${cfg.badge} ring-2 ${cfg.ring} scale-[1.01] shadow-sm`
                      : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700"
                    }
                  `}
                >
                  {/* Radio dot */}
                  <span
                    className={`
                    size-3.5 rounded-full border-2 flex-shrink-0 transition-colors
                    ${isActive ? "border-current bg-current" : "border-slate-300"}
                  `}
                  />
                  {t(`statuses.${s.toLowerCase()}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40"
          >
            {t("cancel_button")}
          </button>
          <button
            onClick={() => order && onConfirm(order.id, selected)}
            disabled={isPending || isUnchanged}
            className="rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending ?
              <span className="flex items-center gap-2">
                <span className="size-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {t("saving_text")}
              </span>
            : t("confirm_button")}
          </button>
        </div>
      </div>
    </div>
  );
}
