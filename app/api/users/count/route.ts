import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { adminGuard } from "@/lib/userGuards";
import { getUsersSchema } from "../../utils/getUserSchema";

/**
 * @method GET
 * @description Get Total Count of orders (Filtered by status if provided)
 * @route /api/products/order/count
 * @access Private (Admin only)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // سحب البيانات من الـ URL مباشرة
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const whereCondition: any = {
      AND: [
        search ?
          {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
        role ? { role } : {},
        status ? { status } : {},
      ],
    };

    const userCount = await prisma.user.count({ where: whereCondition });

    return NextResponse.json(userCount, { status: 200 });
  } catch (error) {
    console.error("Error fetching users count:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
