import { adminGuard } from "@/lib/userGuards";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import prisma from "@/lib/db";
/**
 * @method GET
 * @description get notification
 * @route /api/notification/stats
 * @access private (only admin and visitor)
 * */
const schema = z.object({});

export async function GET(request: NextRequest) {
  try {
    const stats = await prisma?.globalNotifications.aggregate({
      _sum: {
        targetUsers: true,
        opens_count: true,
      },
    });

    const totalTargets = stats?._sum?.targetUsers || 0;
    const totalOpens = stats?._sum?.opens_count || 0;

    const globalOpenRate =
      totalTargets > 0 ? ((totalOpens / totalTargets) * 100).toFixed(1) : "0";

    return NextResponse.json(
      {
        totalTargets,
        totalOpens,
        globalOpenRate: globalOpenRate,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 },
    );
  }
}
