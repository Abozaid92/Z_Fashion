"use client";

import { useTranslations } from "next-intl";
import { Info, Link } from "lucide-react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormGetValues,
} from "react-hook-form";
import { cn } from "@/app/[locale]/_lib/utils";
import { SectionLabel, Field, inputCls } from "./ProductFormShared";
import { useState } from "react";

// Replace 'any' with your FormValues type if exported
export function ProductBasicInfo({
  register,
  errors,
  flatCategories,
  setSlugEdited,
}: {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  flatCategories: {
    id: string;
    parentId: string | null | undefined;
    name: string;
    slug: string;
    depth: number;
  }[];
  setSlugEdited: (v: boolean) => void;
}) {
  const t = useTranslations("AdminProductBasicInfo" as any);
  // console.log("this is the child categories", flatCategories);
  const [parentSelected, setParentSelected] = useState("");
  const mainctg = flatCategories.filter((el) => !el.parentId);
  const subctg = flatCategories.filter((el) => {
    // // console.log("this is selected", parentSelected, "and this el", el);
    return el.parentId === parentSelected && el.id !== parentSelected;
  });

  return (
    <section>
      <SectionLabel
        icon={<Info size={14} />}
        title={t("section_title")}
        subtitle={t("section_subtitle")}
      />
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("field_product_name")}
            id="name"
            required
            error={errors.name?.message as string}
          >
            <input
              id="name"
              type="text"
              autoComplete="off"
              placeholder={t("placeholder_product_name")}
              {...register("name")}
              className={inputCls(!!errors.name)}
            />
          </Field>
          <Field label="Brand" id="brand">
            <input
              id="brand"
              type="text"
              placeholder="e.g. Nike, Adidas…"
              {...register("brand")}
              className={inputCls()}
            />
          </Field>
        </div>

        <Field label="Description" id="description" hint="Optional">
          <textarea
            id="description"
            rows={3}
            placeholder="Write a short product description…"
            {...register("description")}
            className={cn(inputCls(), "resize-none leading-relaxed")}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Category"
            id="categoryId"
            required
            error={errors.categoryId?.message as string}
          >
            <select
              id="categoryId"
              {...register("categoryId", {
                onChange: (e) => {
                  const selectedId = e.target.value;
                  setParentSelected(selectedId); // كدة الاستيت هتتحدث
                },
              })}
              className={inputCls(!!errors.categoryId)}
            >
              <option value="">Select category…</option>
              {mainctg.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.depth > 0 ? `${"  ".repeat(c.depth)}↳ ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="SubCategory"
            id="subCategoryId"
            required
            error={errors.subCategoryId?.message as string}
          >
            <select
              id="subCategoryId"
              {...register("subCategoryId")}
              className={inputCls(!!errors.subCategoryId)}
            >
              <option value="">Select subcategory…</option>
              {subctg.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {/* {c.depth > 0 ? `${"  ".repeat(c.depth)}↳ ${c.name}` : c.name} */}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Slug"
            id="slug"
            required
            error={errors.slug?.message as string}
            hint="Auto-generated · editable"
          >
            <div className="relative">
              <Link
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              />
              <input
                id="slug"
                type="text"
                placeholder="product-slug"
                {...register("slug")}
                onInput={() => setSlugEdited(true)}
                className={cn(
                  inputCls(!!errors.slug),
                  "pl-8 font-mono text-[12px]",
                )}
              />
            </div>
          </Field>
        </div>
      </div>
    </section>
  );
}
