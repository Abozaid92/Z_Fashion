import { getStatusCount } from "@/app/api/utils/createOrderSchema";
import { adminGuard } from "@/lib/userGuards";
import { NextRequest, NextResponse } from "next/server";
/**
 * @method GET
 * @description Get Status Details
 * @route /api/products/order/stats
 * @access public (only Admin)
 * */

export async function GET(request: NextRequest) {
  try {
    const statusDetails = await prisma?.order.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    return NextResponse.json(statusDetails, { status: 200 });
  } catch (error: any) {
    if (error.message === "Order not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Error updating order" },
      { status: 500 },
    );
  }
}
