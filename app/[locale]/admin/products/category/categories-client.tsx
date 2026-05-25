"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Plus,
  Search,
  FolderOpen,
  Folder,
  FolderPlus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  X,
  AlertCircle,
  Tag,
} from "lucide-react";
import { useQueryState, parseAsString } from "nuqs";
import { cn } from "@/app/[locale]/_lib/utils";
import {
  useCategoriesQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
} from "@/hooks/use-categories-query";
import {
  CategoryFormDialog,
  type CategoryDialogMode,
} from "@/app/[locale]/_components/admin/products/category/category-form-dialog";
import { DeleteDialog } from "@/app/[locale]/_components/admin/products/products/delete-dialog";
import { useTranslations } from "next-intl";

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
// Category Tree Item
// ─────────────────────────────────────────────────────────────
function CategoryItem({
  category,
  isRoot,
  onEdit,
  onDelete,
  onAddSub,
  searchTerm,
}: {
  category: Category;
  isRoot: boolean;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onAddSub: (parentId: string) => void;
  searchTerm: string;
}) {
  const t = useTranslations("AdminCategories" as any);
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  const highlight = (text: string) => {
    if (!searchTerm) return text;
    const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-lime-200 text-lime-900 rounded px-0.5">
          {text.slice(idx, idx + searchTerm.length)}
        </mark>
        {text.slice(idx + searchTerm.length)}
      </>
    );
  };

  return (
    <div className="group/item">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors duration-100",
          "hover:bg-slate-50 group",
        )}
      >
        {/* Expand / folder icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isRoot && hasChildren ?
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? t("collapse") : t("expand")}
              className="flex size-5 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {expanded ?
                <ChevronDown size={13} />
              : <ChevronRight size={13} />}
            </button>
          : <span className="w-5" />}
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-lg shrink-0",
              isRoot ?
                "bg-lime-100 text-lime-600"
              : "bg-slate-100 text-slate-500",
            )}
          >
            {isRoot ?
              hasChildren ?
                <FolderOpen size={14} />
              : <Folder size={14} />
            : <Tag size={13} />}
          </div>
        </div>

        {/* Name + slug */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "truncate",
              isRoot ?
                "text-[13px] font-semibold text-slate-800"
              : "text-[13px] text-slate-700",
            )}
          >
            {highlight(category.name)}
          </p>
          <p className="text-[10px] text-slate-400 font-mono truncate">
            /{category.slug}
          </p>
        </div>

        {/* Children count badge */}
        {isRoot && hasChildren && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-md shrink-0">
            {category.children.length} {t("sub_label")}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
          {isRoot && (
            <button
              type="button"
              onClick={() => onAddSub(category.id)}
              aria-label={t("add_sub_aria", { name: category.name })}
              title={t("add_sub")}
              className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-lime-600 hover:bg-lime-50 transition-colors"
            >
              <FolderPlus size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(category)}
            aria-label={t("edit_aria", { name: category.name })}
            title="Edit"
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            aria-label={t("delete_aria", { name: category.name })}
            title="Delete"
            className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ✅ Children — الـ API بيجيبهم متداخلين، بس نعرضهم */}
      {isRoot && hasChildren && expanded && (
        <div className="ml-6 pl-4 border-l-2 border-slate-100 mt-0.5 space-y-0.5 mb-1">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              isRoot={false}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSub={onAddSub}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main client component
// ─────────────────────────────────────────────────────────────
export function CategoriesClient() {
  const t = useTranslations("AdminCategories" as any);
  // ── URL state ─────────────────────────────────────────────
  const [searchInput, setSearchInput] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const debouncedSearch = useDebounce(searchInput, 300);

  // ── Local state ───────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<CategoryDialogMode>({
    type: "create_new",
  });
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);

  // ── Data ──────────────────────────────────────────────────
  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useCategoriesQuery();

  // ── Mutations ─────────────────────────────────────────────
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  // ─────────────────────────────────────────────────────────────
  // ✅ الـ FIX هنا:
  // الـ API بيرجع root categories فقط وجوا كل واحدة children[] متداخلين
  // مش محتاجين نبني الشجرة يدوياً — كل اللي بنعمله إننا نستخدم categories مباشرة
  // ─────────────────────────────────────────────────────────────
  const rootCategories = categories; // كلهم root categories جاهزين من الـ API

  // ── Stats — بنحسب الأطفال من داخل كل root ────────────────
  const totalRoot = categories.length;
  const totalSub = categories.reduce(
    (acc, c) => acc + (c.children?.length ?? 0),
    0,
  );
  const totalAll = totalRoot + totalSub;

  // ── Filter by search ──────────────────────────────────────
  const filteredCategories =
    debouncedSearch ?
      categories.filter(
        (root) =>
          root.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          root.slug.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          root.children?.some(
            (c) =>
              c.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              c.slug.toLowerCase().includes(debouncedSearch.toLowerCase()),
          ),
      )
    : categories;

  // ── Handlers ──────────────────────────────────────────────
  const handleOpenCreate = () => {
    setFormError(null);
    setDialogMode({ type: "create_new" });
    setDialogOpen(true);
  };

  const handleOpenEdit = useCallback((category: Category) => {
    setFormError(null);
    setDialogMode({ type: "edit", category });
    setDialogOpen(true);
  }, []);

  const handleOpenAddSub = useCallback((parentId: string) => {
    setFormError(null);
    setDialogMode({ type: "add_to_existing", parentId });
    setDialogOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (data: any) => {
      setFormError(null);
      if (dialogMode.type === "edit") {
        updateCategory(data, {
          onSuccess: () => setDialogOpen(false),
          onError: (err: any) => setFormError(err?.message ?? "Update failed"),
        });
      } else {
        createCategory(data, {
          onSuccess: () => setDialogOpen(false),
          onError: (err: any) => setFormError(err?.message ?? "Create failed"),
        });
      }
    },
    [dialogMode, updateCategory, createCategory],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingCategory) return;
    deleteCategory(deletingCategory.id, {
      onSuccess: () => setDeletingCategory(null),
      onError: () => setDeletingCategory(null),
    });
  }, [deletingCategory, deleteCategory]);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 pt-4 sm:pt-6 pb-24 lg:pb-10">
        {/* ── Page Header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <FolderOpen size={18} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-[12px] text-slate-400 mt-0.5">
                {isLoading ?
                  t("loading")
                : t("stats", { root: totalRoot, sub: totalSub })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-semibold rounded-xl shadow-sm shadow-emerald-500/20 transition-all self-start sm:self-auto"
          >
            <Plus size={15} />
            {t("new_category")}
          </button>
        </div>

        {/* ── Stats cards ─────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            {
              label: "Total",
              value: totalAll,
              icon: <Tag size={14} />,
              color: "bg-slate-100 text-slate-500",
            },
            {
              label: "Root",
              value: totalRoot,
              icon: <Folder size={14} />,
              color: "bg-emerald-100 text-emerald-600",
            },
            {
              label: "Sub",
              value: totalSub,
              icon: <FolderOpen size={14} />,
              color: "bg-lime-100 text-lime-600",
            },
          ].map(({ label, value, icon, color }) => (
            <div
              key={label}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg shrink-0",
                  color,
                )}
              >
                {icon}
              </div>
              <div>
                <p className="text-[18px] sm:text-[22px] font-bold text-slate-900 leading-none">
                  {isLoading ?
                    <span className="inline-block w-6 h-4 bg-slate-100 rounded animate-pulse" />
                  : value}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + Refresh ─────────────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="relative flex-1 min-w-0">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="search"
              placeholder={t("search_placeholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label={t("search_aria")}
              className="w-full pl-9 pr-10 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-xl outline-none shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/15 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            aria-label={t("refresh")}
            className="flex size-10 items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* ── Categories List ──────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Table header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {debouncedSearch ?
                t("results_for", {
                  count: filteredCategories.length,
                  query: debouncedSearch,
                })
              : t("categories_count", { count: totalRoot })}
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <Plus size={13} />
              {t("add_root")}
            </button>
          </div>

          {/* Content */}
          <div className="p-3">
            {isLoading ?
              <div className="space-y-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  >
                    <div className="size-7 rounded-lg bg-slate-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3" />
                      <div className="h-2.5 bg-slate-100 rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            : isError ?
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-100">
                  <AlertCircle size={22} className="text-rose-500" />
                </div>
                <p className="text-[14px] font-semibold text-slate-700">
                  {t("failed_to_load")}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <RefreshCw size={13} />
                  {t("try_again")}
                </button>
              </div>
            : filteredCategories.length === 0 ?
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100">
                  <FolderOpen size={26} className="text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-semibold text-slate-700">
                    {debouncedSearch ? t("no_match") : t("no_categories_yet")}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    {debouncedSearch ?
                      t("try_different_keyword")
                    : t("create_first_category")}
                  </p>
                </div>
                {!debouncedSearch && (
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-semibold rounded-xl transition-all"
                  >
                    <Plus size={14} />
                    {t("new_category")}
                  </button>
                )}
              </div>
            : <div className="space-y-1">
                {filteredCategories.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    isRoot={true}
                    onEdit={handleOpenEdit}
                    onDelete={setDeletingCategory}
                    onAddSub={handleOpenAddSub}
                    searchTerm={debouncedSearch}
                  />
                ))}
              </div>
            }
          </div>
        </div>

        {/* ── Help text ─────────────────────────────────────── */}
        {!isLoading && !isError && totalAll > 0 && (
          <p className="mt-4 text-center text-[12px] text-slate-400">
            {t("hover_help_prefix")} ·{" "}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              + {t("add_root")}
            </button>
          </p>
        )}
      </div>

      {/* ── Category Form Dialog ───────────────────────────── */}
      <CategoryFormDialog
        open={dialogOpen}
        mode={dialogMode}
        rootCategories={rootCategories}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleFormSubmit}
        isPending={isCreating || isUpdating}
        error={formError}
      />

      {/* ── Delete Dialog ──────────────────────────────────── */}
      <DeleteDialog
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        isPending={isDeleting}
        title={t("delete_category")}
        description={
          deletingCategory ?
            t("delete_confirm", {
              name: deletingCategory.name,
              count: deletingCategory.children?.length ?? 0,
            })
          : ""
        }
      />

      {/* ── Mobile FAB ────────────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 sm:hidden z-20">
        <button
          type="button"
          onClick={handleOpenCreate}
          aria-label={t("add_category_aria")}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-semibold rounded-2xl shadow-lg shadow-emerald-500/30 transition-all"
        >
          <Plus size={16} />
          {t("add_category")}
        </button>
      </div>
    </div>
  );
}
