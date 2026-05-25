import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/auth";
/**
 * @method POST
 * @description add  product to favorite
 * @route /api/products/favorite
 * @access private (only user and admin ('_') )
 * */

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session?.user.id) {
      return NextResponse.json({ message: "access denied" }, { status: 401 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { message: "ProductId is required" },
        { status: 400 },
      );
    }

    const productIdString = String(productId);

    const checkfavorite = await prisma?.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productIdString,
        },
      },
    });

    if (checkfavorite) {
      await prisma.favorite.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: productIdString,
          },
        },
      });
    } else {
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          productId: productIdString,
        },
      });
    }

    return NextResponse.json(
      { message: "change saved successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Server Error", error: String(error) },
      { status: 500 },
    );
  }
}
