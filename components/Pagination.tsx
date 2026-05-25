"use client";

import { useTranslations } from "next-intl";
import { useQueryState, parseAsInteger } from "nuqs";
import { orderPerPage } from "@/lib/constants";

// فانكشن بسيطة لدمج الكلاسات (لو مش بتستخدم cn من lib/utils)
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface typeProps {
  count: number;
  typePaginationState?: string;
  typePerPage?: number;
}
export default function PaginationComponent({
  count,
  typePaginationState = "orderNumber",
  typePerPage = orderPerPage,
}: typeProps) {
  const t = useTranslations("Pagination" as any);
  // console.log("this is type per page", typePerPage);
  // 1. إدارة الحالة عن طريق الـ URL

  const [currentPage, setCurrentPage] = useQueryState(
    typePaginationState,
    parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  );

  // 2. الحسابات الأساسية للـ UI
  const totalPages = Math.max(1, Math.ceil(count / typePerPage));
  const safePage = Math.max(1, Math.min(currentPage, totalPages)); // تأمين إن الصفحة متعديش الحدود

  const startRow = count === 0 ? 0 : (safePage - 1) * typePerPage + 1;
  const endRow = Math.min(safePage * typePerPage, count);

  const setPage = (newPage: number) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/60">
      {/* ── معلومات النتائج ───────────────────────── */}
      <p
        className="text-xs text-slate-500"
        aria-live="polite"
        aria-atomic="true"
      >
        {count === 0 ?
          t("no_results")
        : `${t("showing")} ${startRow}–${endRow} ${t("of")} ${count} ${t("results")}`
        }
      </p>

      {/* ── أزرار التنقل ─────────────────────────── */}
      <nav aria-label="Table pagination">
        <ul className="flex items-center gap-1">
          {/* السابق (Prev) */}
          <li>
            <button
              type="button"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 1}
              aria-label={t("previous")}
              className="px-2.5 cursor-pointer py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              ← {t("previous")}
            </button>
          </li>

          {/* أرقام الصفحات مع النقط (...) */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              if (totalPages <= 7) return true;
              if (p === 1 || p === totalPages) return true;
              if (Math.abs(p - safePage) <= 1) return true;
              return false;
            })
            .reduce<(number | "ellipsis")[]>((acc, p, idx, arr) => {
              if (
                idx > 0 &&
                typeof arr[idx - 1] === "number" &&
                p - (arr[idx - 1] as number) > 1
              ) {
                acc.push("ellipsis");
              }
              acc.push(p);
              return acc;
            }, [])
            .map((p, idx) =>
              p === "ellipsis" ?
                <li key={`ellipsis-${idx}`} aria-hidden="true">
                  <span className="px-2 text-slate-400 text-xs">…</span>
                </li>
              : <li key={p}>
                  <button
                    type="button"
                    onClick={() => setPage(p as number)}
                    aria-label={`${t("page")} ${p}`}
                    aria-current={safePage === p ? "page" : undefined}
                    className={cn(
                      "min-w-[30px] cursor-pointer h-[30px] px-2 text-xs font-medium rounded-lg border transition-colors",
                      safePage === p ?
                        "bg-lime-500 border-lime-500 text-white shadow-sm shadow-lime-500/25"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {p}
                  </button>
                </li>,
            )}

          {/* التالي (Next) */}
          <li>
            <button
              type="button"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage === totalPages}
              aria-label={t("next")}
              className="px-2.5 cursor-pointer py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              {t("next")} →
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
