// hooks/useChatReceiver.ts
import { useEffect, useRef } from "react";
// import { getMessageDetails } from "@/app/[locale]/utils/chatFn"; // Import directly!
import { ChatHookProps, MessageSentHookProps } from "./chathookType";
import { getMessageDetails, playSoundEffect } from "./chatHookFn";
import { UserStatusHookProps } from "./chathookType";
import { TypingStatusHookProps } from "./chathookType";
import { TypingAudioTone } from "@/app/[locale]/utils/chatAudios";
import { InfiniteScrollHookProps } from "./chathookType";

import {
  recievedAudioTone,
  sentAudioTone,
} from "@/app/[locale]/utils/chatAudios";
import useReadMessages from "../useReadMessages";
import { MessageType } from "@/app/[locale]/utils/messagesType";

// --- infinte scroll for pagination message

export const useInfiniteScroll = ({
  targetRef,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  scrollS,
}: InfiniteScrollHookProps) => {
  useEffect(() => {
    // لو مفيش عنصر نراقبه، اخرج
    if (!targetRef.current) return;
    // console.log("after check observe");
    const observe = new IntersectionObserver(
      ([entry]) => {
        // لو العنصر ظهر في الشاشة، ومعانا داتا تانية، ومش بنحمل حالياً

        if (entry.isIntersecting && !isFetchingNextPage && hasNextPage) {
          // console.log("shuld be scroll");
          if (scrollS) scrollS("nearBy");
          fetchNextPage();
        }
      },
      { rootMargin: "50px 0px 0px 0px", threshold: 0 },
    );

    // ابدأ المراقبة
    observe.observe(targetRef.current);

    // التنظيف (مهم جداً عشان ميعملش مئات المراقبين في الخلفية)
    return () => observe.disconnect();
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    targetRef,
    scrollS,
    targetRef.current,
  ]);
};
//-- update session when it change
// hooks/useSyncRef.ts

export function useObserveSessionRef<T>(value: T) {
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}
// ------------------------------------socket hooks------------------------------
// recive message hook

export const useChatReceiver = ({
  socket,
  session,
  sessionRef,
  callSetDataInCashFn,
  scrollS,
}: ChatHookProps) => {
  const { mutate } = useReadMessages();

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data: any) => {
      // console.log("we reciceved this message", data);
      // console.log("data.userId", data.userId);
      // console.log("session", session);
      if (data.userId !== session) {
        if (!session) return;

        callSetDataInCashFn(getMessageDetails(data), "reciever");
        mutate({ userId: data.userId, roomId: data.userId });
      }
      socket.emit("is_user_in_chat", true);
      playSoundEffect(recievedAudioTone as any);

      if (scrollS) scrollS("bottom");
      // }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, session, callSetDataInCashFn, scrollS, sessionRef.current]);
};

// update message status hook
interface typeMessageSent {
  messageId: string;
  data: MessageType;
}
export const useChatMessageSent = ({
  socket,
  callupdataDataInCash,
}: MessageSentHookProps) => {
  useEffect(() => {
    if (!socket) return;

    const handleMessageSent = ({ messageId, data }: typeMessageSent) => {
      callupdataDataInCash(messageId, data);
      playSoundEffect(sentAudioTone as any);
    };

    socket.on("is_message_sent", handleMessageSent);

    return () => {
      socket.off("is_message_sent", handleMessageSent);
    };
  }, [socket, callupdataDataInCash, playSoundEffect, sentAudioTone]);
};

// send notifcation on chat icon is chat isOpen
export const useChatUserStatus = ({
  socket,
  session,
  isOpen,
}: UserStatusHookProps) => {
  useEffect(() => {
    // لو مفيش سوكيت أو سيشن، اخرج
    if (!socket || !session) return;

    socket.emit("user-status", { userId: session, isOpen: isOpen });

    return () => {
      socket.emit("user-status", { userId: session, isOpen: false });
    };
  }, [socket, session, isOpen]);
};

// type status
export const useChatTypingStatus = ({
  socket,
  setIsTyping,
}: TypingStatusHookProps) => {
  useEffect(() => {
    if (!socket) return;

    const handleTypeStatus = ({ typeStatus }: { typeStatus: string }) => {
      const isTyping = typeStatus === "Typing";
      setIsTyping(isTyping);

      if (isTyping) {
        playSoundEffect(TypingAudioTone as any);
      }
    };

    socket.on("type_status", handleTypeStatus);

    return () => {
      socket.off("type_status", handleTypeStatus);
      // بنقفل الـ user-status هنا كمان للأمان لو حابب
      socket.off("user-status");
    };
  }, [socket, setIsTyping]);
};

interface joinToRoomHook {
  socket: any;
  userId: string;
}

// الـ Ref ده هيفضل عايش طول ما الـ Component ده "موجود"
// وعشان نضمن إنه ما يصفرش، هنخزن فيه Map
/*
بص يا حمصه  رياكت لما تعمل ريندر بتشوف كل الريف الي متخزنه جواها 
لما رياكت تلاقي قيمه الريف عباره عن ماب هتعرف انها متغيرتش ومش هتعمل واحده جديده
*/
const socketRegistry = new Map<string, string>();
export const useJoinToRoom = ({
  socket,
  userId,
}: {
  socket: any;
  userId: string;
}) => {
  useEffect(() => {
    if (!socket || !userId || !socket.id) return;

    const currentSocketId = socket.id;
    const lastRoomForThisSocket = socketRegistry.get(currentSocketId);

    // 1. لو السوكيت ده دخل الأوضة دي قبل كدة.. "فرمل" ومتحركش
    if (lastRoomForThisSocket === userId) {
      return;
    }

    // 2. لو كان في أوضة تانية لنفس السوكيت، اخرج منها
    if (lastRoomForThisSocket && lastRoomForThisSocket !== userId) {
      console.log(
        "🧹 Cleaning up old room for this socket:",
        lastRoomForThisSocket,
      );
      socket.emit("leaveRoom", lastRoomForThisSocket);
    }

    // 3. ادخل الأوضة الجديدة
    // console.log("🎯 Joining room:", userId);
    socket.emit("join_Room_connection", userId);
    socket.emit("roomId", userId);

    // 4. سجل في الـ "دفتر" بتاعك
    socketRegistry.set(currentSocketId, userId);

    // مفيش Cleanup هنا يطردك (هنسيب السيرفر ينضف وراك أو الـ Map تغيرها)
  }, [socket, userId]); // شيلنا الـ currentRoomRef من الـ dependencies عشان ما يكررش نفسه
};
