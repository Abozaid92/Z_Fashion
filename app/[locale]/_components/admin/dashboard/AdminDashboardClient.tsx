"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import AdminStats from "./AdminStats";
import AdminCharts from "./AdminCharts";

import AdminLatestOrders from "./AdminLatestOrders";
import AdminLatestUsers from "./AdminLatestUsers";
import AdminGeography from "./AdminGeography";

export default function AdminDashboardClient() {
  const t = useTranslations("AdminDashboardClient" as any);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {t("title")}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{t("welcome")}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>{t("live")}</span>
            </div>
          </div>
        </div>
      </header>

      {/* <main className="max-w-7xl mx-auto p-8 space-y-8"> */}
      {/* Stats Section */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <AdminStats />
      </Suspense>

      {/* Charts Section */}
      <Suspense fallback={<ChartsLoadingSkeleton />}>
        <AdminCharts />
      </Suspense>

      {/* Geography Section */}
      <Suspense fallback={<GeographyLoadingSkeleton />}>
        <AdminGeography />
      </Suspense>

      {/* Latest Data Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<TableLoadingSkeleton />}>
          <AdminLatestUsers />
        </Suspense>
        <Suspense fallback={<TableLoadingSkeleton />}>
          <AdminLatestOrders />
        </Suspense>
      </section>
      {/* </main> */}
    </div>
  );
}

// Loading Skeletons
function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 h-36"></div>
      ))}
    </div>
  );
}

function ChartsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 h-96"></div>
      ))}
    </div>
  );
}

function GeographyLoadingSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 h-96 animate-pulse">
      <div className="w-full h-full bg-gray-100 rounded-lg"></div>
    </div>
  );
}

function TableLoadingSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 h-96 animate-pulse">
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded"></div>
        ))}
      </div>
    </div>
  );
}
