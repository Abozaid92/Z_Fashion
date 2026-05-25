// types/product-analytics.ts
export interface RedisLeaderboardItem {
  slug: string;
  totalScore: number;
}

export interface DailyTrendItem {
  date: string;
  cart: number;
  purchase: number;
}

export interface ProductAnalyticsByDayRaw {
  id: number;
  productSlug: string;
  type: "CART" | "PURCHASE";
  count: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AllTimeStats {
  topCart: RedisLeaderboardItem[];
  topPurchased: RedisLeaderboardItem[];
}

export interface ProductAnalyticsData {
  allTimeStats: AllTimeStats;
  dailyTrends: DailyTrendItem[];
  rawDailyData: ProductAnalyticsByDayRaw[];
}

export interface ProductAnalyticsResponse {
  success: boolean;
  data: ProductAnalyticsData;
}
