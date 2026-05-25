import { fetchMessages } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import { isDeleverdType } from "@/app/[locale]/utils/messagesType";

// 1. النوع الخام من الـ API
interface RawMessage {
  id: string;
  message: string;
  userId: string;
  isRead: boolean;
  isDelivered?: boolean;
  isDelevired?: isDeleverdType;
  createdAt: string;
  isMessageSent?: boolean;
}

// 2. النوع النهائي للـ UI
interface UI_MessageType {
  id: string;
  message: string;
  isRead: boolean;
  isDelevired: boolean | undefined;
  userId: string;
  sender: "user" | "admin";
  createdAt: Date;
  isMessageSent: boolean;
}

const useGetMessages = (userId: string, adminId: string = "") => {
  // هنا التعديل: شيلنا الـ Generic الرابع عشان يبقوا 5 بس
  return useInfiniteQuery<
    RawMessage[], // 1. TQueryFnData
    Error, // 2. TError
    UI_MessageType[], // 3. TData (النوع اللي الـ select هيرجعه)
    [string, string], // 4. TQueryKey
    number // 5. TPageParam
  >({
    queryKey: ["messages", userId],
    queryFn: ({ pageParam }) => fetchMessages(userId, pageParam),

    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },

    select: (data: InfiniteData<RawMessage[], number>): UI_MessageType[] => {
      // المنطق بتاعك "لم يمس" نهائياً
      return data.pages.flatMap((page) =>
        page.map((el) => ({
          id: el.id,
          message: el.message,
          isRead: el.isRead,
          isDelevired: el.isDelevired?.isDeliverd,
          userId: el.userId,
          sender:
            adminId ?
              el.userId === adminId ?
                "user"
              : "admin"
            : el.userId === userId ? "user"
            : "admin",
          createdAt: new Date(el.createdAt),
          isMessageSent: el.isMessageSent !== false,
        })),
      );
    },

    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: !!userId,
  });
};

export default useGetMessages;
