// types/view-analytics.ts
export interface ViewDistribution {
  name: string;
  value: number;
}

export interface ViewAnalyticsData {
  total: number;
  distribution: ViewDistribution[];
}

export interface ViewAnalyticsResponse {
  success: boolean;
  data: ViewAnalyticsData;
}
