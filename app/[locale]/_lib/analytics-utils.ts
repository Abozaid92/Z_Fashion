// lib/analytics-utils.ts
import {
  AnalyticsDataPoint,
  ChartDataPoint,
  InsightItem,
} from "@/app/[locale]/_lib/analytics";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function calculateMovingAverage(
  data: AnalyticsDataPoint[],
  window: number = 7,
): ChartDataPoint[] {
  return data.map((point, index) => {
    if (index < window - 1) return { ...point };

    const slice = data.slice(index - window + 1, index + 1);
    const avg = slice.reduce((sum, p) => sum + p.value, 0) / window;

    return {
      ...point,
      movingAverage: Math.round(avg),
    };
  });
}

export function findPeaks(data: AnalyticsDataPoint[]): {
  max: AnalyticsDataPoint;
  min: AnalyticsDataPoint;
} {
  const max = data.reduce((prev, current) =>
    current.value > prev.value ? current : prev,
  );
  const min = data.reduce((prev, current) =>
    current.value < prev.value ? current : prev,
  );

  return { max, min };
}

export function generateInsights(
  data: AnalyticsDataPoint[],
  meta: { total: number; percentageChange: number },
): InsightItem[] {
  const insights: InsightItem[] = [];
  const { max, min } = findPeaks(data);

  // Peak day insight
  insights.push({
    label: "Highest Day",
    value: `${new Date(max.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} (${formatNumber(max.value)})`,
    type: "positive",
  });

  // Lowest day insight
  insights.push({
    label: "Lowest Day",
    value: `${new Date(min.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} (${formatNumber(min.value)})`,
    type: "negative",
  });

  // Average
  const avg = data.reduce((sum, p) => sum + p.value, 0) / data.length;
  insights.push({
    label: "Daily Average",
    value: formatNumber(Math.round(avg)),
    type: "neutral",
  });

  // Trend
  insights.push({
    label: "Overall Trend",
    value: `${formatPercentage(meta.percentageChange)} vs previous period`,
    type: meta.percentageChange >= 0 ? "positive" : "negative",
  });

  // Volatility
  const variance =
    data.reduce((sum, p) => sum + Math.pow(p.value - avg, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  const volatility = (stdDev / avg) * 100;

  insights.push({
    label: "Volatility",
    value: `${volatility.toFixed(1)}% coefficient`,
    type:
      volatility > 30 ? "negative"
      : volatility > 15 ? "neutral"
      : "positive",
  });

  return insights;
}

export function exportToCSV(data: AnalyticsDataPoint[], filename: string) {
  const headers = ["Date", "Value"];
  const rows = data.map((item) => [item.date, item.value]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function aggregateByWeek(data: AnalyticsDataPoint[]): ChartDataPoint[] {
  const weeks = new Map<string, number>();

  data.forEach((point) => {
    const date = new Date(point.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    weeks.set(weekKey, (weeks.get(weekKey) || 0) + point.value);
  });

  return Array.from(weeks.entries()).map(([date, value]) => ({
    date,
    value,
  }));
}
