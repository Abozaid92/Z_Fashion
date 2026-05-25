import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { adminGuard } from "@/lib/userGuards";
import {
  paginationSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  deleteAnnouncementSchema,
} from "../../utils/AnnouncemntSchema";

/**
 * @method GET
 * @description get announcement-bar notification
 * @route /api/notification/announcement-bar
 * @access private (only admin and visitors)
 * */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    const [bars, total] = await Promise.all([
      prisma.announcement.findMany({
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.announcement.count(),
    ]);

    return NextResponse.json({
      bars,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 },
    );
  }
}
/**
 * @method POST
 * @description creat announcement-bar notification
 * @route /api/notification/announcement-bar
 * @access private (only admin)
 * */

export const POST = adminGuard(
  createAnnouncementSchema,
  async (req, userId, validatedData) => {
    try {
      const newBar = await prisma.announcement.create({
        data: validatedData,
      });

      return NextResponse.json(newBar, { status: 201 });
    } catch (error) {
      console.error("POST Error:", error);
      return NextResponse.json(
        { error: "Failed to create announcement" },
        { status: 500 },
      );
    }
  },
);

/**
 * @method PATCH
 * @description edit announcement-bar notification
 * @route /api/notification/announcement-bar
 * @access private (only admin)
 * */

export const PATCH = adminGuard(
  updateAnnouncementSchema,
  async (req, userId, { id, ...updateData }) => {
    try {
      const updatedBar = await prisma.announcement.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json(updatedBar);
    } catch (error) {
      console.error("PATCH Error:", error);
      return NextResponse.json(
        { error: "Failed to update announcement" },
        { status: 500 },
      );
    }
  },
);
/**
 * @method DELETE
 * @description Delete announcement-bar notification
 * @route /api/notification/announcement-bar
 * @access private (only admin)
 * */
// DELETE: حذف إعلان
export const DELETE = adminGuard(
  deleteAnnouncementSchema,
  async (req, userId) => {
    try {
      // 1. استخراج الـ id من الـ Search Params (URL)
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

      // 2. عمل Validation يدوي أو التأكد من الـ id قبل الحذف
      // ملاحظة: الـ adminGuard عادة بياخد الداتا من الـ body،
      // فلو الـ guard مش مهيأ للـ query params، بنعمل parse هنا:
      const validated = deleteAnnouncementSchema.parse({ id });

      await prisma.announcement.delete({
        where: { id: validated.id },
      });

      return NextResponse.json({
        message: "Announcement deleted successfully",
      });
    } catch (error) {
      console.error("DELETE Error:", error);

      // لو الـ error سببه إن الـ ID مش موجود في الداتا بيز
      if ((error as any).code === "P2025") {
        return NextResponse.json(
          { error: "Announcement not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { error: "Failed to delete announcement" },
        { status: 500 },
      );
    }
  },
);
