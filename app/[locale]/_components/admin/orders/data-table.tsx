// components/ui/data-table.tsx
"use client";

import { useTranslations } from "next-intl";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

// ─────────────────────────────────────────────────────────────
//  Props
// ─────────────────────────────────────────────────────────────
interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────
export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
}: DataTableProps<TData>) {
  const t = useTranslations("DataTable" as any);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {/* ── Head ─────────────────────────────────────────── */}
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-slate-800 bg-slate-900/80"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                >
                  {header.isPlaceholder ? null : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        {/* ── Body ─────────────────────────────────────────── */}
        <tbody>
          {/* Loading skeleton */}
          {isLoading ?
            Array.from({ length: 6 }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-slate-800/60 animate-pulse"
              >
                {columns.map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 w-full rounded-md bg-slate-800" />
                  </td>
                ))}
              </tr>
            ))
          : table.getRowModel().rows.length === 0 ?
            // Empty state
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-16 text-center text-sm text-slate-600"
              >
                {t("no_orders_found")}
              </td>
            </tr>
            // Data rows
          : table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="
                  border-b border-slate-800/60 bg-transparent
                  transition-colors hover:bg-slate-800/30
                "
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
