import { fetchChatRooms } from "@/app/[locale]/(departments)/(main-layouts)/clothes/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { SupportTicket } from "@/app/[locale]/_types";

// تعريف شكل البيانات اللي جاية من الـ API (الـ Raw Data)
interface RawMessage {
  id: string;
  message: string;
  userId: string;
  isRead: boolean;
  createdAt: string;
  isMessageSent?: boolean;
}

const useGetchatRooms = () => {
  return useInfiniteQuery<
    RawMessage[], // نوع البيانات اللي بترجع من الـ API (مصفوفة رسايل خام)
    Error, // نوع الخطأ لو حصل
    SupportTicket[], // النوع النهائي اللي الـ select هترجعه للـ UI
    [string], // نوع الـ Query Key
    number // نوع الـ pageParam
  >({
    queryKey: ["chatRooms"],
    // التان ستاك بيبعت الـ pageParam أوتوماتيك
    queryFn: ({ pageParam }) => fetchChatRooms(pageParam),

    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      // لو الصفحة الأخيرة فيها رسايل، اطلب الصفحة اللي بعدها (ترتيبها = عدد المصفوفات الحالية)
      return lastPage.length > 0 ? allPages.length : undefined;
    },

    // // الـ InfiniteData هي النوع اللي التان ستاك بيستخدمه للكاش (pages & pageParams)
    // select: (data: InfiniteData<RawMessage[], number>) => {
    //   // flatMap بتفرد المصفوفات، وبعدين map بتحول كل رسالة لشكل الـ UI
    //   return data.pages.flatMap((page) =>
    //     page.map((el) => ({
    //       id: el.id,
    //       message: el.message, // بنحول message لـ text عشان الـ UI
    //       isRead: el.isRead,
    //       userId: el.userId,
    //       sender: el.userId === userId ? "user" : "admin",
    //       createdAt: new Date(el.createdAt),
    //       isMessageSent: el.isMessageSent !== false,
    //     })),
    //   );
    // },

    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // enabled: !!userId,
  });
};

export default useGetchatRooms;
