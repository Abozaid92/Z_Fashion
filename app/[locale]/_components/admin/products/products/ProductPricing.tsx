"use client";

import { useTranslations } from "next-intl";
import { BarChart2, Percent, Package, ArchiveX } from "lucide-react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { cn } from "@/app/[locale]/_lib/utils";
import { SectionLabel, Field, inputCls } from "./ProductFormShared";

export function ProductPricing({
  register,
  errors,
  setValue,
  watchedPrice,
  watchedDiscount,
  watchedInStock,
  discountedPrice,
}: {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watchedPrice: number;
  watchedDiscount: number;
  watchedInStock: boolean;
  discountedPrice: string | null;
}) {
  const t = useTranslations("AdminProductPricing" as any);
  return (
    <section>
      <SectionLabel
        icon={<BarChart2 size={14} />}
        title={t("section_title")}
        subtitle={t("section_subtitle")}
      />
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field
            label={t("field_price")}
            id="price"
            required
            error={errors.price?.message as string}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] select-none">
                £
              </span>
              <input
                id="price"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                {...register("price", { valueAsNumber: true })}
                className={cn(inputCls(!!errors.price), "pl-7 tabular-nums")}
              />
            </div>
          </Field>
          <Field
            label={t("field_discount")}
            id="discount"
            error={errors.discount?.message as string}
          >
            <div className="relative">
              <Percent
                size={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              />
              <input
                id="discount"
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="0"
                {...register("discount", { valueAsNumber: true })}
                className={cn(inputCls(!!errors.discount), "pr-8 tabular-nums")}
              />
            </div>
          </Field>
          <Field label="Stock Count" id="countStock" hint="Optional">
            <div className="relative">
              <Package
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              />
              <input
                id="countStock"
                type="number"
                min="0"
                placeholder="—"
                {...register("countStock", { valueAsNumber: true })}
                className={cn(inputCls(), "pl-8 tabular-nums")}
              />
            </div>
          </Field>
        </div>

        {discountedPrice && (
          <div className="flex items-center gap-3 px-4 py-3 bg-lime-50 border border-lime-200/80 rounded-xl">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-lime-100 text-lime-600">
              <Percent size={13} />
            </div>
            <div>
              <p className="text-[12px] font-semibold text-lime-800">
                {watchedDiscount}% discount applied
              </p>
              <p className="text-[11px] text-lime-700">
                Customers pay{" "}
                <span className="line-through text-slate-400 font-mono">
                  £{watchedPrice}
                </span>
                {" → "}
                <strong className="font-mono">£{discountedPrice}</strong>
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2.5">
            <ArchiveX
              size={15}
              className={watchedInStock ? "text-emerald-500" : "text-rose-400"}
            />
            <div>
              <p className="text-[13px] font-semibold text-slate-800">
                In Stock
              </p>
              <p className="text-[11px] text-slate-400">
                {watchedInStock ?
                  "Available for purchase"
                : "Marked as out of stock"}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={watchedInStock}
            onClick={() =>
              setValue("inStock", !watchedInStock, { shouldDirty: true })
            }
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-lime-500/30 focus:ring-offset-1",
              watchedInStock ? "bg-lime-500" : "bg-slate-200",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                watchedInStock ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
