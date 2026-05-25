// lib/analytics-queries.ts
import { AnalyticType } from "@prisma/client";
import prisma from "@/lib/db";
import { AnalyticsResponse } from "./analytics";

type Timeframe = "7days" | "30days" | "90days" | "thisYear" | "custom";

interface GetAnalyticsParams {
  type: AnalyticType;
  timeframe?: Timeframe;
  from?: string;
  to?: string;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
};

export async function getAnalytics({
  type,
  timeframe = "30days",
  from,
  to,
}: GetAnalyticsParams): Promise<AnalyticsResponse> {
  let startDate = new Date();
  let endDate = new Date();

  // 1. Determine current period
  switch (timeframe) {
    case "7days":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30days":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90days":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "thisYear":
      startDate = new Date(startDate.getFullYear(), 0, 1);
      break;
    case "custom":
      if (from && to) {
        startDate = new Date(from);
        endDate = new Date(to);
      }
      break;
  }

  // 2. Determine previous period
  const durationInMs = endDate.getTime() - startDate.getTime();
  const previousStartDate = new Date(startDate.getTime() - durationInMs);
  const previousEndDate = new Date(startDate.getTime());

  // 3. Fetch data
  const [currentPeriodData, previousPeriodData] = await Promise.all([
    prisma.chartAnalyticsByday.findMany({
      where: {
        chartAnalyticsByMonth: { chartAnalytics: { nameAnalytics: type } },
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { totalAnalytics: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    // this code will use in admin hompage Dashboard
    prisma.chartAnalyticsByday.aggregate({
      _sum: { totalAnalytics: true },
      where: {
        chartAnalyticsByMonth: { chartAnalytics: { nameAnalytics: type } },
        createdAt: { gte: previousStartDate, lt: previousEndDate },
      },
    }),
  ]);

  const analyticsMap = new Map(
    currentPeriodData.map((item) => [
      formatDate(item.createdAt),
      item.totalAnalytics,
    ]),
  );

  // 4. Fill gaps
  const formattedData = [];
  let currentTotal = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateString = formatDate(d);
    const value = analyticsMap.get(dateString) || 0;
    currentTotal += value;

    formattedData.push({
      date: dateString,
      value: value,
    });
  }

  // 5. Calculate percentage change
  const previousTotal = previousPeriodData._sum.totalAnalytics || 0;
  let percentageChange = 0;

  if (previousTotal === 0) {
    percentageChange = currentTotal > 0 ? 100 : 0;
  } else {
    percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
  }

  // 6. Return response
  return {
    success: true,
    data: formattedData,
    meta: {
      type,
      timeframe,
      total: currentTotal,
      percentageChange: parseFloat(percentageChange.toFixed(2)),
      trend: percentageChange >= 0 ? "up" : "down",
    },
  };
}

// Fetch previous period data for comparison
export async function getPreviousPeriodData({
  type,
  timeframe = "30days",
  from,
  to,
}: GetAnalyticsParams) {
  let startDate = new Date();
  let endDate = new Date();

  switch (timeframe) {
    case "7days":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30days":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90days":
      startDate.setDate(startDate.getDate() - 90);
      break;
    case "thisYear":
      startDate = new Date(startDate.getFullYear(), 0, 1);
      break;
    case "custom":
      if (from && to) {
        startDate = new Date(from);
        endDate = new Date(to);
      }
      break;
  }

  const durationInMs = endDate.getTime() - startDate.getTime();
  const previousStartDate = new Date(startDate.getTime() - durationInMs);
  const previousEndDate = new Date(startDate.getTime());

  const previousData = await prisma.chartAnalyticsByday.findMany({
    where: {
      chartAnalyticsByMonth: { chartAnalytics: { nameAnalytics: type } },
      createdAt: { gte: previousStartDate, lt: previousEndDate },
    },
    select: { totalAnalytics: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const analyticsMap = new Map(
    previousData.map((item) => [
      formatDate(item.createdAt),
      item.totalAnalytics,
    ]),
  );

  const formattedData = [];
  for (
    let d = new Date(previousStartDate);
    d < previousEndDate;
    d.setDate(d.getDate() + 1)
  ) {
    const dateString = formatDate(d);
    const value = analyticsMap.get(dateString) || 0;
    formattedData.push({
      date: dateString,
      value: value,
    });
  }

  return formattedData;
}
