import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { adminGuard } from "@/lib/userGuards";

// --- 1. Schemas (التحقق من البيانات) ---
const EventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).optional(),
  start: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  end: z
    .string()
    .transform((val) => new Date(val))
    .optional(),
  allDay: z.boolean().optional(),
  color: z.string().optional(),
});

// --- 2. GET: جلب الأحداث (متاح للكل) ---
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 50;
  const skip = (page - 1) * limit;

  try {
    const [events, total] = await Promise.all([
      prisma.calendarEvent.findMany({
        skip,
        take: limit,
        orderBy: { start: "asc" },
      }),
      prisma.calendarEvent.count(),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching events" },
      { status: 500 },
    );
  }
}

// --- 3. POST: إضافة حدث جديد (للمدير فقط) ---
export const POST = adminGuard(
  EventSchema.extend({
    title: z.string().min(1),
    start: z.any(),
    end: z.any(),
  }),
  async (request, userId, validatedData) => {
    const event = await prisma.calendarEvent.create({
      data: validatedData as any,
    });
    return NextResponse.json(event, { status: 201 });
  },
);

// --- 4. PATCH: تعديل حدث (للمدير فقط) ---
export const PATCH = adminGuard(
  EventSchema.extend({ id: z.string() } as any),
  async (request, userId, validatedData) => {
    const { id, ...data } = validatedData;
    const updated = await prisma.calendarEvent.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  },
);

// --- 5. DELETE: حذف حدث (للمدير فقط) ---
export const DELETE = adminGuard(
  z.object({ id: z.string() }),
  async (request, userId, { id }) => {
    await prisma.calendarEvent.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Deleted" });
  },
);
