"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { useTranslations } from "next-intl";
import useGetMessages from "@/hooks/useGetMessage";
import InputArea, { InputAreaHandle } from "@/components/chat/InputArea";
import { useSocket } from "@/context/SocketProvider";
import HeaderChat from "@/components/chat/HeaderChat";
import BtnOpenChat from "@/components/chat/btnOpenChat";
import { MessageType } from "../utils/messagesType";
import MessageItem from "@/components/chat/MessageItem";
import { useQueryClient } from "@tanstack/react-query";
import {
  handleScrollVisibility,
  insideUniqueMessages,
  ScrollS,
  ScrollType,
  sendtoSocketLogic,
  setDataInCash,
  updataDataInCash,
} from "../utils/chatFn";
import {
  useChatMessageSent,
  useChatReceiver,
  useChatTypingStatus,
  useChatUserStatus,
  useInfiniteScroll,
  useObserveSessionRef,
} from "@/hooks/custom/chatHook";
import IsTypingDesign from "@/components/chat/IsTypingDesign";
import { parseAsBoolean, useQueryState } from "nuqs";

// ── Component ──────────────────────────────────────────────
interface typeProps {
  session: string | null | undefined;
  sessionDetails: any;
}
const ChatModal = ({ session, sessionDetails }: typeProps) => {
  const t = useTranslations("Chat");
  const queryClient = useQueryClient();
  const socket = useSocket();
  const [isOpen, setIsOpen] = useQueryState(
    "modal",
    parseAsBoolean.withDefault(false),
  );
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const [countMessage, setCountMessage] = useState(0);
  const [isMessageSent, setIsMessageSent] = useState(false);

  const inputAreaRef = useRef<InputAreaHandle>(null);
  const isFirstLoad = useRef(true);
  const sessionRef = useObserveSessionRef(session);

  // 1. Scroll
  const scrollS = useCallback((type: ScrollType) => {
    ScrollS(messagesEndRef, type);
  }, []);

  // 2. Set Data In Cash
  type whosType = "sender" | "reciever";
  const callSetDataInCashFn = useCallback(
    (newMessage: MessageType, whos: whosType = "sender") => {
      setDataInCash(queryClient, newMessage, whos, session || "GuestUser");
    },
    [queryClient, session],
  );

  // 3. Update Data In Cash
  const callupdataDataInCash = useCallback(
    (messageId: string, data: MessageType) => {
      if (!session) return;
      updataDataInCash(messageId, data, queryClient, session);
    },
    [queryClient, session],
  );

  // 4. Handle Send Message
  const handleSendMessage = useCallback(async () => {
    const currentValue = inputAreaRef.current?.getValue() || "";
    if (!currentValue.trim()) return;

    const userMessage: MessageType = {
      id: crypto.randomUUID(),
      message: currentValue,
      isRead: true,
      userId: "GuestUser",
      createdAt: new Date(),
    };

    callSetDataInCashFn(userMessage, "reciever");
    scrollS("bottom");
    inputAreaRef.current?.clear();

    setTimeout(() => {
      const adminMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        message: t("please_login_before_continue"),
        userId: session as any,
        createdAt: new Date(),
      };
      callSetDataInCashFn(adminMessage, "reciever");
      setIsTyping(false);
    }, 500);
  }, [session, callSetDataInCashFn, scrollS]);

  const sendToSocket = useCallback(async () => {
    setIsMessageSent((prev) => !prev);
    if (!session) {
      handleSendMessage();
      return;
    }
    const userId = session;
    const params = {
      inputAreaRef,
      userId,
      socket,
      callSetDataInCashFn,
      sessionDetails,
    };
    sendtoSocketLogic(params as any);
    scrollS("bottom");
  }, [
    session,
    handleSendMessage,
    inputAreaRef,
    socket,
    callSetDataInCashFn,
    sessionDetails,
    scrollS,
  ]);

  const toggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
  }, []);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetMessages(session ?? "GuestUser");

  useEffect(() => {
    if (!socket) return;
    socket.onAny((eventName, ...args) => {});
    return () => {
      socket.offAny();
    };
  }, [socket]);

  useChatReceiver({
    socket,
    session,
    sessionRef,
    callSetDataInCashFn,
    scrollS,
  });

  useChatMessageSent({
    socket,
    callupdataDataInCash,
  });

  useChatUserStatus({ socket, session, isOpen });
  useChatTypingStatus({ socket, setIsTyping });
  useInfiniteScroll({
    targetRef: messagesStartRef,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    scrollS,
  });

  useEffect(() => {
    if (data && data.length > 0 && !isLoading) {
      if (isFirstLoad.current) {
        scrollS("bottom");
        isFirstLoad.current = false;
      }
    }
  }, [data, isLoading, scrollS]);

  const uniqueMessages = useMemo(() => {
    return insideUniqueMessages(data as any);
  }, [data, callSetDataInCashFn, session]);

  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (!socket || !session) return;
    if (hasJoinedRef.current) return;
    socket.emit("join_Room_connection", session);
    hasJoinedRef.current = true;
  }, [socket?.id, session]);

  // رسالة الأدمن الافتراضية لو الشات فاضي
  const welcomeMessage: any = {
    id: "welcome-msg",
    message: t("welcome_message"),
    sender: "admin",
    createdAt: new Date(),
    isRead: true,
  };

  return (
    <>
      {!isOpen && (
        <BtnOpenChat
          session={session as any}
          toggleChat={toggleChat}
          messageCount={countMessage}
        />
      )}

      <div
        className={`${isOpen ? "opacity-100 scale-100 translate-y-0 sm:-mr-6 md:mr-0 " : "opacity-0 scale-95 translate-y-10 pointer-events-none"} fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 sm:w-lvh ${
          isMinimized ? "h-16" : "h-[600px]"
        }`}
        style={{ maxHeight: "calc(100vh - 100px)" }}
      >
        <HeaderChat
          session={session}
          toggleMinimize={toggleMinimize}
          toggleChat={toggleChat}
          isMinimized={isMinimized}
        />

        <>
          <div
            className={`${!isMinimized ? "block" : "hidden"} flex-1 overflow-y-auto bg-gray-50 p-4`}
            onScroll={(e) => handleScrollVisibility(e, arrowRef)}
            ref={messagesEndRef}
          >
            <div className="space-y-4">
              {isLoading && (
                <div className="flex w-full items-center justify-center py-6">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-600"></div>
                </div>
              )}
              <div ref={messagesStartRef} />

              {/* إذا كان الشات فاضي ومافيش تحميل، اعرض رسالة ترحيب الأدمن */}
              {(!uniqueMessages || uniqueMessages.length === 0) &&
                !isLoading && (
                  <MessageItem
                    message={welcomeMessage}
                    sessionDetails={sessionDetails}
                  />
                )}

              {uniqueMessages?.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message as any}
                  sessionDetails={sessionDetails}
                />
              ))}

              {isTyping && <IsTypingDesign />}

              <button
                ref={arrowRef}
                onClick={() => scrollS("bottom")}
                type="button"
                className="fixed bottom-24 right-10 z-[60] flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600/90 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-emerald-500 hover:scale-110 active:scale-95 hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-bounce"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
                <span className="absolute inset-0 -z-10 animate-pulse rounded-full bg-emerald-400/30 blur-md"></span>
              </button>
            </div>
          </div>

          <InputArea ref={inputAreaRef} onSend={sendToSocket} />
        </>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
      `}</style>
    </>
  );
};

ChatModal.displayName = "ChatModal";
export default ChatModal;
