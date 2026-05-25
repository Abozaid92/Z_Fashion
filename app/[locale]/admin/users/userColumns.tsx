// app/admin/users/_lib/user-columns.tsx
import { Column } from "../../_components/admin/tables/DataTable";
import { UserRow } from "../../utils/AllUserType";
import { formatCurrency, formatDate } from "../../_lib/utils";
import { Avatar } from "../../_components/admin/ui/Avatar";
import { statusBadgeStyle } from "../../_components/admin/users/UpdataStatusModal";

// عملنا Function بترجع الـ Columns عشان نقدر نمرر لها الـ Actions (زي الـ Open Modal)
export const getColumns = (
  setSelectedUser: (user: UserRow) => void,
): Column<UserRow>[] => [
  {
    key: "name",
    header: "User",
    sortable: false,
    width: "min-w-[250px]",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar
          src={row.image ?? undefined}
          name={row.name ?? "?"}
          size="sm"
          className="border border-slate-100 shadow-sm"
        />
        <div className="min-w-0 flex flex-col">
          <p className="text-sm font-semibold text-slate-800 truncate leading-none mb-1">
            {row.name ?? "—"}
          </p>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <p className="text-[11px] text-slate-400 truncate max-w-[120px]">
              {row.email}
            </p>
          </div>
        </div>
      </div>
    ),
  },

  {
    key: "country",
    header: "Country",
    sortable: true,
    cell: (row) => (
      <>
        {row.country && (
          <>
            <span className="size-0.5 rounded-full bg-slate-300 flex-shrink-0" />
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight truncate">
              {row.country}
            </span>
          </>
        )}
      </>
    ),
  },
  {
    key: "role",
    header: "Role",
    sortable: true,
    cell: (row) => (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
          row.role === "ADMIN" ?
            "bg-violet-50 text-violet-600 border-violet-100"
          : "bg-slate-50 text-slate-500 border-slate-100"
        }`}
      >
        {row.role}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => (
      <button
        onClick={() => setSelectedUser(row)}
        title="Change user status"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all active:scale-95 hover:shadow-sm ${statusBadgeStyle(
          row.status,
        )}`}
      >
        <span className="size-1.5 rounded-full bg-current" />
        {row.status}
      </button>
    ),
  },
  {
    key: "totalSpent",
    header: "Total Spent",
    sortable: true,
    align: "right",
    cell: (row) => (
      <span className="font-mono text-sm font-bold text-slate-700 tabular-nums">
        {formatCurrency(row.totalSpent ?? 0)}
      </span>
    ),
  },
  {
    key: "orders",
    header: "Orders",
    sortable: true,
    align: "right",
    cell: (row) => {
      const count =
        row._count?.order ?? (Array.isArray(row.order) ? row.order.length : 0);
      return (
        <div className="flex flex-col items-end leading-none">
          <span
            className={`text-sm font-bold ${count > 0 ? "text-emerald-600" : "text-slate-400"}`}
          >
            {count}
          </span>
          <span className="text-[9px] uppercase font-bold text-slate-300 tracking-tighter mt-0.5">
            Orders
          </span>
        </div>
      );
    },
  },
  {
    key: "createdAt",
    header: "Joined",
    sortable: true,
    cell: (row) => (
      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
        {row.createdAt ? formatDate(new Date(row.createdAt) as any) : "—"}
      </span>
    ),
  },
];
