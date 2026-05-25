import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/db";
import { userGuard } from "@/lib/userGuards";

const schema = z.object({});

export const GET = userGuard(schema, async (request, userId, data) => {
  try {
    const cart = await prisma.cart.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            price: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        data: cart,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch cart",
      },
      {
        status: 500,
      },
    );
  }
});
