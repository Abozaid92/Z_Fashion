// app/admin/orders/_components/ViewItemsModal.tsx
"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Package } from "lucide-react";
import { formatCurrency } from "../../../_lib/utils";
import type { OrderItem } from "@prisma/client";

interface ViewItemsModalProps {
  items: OrderItem[] | null;
  onClose: () => void;
}

export default function ViewItemsModal({
  items,
  onClose,
}: ViewItemsModalProps) {
  const t = useTranslations("AdminViewItemsModal" as any);
  const isOpen = !!items;

  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalUnits = items!.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-lime-50 text-lime-600">
              <Package size={15} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                {t("modal_title")}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t("item_count", { count: items!.length })} ·{" "}
                {t("unit_count", { count: totalUnits })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Items list */}
        <div className="p-4 space-y-1.5 max-h-72 overflow-y-auto">
          {/* Column labels */}
          <div className="grid grid-cols-[1fr_3rem_5rem] gap-2 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <span>{t("column_product")}</span>
            <span className="text-right">{t("column_qty")}</span>
            <span className="text-right">{t("column_price")}</span>
          </div>

          {items!.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_3rem_5rem] gap-2 items-center rounded-xl bg-slate-50 px-3 py-2.5 hover:bg-slate-100 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700 truncate">
                {(item as any).product.name}
              </span>
              <span className="text-right text-xs text-slate-400 font-mono">
                ×{item.quantity}
              </span>
              <span className="text-right text-xs font-semibold text-slate-700 font-mono">
                {formatCurrency(item.price)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/60">
          <span className="text-xs text-slate-400">{t("subtotal_label")}</span>
          <span className="text-sm font-bold text-slate-800 font-mono">
            {formatCurrency(
              items!.reduce((s, i) => s + i.price * i.quantity, 0),
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
