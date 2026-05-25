import prisma from "@/lib/db";
import redisClient from "@/lib/redisClient";
import { NextResponse } from "next/server";

import {
  DailyTrendItem,
  RedisLeaderboardItem,
} from "../../utils/analtycsPRoductSchema";
import { ProductAnalyticsByDay } from "@prisma/client";

const formatRedisData = (
  rawArray: { value: string; score: number }[],
): RedisLeaderboardItem[] => {
  return rawArray.map((item) => ({
    slug: item.value,
    totalScore: Math.floor(item.score),
  }));
};

export const GET = async () => {
  try {
    const [dailyDbData, rawAllTimeInCart, rawAllTimePurchased] =
      await Promise.all([
        prisma.productAnalyticsByDay.findMany({
          orderBy: { createdAt: "asc" },
        }),

        (async () => {
          try {
            return await redisClient.zRangeWithScores(
              "stats:leaderboardProducts:incart",
              0,
              9,
              {
                REV: true,
              },
            );
          } catch (error) {
            console.error("Redis Error (InCart):", error);
            return []; // يرجع مصفوفة فاضية لو Redis وقع
          }
        })(),

        (async () => {
          try {
            return await redisClient.zRangeWithScores(
              "stats:leaderboardProducts:inOrder",
              0,
              9,
              {
                REV: true,
              },
            );
          } catch (error) {
            console.error("Redis Error (InOrder):", error);
            return []; // يرجع مصفوفة فاضية لو Redis وقع
          }
        })(),
      ]);

    const allTimeTopCart = formatRedisData(rawAllTimeInCart);
    const allTimeTopPurchased = formatRedisData(rawAllTimePurchased);

    const dailyMap: Record<string, DailyTrendItem> = {};

    dailyDbData.forEach((record: ProductAnalyticsByDay) => {
      const dateKey = record.createdAt.toISOString().split("T")[0];

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, cart: 0, purchase: 0 };
      }

      if (record.type === "CART") {
        dailyMap[dateKey].cart += record.count;
      } else if (record.type === "PURCHASE") {
        dailyMap[dateKey].purchase += record.count;
      }
    });

    const dailyTrends = Object.values(dailyMap);

    return NextResponse.json({
      success: true,
      data: {
        allTimeStats: {
          topCart: allTimeTopCart,
          topPurchased: allTimeTopPurchased,
        },
        dailyTrends: dailyTrends,
        rawDailyData: dailyDbData,
      },
    });
  } catch (error) {
    console.error("🚨 Products Analytics API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
};
