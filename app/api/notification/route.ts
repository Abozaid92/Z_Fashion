import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  CreateGlobalNotificationSchema,
  getNotificationSchema,
  deleteNotificationSchema,
} from "../utils/notificationSchema";
import { adminGuard } from "@/lib/userGuards";
import { notificationPerPAge } from "@/lib/constants";
import { Prisma } from "@prisma/client";
import { notificationQueue } from "@/lib/notificationQueue";

async function sendPushToAllDevices(
  title: string,
  body: string,
  url?: string | undefined,
  image?: string | undefined,
) {
  try {
    const data = { title, body, url, image };
    await notificationQueue.add("send-bulk-push", data);
    return { success: true };
  } catch (error) {
    console.error("FCM_SEND_ERROR:", error);
    return { success: false, error };
  }
}

/**
 * @method POST
 * @route /api/notification
 * @access private (only admin)
 */
export const POST = adminGuard(
  CreateGlobalNotificationSchema,
  async (request: NextRequest, userId, data) => {
    // // console.log(data);
    try {
      const {
        title,
        description,
        senderName,
        senderImage,
        sender,
        notificationType,
        pushUrl,
        pushImage,
      } = data;

      const totalUsers = await prisma.user.count();

      const newNotification = await prisma.globalNotifications.create({
        data: {
          title,
          description,
          senderName,
          senderImage: senderImage?.trim() || null,
          sender,
          targetUsers: totalUsers,
          pushImage: pushImage || null,
          pushUrl: pushUrl || null,
          notificationType: notificationType,
        },
      });

      const status = { inApp: false, push: false, pushMessage: "" };

      if (notificationType.includes("IN_APP")) {
        status.inApp = true;
      }

      if (notificationType.includes("PUSH")) {
        const pushResult = await sendPushToAllDevices(
          title,
          description,
          pushUrl,
          pushImage,
        );
        if (pushResult.success) {
          status.push = true;
          status.pushMessage = "Notification Send successfully";

          // اختيارياً: تحديث الـ targetUsers بالعدد الفعلي اللي راح له بوش
          await prisma.globalNotifications.update({
            where: { id: newNotification.id },
            data: {
              targetUsers: totalUsers,
            },
          });
        }
      }
      return NextResponse.json(
        {
          message: "Notification processed successfully",
          id: newNotification.id,
          deliveryStatus: status,
        },
        { status: 201 },
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "Internal Server Error",
          error: (error as Error).message,
        },
        { status: 500 },
      );
    }
  },
);

/**
 * @method GET
 * @description get notification
 * @route /api/notification
 * @access public
 * */

export async function GET(request: NextRequest) {
  try {
    // سحب البيانات من الـ URL مباشرة بدل الـ Guard
    const { searchParams } = new URL(request.url);

    const notificationsNumber =
      Number(searchParams.get("notificationsNumber")) || 1;
    const sortBy =
      (searchParams.get("sortBy") as "opens_count" | "targetUsers") ||
      "opens_count";
    const order = (searchParams.get("order") as "asc" | "desc") || "desc";

    const skip = (notificationsNumber - 1) * notificationPerPAge;

    const orderBy: Prisma.GlobalNotificationsOrderByWithRelationInput = {
      [sortBy]: order,
    };

    const [notifications, total] = await Promise.all([
      prisma.globalNotifications.findMany({
        skip,
        take: notificationPerPAge,
        orderBy,
      }),
      prisma.globalNotifications.count(),
    ]);

    return NextResponse.json({ notifications, total });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 },
    );
  }
}
/**
 * @method DELETE
 * @description Delete global notification
 * @route /api/notification
 * @access private (only admin)
 */
export const DELETE = adminGuard(
  deleteNotificationSchema,
  async (request: NextRequest) => {
    try {
      const idParam = request.nextUrl.searchParams.get("id");

      const validation = deleteNotificationSchema.safeParse({ id: idParam });

      if (!validation.success) {
        return NextResponse.json(
          {
            message: "Validation Error",
            errors: validation.error.flatten().fieldErrors,
          },
          { status: 400 },
        );
      }

      const { id } = validation.data;
      await prisma.globalNotifications.delete({
        where: { id },
      });

      return NextResponse.json(
        { message: "Notification deleted successfully" },
        { status: 200 },
      );
    } catch (error: any) {
      // هندلة حالة إن الـ ID مش موجود أصلاً في الداتابيز (Prisma error P2025)
      if (error.code === "P2025") {
        return NextResponse.json(
          { message: "Notification not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { message: "Internal Server Error", error: error.message },
        { status: 500 },
      );
    }
  },
);
