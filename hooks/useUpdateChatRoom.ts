import { QueryClient, InfiniteData } from "@tanstack/react-query";
import { SupportTicket } from "@/app/[locale]/_types";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SocketMessagePayload {
  id: string; // message ID — for dedup check
  message: string;
  roomId: string;
  sender: string;
  senderImage: string;
  userId: string;
}

// messages[0] في الـ API مفيهاش id، بس محتاجينها للـ dedup
// لو الـ API بعتها في المستقبل هتشتغل أوتوماتيك
interface RoomMessage {
  id?: string;
  message: string;
  isRead: boolean;
}

type ChatCache = InfiniteData<SupportTicket[], number>;

// ─────────────────────────────────────────────────────────────────────────────
// updateChatCache
// ─────────────────────────────────────────────────────────────────────────────

export function updateChatCache(
  queryClient: QueryClient,
  payload: SocketMessagePayload,
  selectedId: string | null,
): void {
  queryClient.setQueryData<ChatCache>(["chatRooms"], (old) => {
    if (!old) return old;

    const now = new Date().toISOString();
    const shouldIncrementCount = selectedId !== payload.roomId;

    let targetRoom: SupportTicket | null = null;
    let isDuplicate = false;

    // ── Single pass ──────────────────────────────────────────────────────────
    // بنمشي على كل الـ pages مرة واحدة:
    // - لو لقينا الروم → نشيلها من مكانها (return false) ونحفظها في targetRoom
    // - لو الرسالة duplicate → نرجع old كما هو
    const pagesWithoutTarget = old.pages.map((page) =>
      page.filter((room) => {
        if (room.id !== payload.roomId) return true;

        // Dedup guard
        if ((room?.messages[0] as RoomMessage)?.id === payload.id) {
          isDuplicate = true;
          return true; // سيبها في مكانها
        }

        // بناء الروم المحدثة — immutable
        targetRoom = {
          ...room,
          updatedAt: now,
          messages: [{ message: payload.message, isRead: false } as any],
          _count: {
            messages:
              shouldIncrementCount ?
                room._count.messages + 1
              : room._count.messages,
          },
        };

        return false; // اشيلها من مكانها عشان تتحط فوق
      }),
    );

    // Duplicate → مفيش تغيير
    if (isDuplicate) return old;

    // لو الروم موجودة → targetRoom فيها النسخة المحدثة
    // لو روم جديدة → نعمل mock كامل من الـ payload
    // const roomToPrepend: SupportTicket = targetRoom ?? {
    const roomToPrepend: any = targetRoom ?? {
      id: payload.roomId,
      createdAt: now,
      updatedAt: now,
      userId: payload.userId as any,
      user: {
        name: payload.sender,
        image: payload.senderImage,
      },
      messages: [{ message: payload.message, isRead: false }],
      _count: { messages: shouldIncrementCount ? 1 : 0 },
    };

    // ── Move-to-top + immutable return ───────────────────────────────────────
    return {
      ...old,
      pages: [
        [roomToPrepend, ...(pagesWithoutTarget[0] ?? [])],
        ...pagesWithoutTarget.slice(1),
      ],
    };
  });
}
