import { NextResponse } from "next/server";
import redisClient from "@/lib/redisClient";
import prisma from "@/lib/db";
export const GET = async () => {
  try {
    const allStats = await redisClient.hGetAll("stats:total:allStats");
    if (!allStats.totalProducts)
      allStats.totalProducts = String(await prisma.product.count());
    if (!allStats.totalUsers)
      allStats.totalUsers = String(await prisma.user.count());
    if (!allStats.totalComments)
      allStats.totalComments = String(await prisma.comment.count());

    return NextResponse.json(allStats, { status: 200 });
  } catch (error) {
    console.log("error from mainStats", error);
  }
};
