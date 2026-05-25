"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsArrayOf,
} from "nuqs";
import { useTranslations } from "next-intl";
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Package,
  Star,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Tag,
  TrendingDown,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/app/[locale]/_lib/utils";
import {
  useProductsQuery,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  type Product,
  type ProductFilters,
} from "@/hooks/use-products-query";
import { useCategoriesQuery } from "@/hooks/use-categories-query";
import { ProductFormSheet } from "@/app/[locale]/_components/admin/products/products/product-form-sheet";
import { DeleteDialog } from "@/app/[locale]/_components/admin/products/products/delete-dialog";
import { productPerPage } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "kids", label: "Kids" },
  { value: "unisex", label: "Unisex" },
];

const SIZE_OPTIONS = [
  { value: "Small", label: "S" },
  { value: "Medium", label: "M" },
  { value: "Large", label: "L" },
  { value: "XLarge", label: "XL" },
];

// ─────────────────────────────────────────────────────────────
// Debounce hook
// ─────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────────────────────
// Small UI pieces
// ─────────────────────────────────────────────────────────────
function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "green" | "rose" | "amber" | "slate";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide",
        variant === "default" && "bg-slate-100 text-slate-600",
        variant === "green" && "bg-emerald-100 text-emerald-700",
        variant === "rose" && "bg-rose-100 text-rose-600",
        variant === "amber" && "bg-amber-100 text-amber-700",
        variant === "slate" && "bg-slate-100 text-slate-500",
      )}
    >
      {children}
    </span>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 bg-lime-100 text-lime-800 border border-lime-200 rounded-full text-[11px] font-semibold">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="flex size-4 items-center justify-center rounded-full hover:bg-lime-200 transition-colors cursor-pointer"
      >
        <X size={9} />
      </button>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Filters Drawer (mobile) + Panel (desktop)
// ─────────────────────────────────────────────────────────────
function FiltersPanel({
  open,
  onClose,
  isDrawer,
  // filter state
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedGenders,
  setSelectedGenders,
  selectedSizes,
  setSelectedSizes,
  categoryId,
  setCategoryId,
  categories,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  isDrawer: boolean;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  selectedGenders: string[];
  setSelectedGenders: (v: string[]) => void;
  selectedSizes: string[];
  setSelectedSizes: (v: string[]) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  categories: { id: string; name: string }[];
  onReset: () => void;
}) {
  const toggleArr = (
    arr: string[],
    set: (v: string[]) => void,
    val: string,
  ) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const t = useTranslations("AdminProducts" as any);

  const content = (
    <div className="p-5 space-y-6">
      {/* Reset */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold text-slate-800">{t("filters")}</p>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <RefreshCw size={11} />
          {t("reset_all")}
        </button>
      </div>

      {/* Category */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">
          {t("category")}
        </p>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-3 py-2 text-[13px] text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-500/15 transition-all"
        >
          <option value="">{t("all_categories")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">
          {t("price_range")}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="number"
            placeholder={t("min")}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
            className="flex-1 px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 bg-white border border-slate-200 rounded-lg outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-500/15 transition-all"
          />
          <span className="text-slate-300 text-[13px]">–</span>
          <input
            type="number"
            placeholder={t("max")}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
            className="flex-1 px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-300 bg-white border border-slate-200 rounded-lg outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-500/15 transition-all"
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">
          {t("gender")}
        </p>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map(({ value, label }) => {
            const active = selectedGenders.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  toggleArr(selectedGenders, setSelectedGenders, value)
                }
                className={cn(
                  "h-8 px-4 text-[12px] font-semibold rounded-lg border transition-all select-none cursor-pointer",
                  active ?
                    "bg-lime-500 border-lime-500 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300",
                )}
              >
                {t(`gender_${value}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">
          {t("sizes")}
        </p>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map(({ value, label }) => {
            const active = selectedSizes.includes(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  toggleArr(selectedSizes, setSelectedSizes, value)
                }
                className={cn(
                  "h-8 w-10 text-[12px] font-bold rounded-lg border transition-all select-none cursor-pointer",
                  active ?
                    "bg-lime-500 border-lime-500 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (isDrawer) {
    if (!open) return null;
    return (
      <>
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
        <div className="fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl overflow-y-auto lg:hidden animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-slate-500" />
              <p className="text-[14px] font-bold text-slate-800">
                {t("filters")}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
          {content}
        </div>
      </>
    );
  }

  // Desktop sidebar panel
  return (
    <div className="hidden lg:block w-60 xl:w-64 shrink-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-fit sticky top-6">
      {content}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Product Row
// ─────────────────────────────────────────────────────────────
function ProductRow({
  product,
  onEdit,
  onDelete,
  t,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  t: any;
}) {
  const discounted =
    product.discount && product.discount > 0 ?
      Math.round(product.price * (1 - product.discount / 100))
    : null;
  return (
    <tr className="group border-b border-slate-100 hover:bg-slate-50/60 transition-colors duration-100">
      {/* Image + Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative size-10 sm:size-12 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
            {product.image ?
              <Image
                quality={30}
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            : <div className="absolute inset-0 flex items-center justify-center">
                <Package size={16} className="text-slate-300" />
              </div>
            }
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-900  max-w-[160px] sm:max-w-[220px]">
              {product.name}
            </p>
            {product.brand && (
              <p className="text-[11px] text-slate-400 mt-0.5 ">
                {product.brand}
              </p>
            )}
            <p className="text-[10px] text-slate-300 font-mono mt-0.5  max-w-[140px]">
              {product.slug}
            </p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <Badge variant="default">{product.category?.name ?? "—"}</Badge>
      </td>

      {/* Price */}
      <td className="px-4 py-3">
        <div className="flex flex-col">
          {discounted ?
            <>
              <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                EGP{discounted}
              </span>
              <span className="text-[10px] text-slate-400 line-through tabular-nums">
                EGP{product.price}
              </span>
            </>
          : <span className="text-[13px] font-bold text-slate-900 tabular-nums">
              EGP{product.price}
            </span>
          }
          {product.discount && product.discount > 0 ?
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-500 mt-0.5">
              <TrendingDown size={9} />
              {t("discount_off", { discount: product.discount })}
            </span>
          : null}
        </div>
      </td>

      {/* Stock */}
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="flex flex-col gap-1">
          {product.inStock ?
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 size={11} />
              {t("in_stock")}
            </span>
          : <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
              <XCircle size={11} />
              {t("out_of_stock")}
            </span>
          }
          {product.countStock != null && (
            <span className="text-[10px] text-slate-400">
              {product.countStock} {t("units")}
            </span>
          )}
        </div>
      </td>

      {/* Sizes */}
      <td className="px-4 py-3 hidden xl:table-cell">
        <div className="flex flex-wrap gap-1">
          {product.size?.length > 0 ?
            product.size.map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded"
              >
                {s === "Small" ?
                  "S"
                : s === "Medium" ?
                  "M"
                : s === "Large" ?
                  "L"
                : "XL"}
              </span>
            ))
          : <span className="text-[11px] text-slate-300">—</span>}
        </div>
      </td>

      {/* Rating */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="flex items-center gap-1">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          <span className="text-[12px] font-semibold text-slate-700">
            {product.rating}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            onClick={() => onEdit(product)}
            aria-label={`Edit ${product.name}`}
            className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:text-lime-600 hover:bg-lime-50 transition-colors cursor-pointer"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            aria-label={`Delete ${product.name}`}
            className="flex size-7 items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Client Component
// ─────────────────────────────────────────────────────────────
export function ProductsClient() {
  const t = useTranslations("AdminProducts" as any);
  // ── URL State (nuqs) ──────────────────────────────────────
  const [searchInput, setSearchInput] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [minParam, setMinParam] = useQueryState(
    "min",
    parseAsString.withDefault(""),
  );
  const [maxParam, setMaxParam] = useQueryState(
    "max",
    parseAsString.withDefault(""),
  );
  const [genderParam, setGenderParam] = useQueryState(
    "gender",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [sizeParam, setSizeParam] = useQueryState(
    "size",
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [catParam, setCatParam] = useQueryState(
    "cat",
    parseAsString.withDefault(""),
  );

  // Debounce search — prevents DB overload
  const debouncedSearch = useDebounce(searchInput, 400);

  // ── Local UI State ────────────────────────────────────────
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Derived filter object ─────────────────────────────────
  const filters: ProductFilters = {
    search: debouncedSearch || undefined,
    min: minParam ? Number(minParam) : undefined,
    max: maxParam ? Number(maxParam) : undefined,
    gender: genderParam.length ? genderParam : undefined,
    size: sizeParam.length ? sizeParam : undefined,
    pageNumber: page,
  };

  // ── Data ──────────────────────────────────────────────────
  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useProductsQuery(filters);
  // console.log("this is products in admin", products);
  const { data: categories = [] } = useCategoriesQuery();

  // ── Mutations ─────────────────────────────────────────────
  const {
    mutate: createProduct,
    isPending: isCreating,
    error: createError,
  } = useCreateProduct();
  const {
    mutate: updateProduct,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateProduct();
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  // ── Handlers ──────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingProduct(null);
    setFormError(null);
    setFormSheetOpen(true);
  }, []);

  const handleOpenEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setFormError(null);
    setFormSheetOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (data: any) => {
      setFormError(null);
      if (editingProduct) {
        updateProduct(data, {
          onSuccess: () => setFormSheetOpen(false),
          onError: (err: any) => setFormError(err?.message ?? "Update failed"),
        });
      } else {
        createProduct(data, {
          onSuccess: () => setFormSheetOpen(false),
          onError: (err: any) => setFormError(err?.message ?? "Create failed"),
        });
      }
    },
    [editingProduct, updateProduct, createProduct],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingProduct) return;
    deleteProduct(deletingProduct.id, {
      onSuccess: () => setDeletingProduct(null),
      onError: () => setDeletingProduct(null),
    });
  }, [deletingProduct, deleteProduct]);

  const handleResetFilters = () => {
    setSearchInput("");
    setMinParam("");
    setMaxParam("");
    setGenderParam([]);
    setSizeParam([]);
    setCatParam("");
    setPage(1);
  };

  // Count active filters
  const activeFilterCount =
    (minParam ? 1 : 0) +
    (maxParam ? 1 : 0) +
    genderParam.length +
    sizeParam.length +
    (catParam ? 1 : 0);

  // Flatten categories for display
  const flatCats = categories.map((c) => ({ id: c.id, name: c.name }));
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 pt-4 sm:pt-6 pb-24 lg:pb-10">
        {/* ── Page Header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-lime-100 text-lime-600">
              <Package size={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-[12px] text-slate-400 mt-0.5">
                {isLoading ?
                  t("loading")
                : t("products_found", { count: products.length })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-lime-500 hover:bg-lime-600 text-white text-[13px] font-semibold rounded-xl shadow-sm shadow-lime-500/20 transition-all duration-150 self-start sm:self-auto cursor-pointer"
          >
            <Plus size={15} />
            {t("add_product")}
          </button>
        </div>

        {/* ── Search + Filter bar ─────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder={t("search_placeholder")}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (page !== 1) setPage(1);
              }}
              aria-label="Search products"
              className="w-full pl-9 pr-4 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl outline-none shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:border-lime-400 focus:ring-2 focus:ring-lime-500/15 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter button (mobile) */}
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            aria-label="Open filters"
            className={cn(
              "lg:hidden relative flex items-center gap-2 px-3 py-2.5 bg-white border rounded-xl text-[13px] font-medium transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-pointer",
              activeFilterCount > 0 ?
                "border-lime-400 text-lime-700"
              : "border-slate-200 text-slate-600",
            )}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">{t("filters")}</span>
            {activeFilterCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-lime-500 text-white text-[9px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={() => refetch()}
            aria-label="Refresh products"
            className="flex size-10 items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* ── Active filter chips ─────────────────────────── */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[11px] font-medium text-slate-400">
              {t("active_label")}
            </span>
            {minParam && (
              <FilterChip
                label={`${t("min")} ${minParam}`}
                onRemove={() => setMinParam("")}
              />
            )}
            {maxParam && (
              <FilterChip
                label={`${t("max")} ${maxParam}`}
                onRemove={() => setMaxParam("")}
              />
            )}
            {genderParam.map((g) => (
              <FilterChip
                key={g}
                label={g}
                onRemove={() =>
                  setGenderParam(genderParam.filter((x) => x !== g))
                }
              />
            ))}
            {sizeParam.map((s) => (
              <FilterChip
                key={s}
                label={s}
                onRemove={() => setSizeParam(sizeParam.filter((x) => x !== s))}
              />
            ))}
            {catParam && (
              <FilterChip
                label={
                  categories.find((c) => c.id === catParam)?.name ?? catParam
                }
                onRemove={() => setCatParam("")}
              />
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors cursor-pointer"
            >
              {t("reset_all")}
            </button>
          </div>
        )}

        {/* ── Layout: Sidebar + Table ─────────────────────── */}
        <div className="flex gap-5 items-start">
          {/* Desktop Filter Sidebar */}
          <FiltersPanel
            open={true}
            onClose={() => {}}
            isDrawer={false}
            minPrice={minParam}
            setMinPrice={(v) => {
              setMinParam(v || null);
              setPage(1);
            }}
            maxPrice={maxParam}
            setMaxPrice={(v) => {
              setMaxParam(v || null);
              setPage(1);
            }}
            selectedGenders={genderParam}
            setSelectedGenders={(v) => {
              setGenderParam(v);
              setPage(1);
            }}
            selectedSizes={sizeParam}
            setSelectedSizes={(v) => {
              setSizeParam(v);
              setPage(1);
            }}
            categoryId={catParam}
            setCategoryId={(v) => {
              setCatParam(v || null);
              setPage(1);
            }}
            categories={flatCats}
            onReset={handleResetFilters}
          />

          {/* Mobile Filter Drawer */}
          <FiltersPanel
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            isDrawer={true}
            minPrice={minParam}
            setMinPrice={(v) => {
              setMinParam(v || null);
              setPage(1);
            }}
            maxPrice={maxParam}
            setMaxPrice={(v) => {
              setMaxParam(v || null);
              setPage(1);
            }}
            selectedGenders={genderParam}
            setSelectedGenders={(v) => {
              setGenderParam(v);
              setPage(1);
            }}
            selectedSizes={sizeParam}
            setSelectedSizes={(v) => {
              setSizeParam(v);
              setPage(1);
            }}
            categoryId={catParam}
            setCategoryId={(v) => {
              setCatParam(v || null);
              setPage(1);
            }}
            categories={flatCats}
            onReset={handleResetFilters}
          />

          {/* Table area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Table */}
              <div className="overflow-x-auto">
                <table
                  className="w-full"
                  role="table"
                  aria-label="Products table"
                >
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400 w-[40%]">
                        {t("col_product")}
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400 hidden sm:table-cell">
                        {t("col_category")}
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {t("col_price")}
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400 hidden md:table-cell">
                        {t("col_stock")}
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400 hidden xl:table-cell">
                        {t("col_sizes")}
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400 hidden lg:table-cell">
                        {t("col_rating")}
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400 w-16">
                        <span className="sr-only">{t("col_actions")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ?
                      // Skeleton rows
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="border-b border-slate-100">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="size-12 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                              <div className="space-y-1.5 flex-1">
                                <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
                                <div className="h-2.5 bg-slate-100 rounded animate-pulse w-1/2" />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <div className="h-5 bg-slate-100 rounded-md animate-pulse w-20" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-3.5 bg-slate-100 rounded animate-pulse w-16" />
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="h-3.5 bg-slate-100 rounded animate-pulse w-14" />
                          </td>
                          <td className="px-4 py-3 hidden xl:table-cell">
                            <div className="h-3.5 bg-slate-100 rounded animate-pulse w-20" />
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <div className="h-3.5 bg-slate-100 rounded animate-pulse w-10" />
                          </td>
                          <td className="px-4 py-3" />
                        </tr>
                      ))
                    : isError ?
                      <tr>
                        <td colSpan={7} className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-100">
                              <AlertCircle
                                size={22}
                                className="text-rose-500"
                              />
                            </div>
                            <p className="text-[14px] font-semibold text-slate-700">
                              {t("failed_to_load")}
                            </p>
                            <button
                              type="button"
                              onClick={() => refetch()}
                              className="flex items-center gap-1.5 text-[13px] font-medium text-lime-600 hover:text-lime-700 transition-colors cursor-pointer"
                            >
                              <RefreshCw size={13} />
                              {t("try_again")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    : products.length === 0 ?
                      <tr>
                        <td colSpan={7} className="px-4 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100">
                              <Package size={26} className="text-slate-400" />
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-slate-700">
                                {t("no_products_found")}
                              </p>
                              <p className="text-[12px] text-slate-400 mt-0.5">
                                {activeFilterCount > 0 ?
                                  t("try_adjust_filters")
                                : t("create_first_product")}
                              </p>
                            </div>
                            {activeFilterCount > 0 ?
                              <button
                                type="button"
                                onClick={handleResetFilters}
                                className="text-[13px] font-medium text-lime-600 hover:text-lime-700 transition-colors cursor-pointer"
                              >
                                {t("clear_filters")}
                              </button>
                            : <button
                                type="button"
                                onClick={handleOpenCreate}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer"
                              >
                                <Plus size={14} />
                                {t("add_product")}
                              </button>
                            }
                          </div>
                        </td>
                      </tr>
                    : (products as any).products.map((product: any) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          onEdit={handleOpenEdit}
                          onDelete={setDeletingProduct}
                          t={t}
                        />
                      ))
                    }
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ─────────────────────────────── */}
              {products && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-[12px] text-slate-400 order-2 sm:order-1">
                    Page{" "}
                    <span className="font-semibold text-slate-700">{page}</span>
                    {" · "}
                    <span className="font-semibold text-slate-700">
                      {products.length}
                    </span>{" "}
                    items
                  </p>
                  <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      aria-label="Previous page"
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {/* Page buttons */}
                    {[page - 1, page, page + 1]
                      .filter((p) => p > 0)
                      .slice(0, 3)
                      .map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          aria-label={`Page ${p}`}
                          aria-current={p === page ? "page" : undefined}
                          className={cn(
                            "flex size-8 items-center justify-center rounded-lg border text-[13px] font-medium transition-all cursor-pointer",
                            p === page ?
                              "bg-lime-500 border-lime-500 text-white shadow-sm shadow-lime-500/20"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    <button
                      type="button"
                      onClick={() => {
                        if (products.length === productPerPage)
                          setPage(page + 1);
                      }}
                      disabled={products.length < productPerPage}
                      aria-label="Next page"
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Create / Edit Sheet ────────────────────────────── */}
      <ProductFormSheet
        open={formSheetOpen}
        onClose={() => setFormSheetOpen(false)}
        product={editingProduct}
        categories={categories}
        onSubmit={handleFormSubmit}
        isPending={isCreating || isUpdating}
        error={formError}
      />

      {/* ── Delete Dialog ──────────────────────────────────── */}
      <DeleteDialog
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        isPending={isDeleting}
        title={t("delete_product")}
        description={
          deletingProduct ?
            t("delete_confirm", { name: deletingProduct.name })
          : ""
        }
      />

      {/* ── Mobile sticky Add button ───────────────────────── */}
      <div className="fixed bottom-4 right-4 sm:hidden z-20">
        <button
          type="button"
          onClick={handleOpenCreate}
          aria-label="Add new product"
          className="flex items-center gap-2 px-4 py-3 bg-lime-500 hover:bg-lime-600 text-white text-[13px] font-semibold rounded-2xl shadow-lg shadow-lime-500/30 transition-all cursor-pointer"
        >
          <Plus size={16} />
          {t("add_product")}
        </button>
      </div>
    </div>
  );
}
