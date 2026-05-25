// app/admin/users/_components/UsersStats.tsx
"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Ban } from "lucide-react";
import axios from "axios";
import { DOMAIN } from "@/lib/constants";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div
      className={`${bg} rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-3`}
    >
      <span
        className={`flex size-9 items-center justify-center rounded-lg bg-white/80 shadow-sm ${color}`}
      >
        <Icon size={16} />
      </span>
      <div>
        <p className="text-[11px] text-slate-500 font-medium">{label}</p>
        <p className={`text-lg font-bold font-display ${color}`}>{value}</p>
      </div>
    </div>
  );
}

export default function UsersStats() {
  const { data: rawData, isLoading } = useQuery({
    queryKey: ["users-stats"],
    queryFn: async () => {
      const res = await axios.get(`${DOMAIN}/api/users/stats`);
      return res.data; // دي المصفوفة اللي شفناها في الـ Console
    },
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // --- الحل هنا: بنحول المصفوفة لـ Object عشان نعرف نطلع القيم بسهولة ---
  const stats = (rawData || []).reduce((acc: any, item: any) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {});

  // دلوقتي تقدر تقرأ القيم صح
  const activeCount = stats["ACTIVE"] || 0;
  const bannedCount = stats["BANNED"] || 0;
  const totalCount = activeCount + bannedCount;

  if (isLoading) {
    // ... الـ loading زي ما هو
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatCard
        label="Total Users"
        value={totalCount}
        icon={Users}
        color="text-slate-700"
        bg="bg-slate-50" // غيرتها لـ slate عشان تليق مع الـ Total
      />
      <StatCard
        label="Active Users"
        value={activeCount}
        icon={UserCheck}
        color="text-emerald-600"
        bg="bg-emerald-50"
      />
      <StatCard
        label="Banned Users"
        value={bannedCount}
        icon={Ban}
        color="text-red-500"
        bg="bg-red-50"
      />
    </div>
  );
}
