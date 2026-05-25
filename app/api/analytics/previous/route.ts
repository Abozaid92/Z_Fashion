// app/api/analytics/previous/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AnalyticType } from "@prisma/client";
import { getPreviousPeriodData } from "@/app/[locale]/_lib/analytics-queries";
const querySchema = z.object({
  type: z.nativeEnum(AnalyticType),
  timeframe: z
    .enum(["7days", "30days", "90days", "thisYear", "custom"])
    .default("30days"),
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      type: searchParams.get("type"),
      timeframe: searchParams.get("timeframe") || "30days",
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    };

    const validatedData = querySchema.parse(params);
    const data = await getPreviousPeriodData(validatedData);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Previous analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch previous period data" },
      { status: 500 },
    );
  }
}
