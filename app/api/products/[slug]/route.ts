import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import z from "zod";
/**
 * @method Get
 * @description GET product by slug
 * @route /api/products/[slug]
 * @access public
 * */
// await prisma.product.createMany({
// data :
// })
export async function GET(
  request: NextRequest,

  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
      },
      include: {
        favorite: {
          select: {
            userId: true,
          },
        },
      },
    });
    if (!product) {
      return NextResponse.json(
        { message: "product not fount" },
        { status: 404 },
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid filter data", errors: error.errors },
        { status: 400 },
      );
    }

    console.error("Database Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
