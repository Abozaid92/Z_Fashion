// types/analytics.ts
import { AnalyticType } from "@prisma/client";

export interface AnalyticsDataPoint {
  date: string;
  value: number;
}

export interface AnalyticsMeta {
  type: AnalyticType;
  timeframe: "7days" | "30days" | "90days" | "thisYear" | "custom";
  total: number;
  percentageChange: number;
  trend: "up" | "down";
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsDataPoint[];
  meta: AnalyticsMeta;
}

export interface ChartDataPoint extends AnalyticsDataPoint {
  previousValue?: number;
}

export interface StatCard {
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down";
  icon?: React.ReactNode;
}

export interface InsightItem {
  label: string;
  value: string;
  type: "positive" | "negative" | "neutral";
}
