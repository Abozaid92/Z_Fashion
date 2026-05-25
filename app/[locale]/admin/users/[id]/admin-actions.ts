"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const notificationSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
});

const statusSchema = z.object({
  userId: z.string().min(1),
  newStatus: z.enum(["ACTIVE", "BANNED"]),
});

export async function sendNotificationAction(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, message: "Unauthorized" };
    }

    const rawData = {
      userId: formData.get("userId") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
    };

    const validData = notificationSchema.parse(rawData);

    await prisma.notification.create({
      data: {
        userId: validData.userId,
        title: validData.title,
        description: validData.description,
        Sender: "ADMIN",
        senderName: session.user.name || "Admin",
        senderImage: session.user.image || null,
      },
    });

    revalidatePath(`/admin/users/${validData.userId}`);
    return { success: true, message: "Notification sent successfully" };
  } catch (error) {
    console.error("Send notification error:", error);
    return { success: false, message: "Failed to send notification" };
  }
}

export async function toggleUserStatusAction(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return { success: false, message: "Unauthorized" };
    }

    const rawData = {
      userId: formData.get("userId") as string,
      newStatus: formData.get("newStatus") as "ACTIVE" | "BANNED",
    };

    const validData = statusSchema.parse(rawData);

    await prisma.user.update({
      where: { id: validData.userId },
      data: { status: validData.newStatus },
    });

    revalidatePath(`/admin/users/${validData.userId}`);
    revalidatePath("/admin/users");

    return {
      success: true,
      message: `User ${validData.newStatus === "BANNED" ? "banned" : "activated"} successfully`,
    };
  } catch (error) {
    console.error("Toggle status error:", error);
    return { success: false, message: "Failed to update user status" };
  }
}
