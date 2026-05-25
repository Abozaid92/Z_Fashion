import { getStatsAndchart } from "@/app/[locale]/admin/dashboard.actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getStatsAndchart();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
