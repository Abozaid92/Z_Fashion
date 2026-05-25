"use client";

import { useTranslations } from "next-intl";
import { useState, useMemo, type ReactNode } from "react";

import { cn } from "../../../_lib/utils";
import type { SortConfig } from "../../../_types/index";
import PaginationWhole from "@/components/PaginationWhole";
import UsersPaginationWhole from "@/components/paginationUSerCompnent";
import { Link } from "@/i18n/routing";

// ─────────────────────────────────────────────────────────────────────────────
// DataTable — generic, sortable, searchable, paginated table
// Usage: provide columns definition + data array
// ─────────────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string;
  header: string;
  /** Render custom cell content */
  cell?: (row: T, index: number) => ReactNode;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Tailwind class for column width */
  width?: string;
  /** Hide column below this breakpoint */
  hideBelow?: "sm" | "md" | "lg";
  /** Text alignment */
  align?: "left" | "center" | "right";
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  /** Searchable keys */
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  emptyMessage?: string;
  caption?: string;
  className?: string;
  /** Slot rendered above the table (e.g. action buttons) */
  toolbar?: ReactNode;
  paginationType: "User" | "Order";
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const breakpointMap: Record<string, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchKeys = [],
  searchPlaceholder = "Search…",
  pageSize: initialPageSize = 10,
  emptyMessage = "No records found.",
  caption,
  className,
  toolbar,
  paginationType = "Order",
}: DataTableProps<T>) {
  const t = useTranslations("AdminDataTable" as any);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortConfig<T>>({
    key: null,
    direction: "asc",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // ── Filter ────────────────────────────────────────────────────────────────
  // useMemo is justified here: filtering can be O(n×m) on large datasets
  const filtered = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((k) => {
        const val = row[k];
        return val != null && String(val).toLowerCase().includes(q);
      }),
    );
  }, [data, search, searchKeys]);

  // ── Sort ──────────────────────────────────────────────────────────────────
  // useMemo justified: spread + sort is O(n log n)
  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key as keyof T];
      const bv = b[sort.key as keyof T];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        av < bv ? -1
        : av > bv ? 1
        : 0;
      return sort.direction === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort]);

  // ── Paginate ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageData = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Custom toolbar slot */}

        {toolbar && (
          <div id="status_filter" className="flex items-center gap-2">
            <label htmlFor="status_filter" className="text-gray-900 mx-4">
              {t("Status")}
            </label>
            {toolbar}
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm"
            role="grid"
            aria-rowcount={sorted.length}
          >
            {caption && <caption className="sr-only">{caption}</caption>}

            {/* ── Head ── */}
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {columns.map((col) => {
                  const sortDir = sort.key === col.key ? sort.direction : null;
                  return (
                    <th
                      key={String(col.key)}
                      scope="col"
                      className={cn(
                        "px-4 py-3 font-semibold text-[11px] uppercase tracking-wider text-slate-500",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.align !== "right" &&
                          col.align !== "center" &&
                          "text-left",
                        col.width ?? "",
                        col.hideBelow ? breakpointMap[col.hideBelow] : "",
                      )}
                    >
                      {col.sortable ?
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 hover:text-slate-800 transition-colors group"
                          aria-sort={
                            sortDir === "asc" ? "ascending"
                            : sortDir === "desc" ?
                              "descending"
                            : "none"
                          }
                        >
                          {col.header}
                        </button>
                      : col.header}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody className="divide-y divide-slate-50">
              {
                pageData.length === 0 ?
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-16 text-center text-sm text-slate-400"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                  // pageData => all users i have
                : pageData.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="hover:bg-slate-50/80 transition-colors"
                      role="row"
                    >
                      {columns.map((col) => (
                        <td
                          key={String(col.key)}
                          className={cn(
                            "px-4 py-3 text-slate-700",
                            col.align === "right" && "text-right",
                            col.align === "center" && "text-center",
                            col.width ?? "",
                            col.hideBelow ? breakpointMap[col.hideBelow] : "",
                          )}
                        >
                          {col.cell ?
                            col.cell(row, rowIdx)
                          : String(row[col.key as keyof T] ?? "—")}
                        </td>
                      ))}
                    </tr>
                  ))

              }
            </tbody>
          </table>
        </div>

        {/* ── Pagination bar inside card ── */}
        {paginationType === "Order" ?
          <PaginationWhole />
        : <UsersPaginationWhole />}
      </div>
    </div>
  );
}
{
  /* <Link href={`admin/users/${row.id}`}> </Link>; */
}
