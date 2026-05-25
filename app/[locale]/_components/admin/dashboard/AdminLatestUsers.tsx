"use client";

import { useQuery } from "@tanstack/react-query";
import { memo } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
// Fetch function
async function fetchDashboardData() {
  const response = await fetch("/api/admin/dashboard");
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
}

const RecentUsersTable = memo(({ users }: { users: any[] }) => {
  const t = useTranslations("AdminLatestUsers" as any);
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Users</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                User
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm relative">
                      {user.image ?
                        <Image
                          src={user.image}
                          alt={user.name || "User Avatar"}
                          fill
                          className="object-cover"
                          quality={10}
                        />
                      : <span>{user.name?.charAt(0) || "U"}</span>}
                    </div>
                    <span className="font-medium text-gray-900">
                      {user.name || "Unknown"}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === "ACTIVE" ?
                        "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                    }`}
                  >
                    {t?.(`status_${user.status.toLowerCase()}`) || user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

RecentUsersTable.displayName = "RecentUsersTable";

export default function AdminLatestUsers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 h-96 animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  return <RecentUsersTable users={data.recentUsers} />;
}
