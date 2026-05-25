// app/charts/net-profit/page.tsx
import { Suspense } from "react";

import { AnalyticType } from "@prisma/client";
import {
  getAnalytics,
  getPreviousPeriodData,
} from "@/app/[locale]/_lib/analytics-queries";
import { NetProfitContent } from "./net-profit-content";
import getQueryClient from "@/lib/getQueryClient";

interface PageProps {
  // لازم تضيف دي عشان الـ TypeScript يقتنع إن الـ Type مطابق لمواصفات Next 15
  params: Promise<{ locale: string }>;

  searchParams: Promise<{
    timeframe?: "7days" | "30days" | "90days" | "thisYear" | "custom";
    from?: string;
    to?: string;
  }>;
}

// ضيف params هنا في الـ Arguments
export default async function NetProfitPage({
  params,
  searchParams,
}: PageProps) {
  // فك الـ Promises
  const { locale } = await params; // فكيناها حتى لو مش هنستخدمها دلوقتي
  const sParams = await searchParams;

  const timeframe = sParams.timeframe || "30days";
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["analytics", "NET_PROFIT", timeframe],
      queryFn: () => getAnalytics({ type: AnalyticType.NET_PROFIT, timeframe }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["analytics", "NET_PROFIT", "previous", timeframe],
      queryFn: () =>
        getPreviousPeriodData({ type: AnalyticType.NET_PROFIT, timeframe }),
    }),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-emerald-50 p-8 animate-pulse" />
      }
    >
      <NetProfitContent />
    </Suspense>
  );
}

export const metadata = {
  title: "Net Profit Analytics | Dashboard",
  description: "Track net profit margins and profitability",
};
