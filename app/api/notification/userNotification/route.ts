import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";
import { userGuard } from "@/lib/userGuards";
import {
  getNotificationSchema,
  NotificationType,
} from "../../utils/notificationSchema";
import { notificationPerPAge } from "@/lib/constants";

/**
 * @method GET
 * @description Get notification belong to user himself
 * @route /api/notification/userNotification
 * @access private (only user)
 * */

export const GET = userGuard(
  getNotificationSchema,
  async (request: NextRequest, userId, data) => {
    try {
      const notificationNumber = data.notificationsNumber || 1;
      const mediatorDate = await getUser(userId);

      const notificationsComparsions =
        await getNotificationComparsion(mediatorDate);

      if (notificationsComparsions.length > 0) {
        await insertNotificationIntoUserModel(notificationsComparsions, userId);
        await UpdateMediatorDate(userId);
      }

      const notifications = await getUserNotifications(
        notificationNumber,
        userId,
      );
      // // console.log(notificationsComparsions);
      return NextResponse.json(notifications, { status: 200 });
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

const getUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mediatorAT: true },
  });
  if (!user) throw new Error("User not found");
  return user.mediatorAT;
};

const getNotificationComparsion = async (mediatorDate: Date) => {
  return await prisma.globalNotifications.findMany({
    where: {
      createdAt: { gt: mediatorDate },
    },
  });
};

const insertNotificationIntoUserModel = async (
  notifications: any[],
  userId: string,
) => {
  await prisma.notification.createMany({
    data: notifications.map((el) => ({
      globalNotificationId: el.id,
      userId: userId,
      title: el.title,
      description: el.description,
      senderName: el.senderName,
      senderImage: el.senderImage,
    })),
    skipDuplicates: true,
  });
};

const getUserNotifications = async (
  notificationNumber: number,
  userId: string,
) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: notificationPerPAge,
    skip: notificationPerPAge * (notificationNumber - 1),
  });
};

const UpdateMediatorDate = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { mediatorAT: new Date() },
  });
};
// end Get Method --------------------------------------------

/**
 * @method PATCH
 * @description Mark notification as read (single or all)
 * @route /api/notification/userNotification?notificationId=...
 * @access private (only user)
 * */

export const PATCH = userGuard(
  getNotificationSchema,
  async (request: NextRequest, userId, data) => {
    try {
      const { searchParams } = new URL(request.url);
      const notificationId = searchParams.get("notificationId");

      if (notificationId) {
        const userNotification = await prisma.notification.update({
          where: { id: notificationId, userId: userId },
          data: { isRead: true },
          select: { globalNotificationId: true },
        });

        if (userNotification.globalNotificationId) {
          await prisma.globalNotifications.update({
            where: { id: userNotification.globalNotificationId },
            data: { opens_count: { increment: 1 } },
          });
        }
      } else {
        const notificationsToUpdate = await prisma.notification.findMany({
          where: { userId: userId, isRead: false },
          select: { id: true, globalNotificationId: true },
        });

        if (notificationsToUpdate.length > 0) {
          await prisma.notification.updateMany({
            where: { userId: userId, isRead: false },
            data: { isRead: true },
          });

          const globalIds = [
            ...new Set(
              notificationsToUpdate
                .map((n) => n.globalNotificationId)
                .filter((id): id is string => id !== null),
            ),
          ];

          if (globalIds.length > 0) {
            await prisma.globalNotifications.updateMany({
              where: { id: { in: globalIds } },
              data: { opens_count: { increment: 1 } },
            });
          }
        }
      }

      return NextResponse.json({ message: "Done" }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { message: "Error", error: (error as Error).message },
        { status: 500 },
      );
    }
  },
);

/**
 * @method DELETE
 * @description Delete notification (single or all)
 * @route /api/notification?notificationId=...
 * @access public
 * */
/**
 * @method DELETE
 * @description Delete notification (single or all read)
 * @route /api/notification/userNotification?notificationId=...
 * @access private (only user)
 */

export const DELETE = userGuard(
  getNotificationSchema, // استخدم نفس السكيما أو سكيما مخصصة لو محتاج
  async (request: NextRequest, userId) => {
    try {
      const { searchParams } = new URL(request.url);
      const notificationId = searchParams.get("notificationId");

      if (notificationId) {
        await prisma.notification.deleteMany({
          where: {
            id: notificationId,
            userId: userId,
          },
        });
      } else {
        await prisma.notification.deleteMany({
          where: {
            userId: userId,
            isRead: true,
          },
        });
      }

      return NextResponse.json(
        { message: "Notification(s) deleted successfully" },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "Error deleting notification",
          error: (error as Error).message,
        },
        { status: 500 },
      );
    }
  },
);
