import prisma from "@/lib/db";
import redisClient from "@/lib/redisClient";
import { AnalyticType } from "@prisma/client";

export const getStatsAndchart = async () => {
  const allAnalyticsType = await allAnaltycsTypeFilterd();

  const [
    revenue,
    orders,
    users,
    net_profit,
    totalVisits,
    visitsDistribution,
    recentUsers, // <-- الجديد
    recentOrders, // <-- الجديد
  ] = await Promise.all([
    // charts
    // revenue vs growth rate
    getGenericAnalytics(allAnalyticsType.REVENUE),
    // Orders Multi-View Analysis charts
    getGenericAnalytics(allAnalyticsType.ORDERS),
    // Cumulative User Growth
    getGenericAnalytics(allAnalyticsType.USERS),
    // Profit Volatility Analysis
    getGenericAnalytics(allAnalyticsType.NET_PROFIT),
    getTotalVisitsAnaltiycs(),
    // circle pie
    getAllVisitsAnaltiycs(),
    // Recent Data (أحدث 8 مستخدمين وأوردرات)
    getRecentUsers(), // <-- الجديد
    getRecentOrders(), // <-- الجديد
  ]);

  return {
    revenue,
    orders,
    users,
    net_profit,
    visits: {
      ...totalVisits,
      distribution: visitsDistribution,
    },
    recentUsers, // <-- الجديد
    recentOrders, // <-- الجديد
  };
};

// --- Helper Functions ---

const allAnaltycsTypeFilterd = async (): Promise<
  Record<AnalyticType, string>
> => {
  const allAnalyticsType = await prisma.chartAnalytics.findMany({
    select: { id: true, nameAnalytics: true },
  });
  return Object.fromEntries(
    allAnalyticsType.map((el) => [el.nameAnalytics, el.id]),
  ) as Record<AnalyticType, string>;
};

const getGenericAnalytics = async (idAnalytics: string) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  // بداية الأسبوع اللي قبل الشهر (يعني من 37 يوم فاتوا)
  const previousStartDate = new Date(now.getTime() - 37 * 24 * 60 * 60 * 1000);
  const rawData = await prisma.chartAnalyticsByday.findMany({
    where: {
      chartAnalyticsByMonth: { chartAnalyticsId: idAnalytics },
      createdAt: { gte: previousStartDate, lte: now },
    },
    select: { totalAnalytics: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const currentWeek = rawData.filter((d) => d.createdAt >= startDate);
  const previousWeek = rawData.filter((d) => d.createdAt < startDate);

  const currentTotal = currentWeek.reduce(
    (sum, item) => sum + item.totalAnalytics,
    0,
  );
  const previousTotal = previousWeek.reduce(
    (sum, item) => sum + item.totalAnalytics,
    0,
  );

  let percentage = 0;
  if (previousTotal > 0) {
    percentage = ((currentTotal - previousTotal) / previousTotal) * 100;
  } else if (currentTotal > 0) {
    percentage = 100;
  }

  const chartData = currentWeek.map((item) => ({
    day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
      new Date(item.createdAt),
    ),
    value: item.totalAnalytics,
  }));

  return {
    card: {
      total: currentTotal,
      percentage: Number(percentage.toFixed(2)),
      trend: percentage >= 0 ? "up" : "down",
    },
    chart: chartData,
  };
};

const getTotalVisitsAnaltiycs = async () => {
  try {
    const visitsStringFromredis = await redisClient.hGetAll(
      "stats:total:allStats",
    );
    const visitsStringFormat = visitsStringFromredis.totalVisits;

    const totalVisits =
      visitsStringFormat ? parseInt(visitsStringFormat, 10) : 0;
    return {
      card: {
        total: totalVisits,
        percentage: 0,
        trend: "up",
      },
    };
  } catch (err) {
    console.error("Redis Get Error:", err);
    return { card: { total: 0, percentage: 0, trend: "up" } };
  }
};

const getAllVisitsAnaltiycs = async () => {
  try {
    const viewStatsRaw = await prisma.analytics.findFirst();
    return [
      { name: "Home Page", value: viewStatsRaw?.homapageVisits || 0 },
      { name: "Product Page", value: viewStatsRaw?.productPageVisits || 0 },
      { name: "About Page", value: viewStatsRaw?.aboutPageVisits || 0 },
    ];
  } catch (err) {
    console.error("Prisma Analytics Error:", err);
    return [];
  }
};

const getRecentUsers = async () => {
  try {
    return await prisma.user.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        status: true, // ACTIVE أو BANNED
        createdAt: true,
      },
    });
  } catch (err) {
    console.error("Error fetching recent users:", err);
    return [];
  }
};

const getRecentOrders = async () => {
  try {
    return await prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  } catch (err) {
    console.error("Error fetching recent orders:", err);
    return [];
  }
};
