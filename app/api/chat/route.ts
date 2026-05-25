import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";
import { messageSchema, messageType } from "../utils/messageSchema";
import { messagesPerOnce } from "@/lib/constants";
import { z } from "zod";
import { userGuard } from "@/lib/userGuards";

const anySchema = z.any();

/**
 * @method POST
 * @description Send Message (and create chat room if user dosn't have one)
 * @route /api/chatRoom
 * @access private (onlu user)
 * */
export const POST = userGuard(
  messageSchema,
  async (request: NextRequest, authUserId: string, body: messageType) => {
    try {
      // console.log("this is body in route", body);
      //تم نقل الكود الي السيرفر
      return NextResponse.json("newMessage created succesfully", {
        status: 201,
      });
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
 * @description get Message by roomId
 * @route /api/chatRoom
 * @access public
 * */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId: string | null = searchParams.get("userId");
    const messageCount: string | null = searchParams.get("messageCount") || "1";

    if (!userId) {
      return NextResponse.json(
        { Message: "please login before continue" },
        { status: 401 },
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        chatRoomId: userId,
      },
      take: messagesPerOnce,
      skip: (+messageCount - 1) * messagesPerOnce,
      orderBy: {
        createdAt: "desc", // ضروري جدا عشان الفهرسه تشتغل
      },
      select: {
        id: true,
        message: true,
        userId: true, // بنجيب الـ userId هنا عشان الفرونت إند يعرف يفرق بين رسايلك ورسايل الأدمن (يمين وشمال)
        isRead: true,
        isDelivered: true,
        createdAt: true,
      },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    return NextResponse.json(
      { Message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
/**
 * @method PATCH
 * @description Mark message inChat (isRead = true)
 * @route /api/chat
 * @access priveta (only user and admin)
 * */
export const PATCH = userGuard(
  anySchema,
  async (request: NextRequest, authUserId: string, data: any) => {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId"); // ضروري عشان نتأكد إن الإشعار يخص اليوزر ده

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 },
      );
    }

    // console.log("patch");
    try {
      //  chatRoomId: userId, isRead: false, NOT: { userId: userId }
      await prisma.message.updateMany({
        where: {
          OR: [
            { chatRoomId: userId, isRead: false, NOT: { userId: authUserId } },
            // { isRead: false },
          ],
        },
        data: { isRead: true },
      });

      return NextResponse.json(
        { message: "messages marked as read" },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json(
        { message: "Error updating messages" },
        { status: 500 },
      );
    }
  },
);
