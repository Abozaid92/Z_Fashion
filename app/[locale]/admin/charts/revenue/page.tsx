// app/charts/revenue/page.tsx
import { Suspense } from "react";

import { AnalyticType } from "@prisma/client";
import {
  getAnalytics,
  getPreviousPeriodData,
} from "@/app/[locale]/_lib/analytics-queries";
import { RevenueContent } from "./revenue-content";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { pickMessages } from "@/lib/i18n-utils";
import getQueryClient from "@/lib/getQueryClient";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    timeframe?: "7days" | "30days" | "90days" | "thisYear" | "custom";
    from?: string;
    to?: string;
  }>;
}

// 2. عدل السطر ده وخليه بسيط كدة
export default async function RevenuePage({ searchParams, params }: PageProps) {
  const queryClient = getQueryClient();

  // فك الصناديق هنا (الـ Promises)
  const { locale } = await params; // لازم await للـ params كمان ✅
  const sp = await searchParams; // ودي أنت عاملها صح ✅
  const timeframe = sp.timeframe || "30days";

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["analytics", "REVENUE", timeframe],
      queryFn: () => getAnalytics({ type: AnalyticType.REVENUE, timeframe }),
    }),
    queryClient.prefetchQuery({
      queryKey: ["analytics", "REVENUE", "previous", timeframe],
      queryFn: () =>
        getPreviousPeriodData({ type: AnalyticType.REVENUE, timeframe }),
    }),
  ]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={pickMessages(await getMessages(locale as any), [
        "AdminCharts",
        "AdminStatsCards",
        "AdminInsightsPanel",
        "ExportButton",
        "EmptyState",
        "TimeframeSelector",
        "ComparisonToggle",
      ])}
    >
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-8 animate-pulse" />
        }
      >
        <RevenueContent />
      </Suspense>
    </NextIntlClientProvider>
  );
}

export const metadata = {
  title: "Revenue Analytics | Dashboard",
  description: "Track revenue performance and trends",
};
