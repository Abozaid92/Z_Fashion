import { NextResponse, NextRequest } from "next/server";
import { adminGuard } from "@/lib/userGuards";
import { getChatRoomSchema } from "../../utils/chatRoomSchema";
import prisma from "@/lib/db";
import { chatRoomPerPage } from "@/lib/constants";
/**
 * @method GET
 * @description get chatRooms
 * @route /api/chat/chatRoom
 * @access private (only admin  and visitors )
 * */

export async function GET(request: NextRequest) {
  try {
    const chatRoomNumber =
      request.nextUrl.searchParams.get("chatRoomNumber") || 1;

    // مناداة الفانكشن اللي بتجيب البيانات
    const chatRooms = await getChatRoom(+chatRoomNumber);

    return NextResponse.json(chatRooms, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error Get ChatRooms " },
      { status: 500 },
    );
  }
}

const getChatRoom = async (chatRoomNumber: number) => {
  const chatRooms = await prisma.chatRoom.findMany({
    take: chatRoomPerPage,
    skip: chatRoomPerPage * (chatRoomNumber - 1),
    include: {
      user: {
        select: {
          image: true,
          name: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: { isRead: false },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,

        select: {
          isRead: true,
          message: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return chatRooms;
};
