// app/charts/complaints/page.tsx
import { Suspense } from "react";

import { AnalyticType } from "@prisma/client";
import {
  getAnalytics,
  getPreviousPeriodData,
} from "@/app/[locale]/_lib/analytics-queries";
import { ComplaintsContent } from "./complaints-content";
import getQueryClient from "@/lib/getQueryClient";

interface PageProps {
  params: Promise<{ locale: string }>; // ضيف دي كمان للاحتياط
  searchParams: Promise<{
    timeframe?: "7days" | "30days" | "90days" | "thisYear" | "custom";
    from?: string;
    to?: string;
  }>;
}

export default async function ComplaintsPage({
  params,
  searchParams,
}: PageProps) {
  const { timeframe: rawTimeframe } = await searchParams;
  const timeframe = rawTimeframe || "30days";
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["analytics", "COMPLAINTS", timeframe],
      queryFn: () => getAnalytics({ type: AnalyticType.COMPLAINTS, timeframe }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["analytics", "COMPLAINTS", "previous", timeframe],
      queryFn: () =>
        getPreviousPeriodData({ type: AnalyticType.COMPLAINTS, timeframe }),
    }),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-red-50 p-8 animate-pulse" />
      }
    >
      <ComplaintsContent />
    </Suspense>
  );
}

export const metadata = {
  title: "Complaints Analytics | Dashboard",
  description: "Track and analyze customer complaints",
};
