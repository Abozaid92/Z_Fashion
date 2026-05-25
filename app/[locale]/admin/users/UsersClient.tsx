// app/admin/users/UsersClient.tsx
"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import {
  DataTable,
  type Column,
} from "../../_components/admin/tables/DataTable";
import { useUsers } from "@/hooks/useUsers";
import { useUpdateUserStatus } from "@/hooks/useUpdateUserStatus";
import UpdateStatusModal from "../../_components/admin/users/UpdataStatusModal";
import type { UserRow } from "../../utils/AllUserType";
import UserFilters from "../../_components/admin/users/UsersFilter";
import UsersStats from "../../_components/admin/users/UsersStats";
import { getColumns } from "./userColumns";
import { toast } from "react-toastify";

function SkeletonRows({
  count = 8,
  cols = 6,
}: {
  count?: number;
  cols?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div
                className="h-4 rounded-md bg-slate-100"
                style={{ width: `${60 + ((i * j + j * 3) % 4) * 10}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function UsersClient() {
  const {
    users,
    isLoading,
    isFetching,
    isError,
    filters,
    searchInput,
    handleSearchChange,
    setRole,
    setStatus,
  } = useUsers();
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const { mutate: updateStatus, isPending } = useUpdateUserStatus(
    filters,
    () => {
      setSelectedUser(null);
      toast("User status updated successfully.", { type: "success" });
    },
  );

  const columns = useMemo(() => getColumns(setSelectedUser), []);
  if (isError) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-sm text-red-500">
        ⚠ Failed to load users. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Users
          </h1>
        </div>
      </div>

      <UsersStats />

      <UserFilters
        searchInput={searchInput}
        handleSearchChange={handleSearchChange}
        isFetching={isFetching}
        role={filters.role}
        setRole={setRole}
        status={filters.status}
        setStatus={setStatus}
        userPerPage={0}
        setLimit={function (limit: number): void {
          throw new Error("Function not implemented.");
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {isLoading ?
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  {[
                    "User",
                    "Role",
                    "Status",
                    "Total Spent",
                    "Orders",
                    "Joined",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <SkeletonRows count={8} cols={6} />
              </tbody>
            </table>
          </div>
        : <div
            className={`transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}
          >
            <DataTable
              data={users as unknown as Record<string, unknown>[]}
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              searchKeys={[]}
              searchPlaceholder=""
              pageSize={users.length}
              caption="Users table"
              emptyMessage="No users match your filters."
              paginationType="User"
            />
          </div>
        }
      </div>

      <UpdateStatusModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onConfirm={(userId, status) =>
          updateStatus(
            { userId, status },
            {
              onError: () =>
                toast("Failed to update status. Please try again.", {
                  type: "error",
                }),
            },
          )
        }
        isPending={isPending}
      />
    </div>
  );
}
