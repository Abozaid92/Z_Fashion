// app/charts/users/page.tsx
import { Suspense } from "react";

import { AnalyticType } from "@prisma/client";
import {
  getAnalytics,
  getPreviousPeriodData,
} from "@/app/[locale]/_lib/analytics-queries";
import { UsersContent } from "./users-content";
import getQueryClient from "@/lib/getQueryClient";

interface PageProps {
  searchParams: Promise<{
    timeframe?: "7days" | "30days" | "90days" | "thisYear" | "custom";
    from?: string;
    to?: string;
  }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const queryClient = getQueryClient();

  // استخراج الداتا بشكل آمن
  const params = await searchParams;
  const timeframe = params.timeframe || "30days";

  // Prefetch data on the server
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["analytics", "USERS", timeframe],
      queryFn: () =>
        getAnalytics({
          type: AnalyticType.USERS,
          timeframe,
          from: params.from,
          to: params.to,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["analytics", "USERS", "previous", timeframe],
      queryFn: () =>
        getPreviousPeriodData({
          type: AnalyticType.USERS,
          timeframe,
          from: params.from,
          to: params.to,
        }),
    }),
  ]);

  return (
    <Suspense fallback={<LoadingState />}>
      <UsersContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-slate-200 rounded-xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "User Analytics | Dashboard",
  description: "Comprehensive user analytics and insights",
};
