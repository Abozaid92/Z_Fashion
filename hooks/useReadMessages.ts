import { readMessages } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
import {
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import { SupportTicket } from "@/app/[locale]/_types";

interface RawMessage {
  id: string;
  message: string;
  userId: string;
  isRead: boolean;
  createdAt: string;
  isMessageSent?: boolean;
}

export interface typeMutaion {
  userId: string;
  roomId: string;
}

type ChatCache = InfiniteData<SupportTicket[], number>;
type MessagesCache = InfiniteData<RawMessage[], number>;

const useReadMessages = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ userId }: typeMutaion) => {
      return readMessages(userId);
    },

    onMutate: async ({ userId, roomId }) => {
      // ── snapshot ──────────────────────────────────────────────────────────
      const prevMessages = queryClient.getQueryData<MessagesCache>([
        "messages",
        userId,
      ]);
      const prevChatRooms = queryClient.getQueryData<ChatCache>(["chatRooms"]);

      // ── 1. messages cache → كل الرسايل isRead: true ──────────────────────
      queryClient.setQueryData<MessagesCache>(["messages", userId], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((msg) => ({ ...msg, isRead: true })),
          ),
        };
      });

      // ── 2. chatRooms cache → صفّر العداد والـ isRead للروم دي ─────────────
      queryClient.setQueryData<ChatCache>(["chatRooms"], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((room) =>
              room.id !== roomId ?
                room
              : {
                  ...room,
                  _count: { messages: 0 },
                  messages: room.messages.map((msg) => ({
                    ...msg,
                    isRead: true,
                  })),
                },
            ),
          ),
        };
      });

      return { prevMessages, prevChatRooms };
    },

    onError: (err, { userId }, context) => {
      queryClient.setQueryData(["messages", userId], context?.prevMessages);
      queryClient.setQueryData(["chatRooms"], context?.prevChatRooms);
      toast.error("failed to update messages");
      console.error(err);
    },
  });

  return mutation;
};

export default useReadMessages;
