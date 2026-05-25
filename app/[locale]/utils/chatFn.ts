import { MessageType } from "./messagesType";
import { QueryClient } from "@tanstack/react-query";
import { sendToSocketParams } from "./chatFnTypes";
export const insideUniqueMessages = (data: MessageType[] | undefined) => {
  if (!data) return [];

  const seenIds = new Set();
  const filtered = [];

  // بنلف من الآخر للأول (عشان لو فيه تكرار، ناخد النسخة الأحدث)
  for (let i = data.length - 1; i >= 0; i--) {
    const msg = data[i];
    if (!seenIds.has(msg.id)) {
      seenIds.add(msg.id);
      filtered.push(msg);
    }
  }

  // نرجعهم لترتيبهم الأصلي
  return filtered;
};

// ── Scrolls ──────────────────────────────────
// ── Scroll to bottom ──────────────────────────────────
// utils/chatScrollUtils.ts
import { RefObject } from "react";

export type ScrollType = "bottom" | "nearBy";
type TypeScrollTo = ScrollToOptions;

export const getScrollKinds = (ref: RefObject<HTMLDivElement | null>) => {
  const container = ref.current;
  if (container) {
    const scrollBottom: TypeScrollTo = {
      top: container.scrollHeight,
      behavior: "smooth",
    };
    const scrollNearByBottom: TypeScrollTo = {
      top: container.scrollHeight + 700 - container.scrollHeight,
      behavior: "auto",
    };
    return { scrollBottom, scrollNearByBottom };
  }
  return null;
};

export const scrollToElement = (
  ref: RefObject<HTMLDivElement | null>,
  options: TypeScrollTo,
) => {
  ref.current?.scrollTo(options);
};

export const ScrollS = (
  ref: RefObject<HTMLDivElement | null>,
  type: ScrollType,
) => {
  setTimeout(() => {
    const kinds = getScrollKinds(ref);
    if (!kinds) return;

    if (type === "bottom") {
      scrollToElement(ref, kinds.scrollBottom);
    } else {
      scrollToElement(ref, kinds.scrollNearByBottom);
    }
  }, 100);
};

// arrow logic
export const handleScrollVisibility = (
  e: React.UIEvent<HTMLDivElement>,
  arrowRef: React.RefObject<HTMLElement | null>,
) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

  // حساب المسافة المتبقية للوصول للقاع
  const distanceFromBottom = scrollHeight - clientHeight - scrollTop;

  if (arrowRef.current) {
    const element = arrowRef.current;

    // إذا كانت المسافة أكبر من 10 بيكسل (اليوزر طلع لفوق)
    if (distanceFromBottom > 10) {
      element.style.opacity = "1";
      element.style.transform = "translate(-120px, -10px) scale(1)";
      element.style.pointerEvents = "auto";
    } else {
      element.style.opacity = "0";
      element.style.transform = "translate(-120px, -1px) scale(0)";
      element.style.pointerEvents = "none";
    }
  }
};

type whosType = "sender" | "reciever";
export function setDataInCash(
  queryClient: QueryClient,
  newMessage: MessageType,
  whos: whosType = "sender",
  userId: string,
) {
  // console.log("set data in cah called");
  queryClient.setQueriesData(
    { queryKey: ["messages", userId] },
    (oldData: any) => {
      if (!oldData)
        return {
          pages: [[newMessage]],
          pageParams: 1,
        };
      return setDataInQueryClient(oldData, newMessage, whos);
    },
  );
}
const setDataInQueryClient = (
  oldData: any,
  newMessage: MessageType,
  whos: whosType,
) => {
  const updatedPages = [...oldData.pages];
  const rawMessageForCache = {
    id: newMessage.id,
    message: newMessage.message,
    userId: newMessage.userId, // خليه الـ ID الحقيقي مش كلمة "admin" أو "user"
    isRead: false,
    createdAt:
      newMessage.createdAt instanceof Date ?
        newMessage.createdAt.toISOString()
      : newMessage.createdAt,
    isMessageSent: whos === "sender" ? false : true,
  };
  // add the message to the last row (newest messages)
  const lastRowIndex = 0;

  updatedPages[lastRowIndex] = [
    rawMessageForCache,
    ...updatedPages[lastRowIndex],
  ];

  return {
    ...oldData,
    pages: updatedPages,
  };
};

// send to socket logic lke emit message
export const sendtoSocketLogic = ({
  inputAreaRef,
  userId,
  socket,
  callSetDataInCashFn,
  sessionDetails,
  adminId,
  adminName,
}: sendToSocketParams) => {
  const currentValue = inputAreaRef.current?.getValue() || "";
  if (currentValue.length <= 0 || !socket) return;

  const myNewMessage = {
    id: crypto.randomUUID(),
    message: currentValue,
    userId: adminId ?? userId,
    isMessageSent: false,
    isRead: false,

    createdAt: new Date(),
  };

  callSetDataInCashFn(myNewMessage);

  inputAreaRef.current?.clear();
  const data = {
    // temp id to use it in message Status
    id: myNewMessage.id,
    userId: adminId ? adminId : userId,
    senderImage: sessionDetails?.image || undefined,
    message: currentValue,
    roomId: userId,
    sender: adminId ? adminName : sessionDetails?.name,
  };
  socket.emit("send_message", data);
  socket.emit("sent-to-global-ear", data);
};

// updataDataInCash => like update message status
export const updataDataInCash = (
  messageId: string,
  data: MessageType,
  queryClient: QueryClient,
  userId: string,
) => {
  // console.log("this is dataaaaaa", data);
  queryClient.setQueriesData(
    { queryKey: ["messages", userId] },
    (oldData: any) => {
      if (!oldData) return oldData;

      const updatedPages = [...oldData.pages];
      const lastRowIndex = 0;
      updatedPages[lastRowIndex] = updatedPages[lastRowIndex].map(
        (el: MessageType) =>
          el.id === messageId ?
            {
              ...el,
              isMessageSent: true,
              isRead: data.isRead,
              isDelevired: data?.isDelevired?.isDeliverd,
            }
          : el,
      );

      return {
        ...oldData,
        pages: updatedPages,
      };
    },
  );
};
