"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import { TicketStatusBadge, PriorityBadge } from "../ui/Badge";
import type { SupportTicket } from "../../../_types/index";
import Image from "next/image";
import InputArea, { InputAreaHandle } from "@/components/chat/InputArea";
import useGetMessages from "@/hooks/useGetMessage";
import {
  handleScrollVisibility,
  insideUniqueMessages,
  ScrollS,
  ScrollType,
  sendtoSocketLogic,
  setDataInCash,
  updataDataInCash,
} from "@/app/[locale]/utils/chatFn";
import MessageItem from "@/components/chat/MessageItem";
import { useSocket } from "@/context/SocketProvider";
import { MessageType } from "@/app/[locale]/utils/messagesType";
import { useQueryClient } from "@tanstack/react-query";
import {
  useChatMessageSent,
  useChatReceiver,
  useChatTypingStatus,
  useInfiniteScroll,
  useJoinToRoom,
  useObserveSessionRef,
} from "@/hooks/custom/chatHook";
import { useSession } from "next-auth/react";
import IsTypingDesign from "@/components/chat/IsTypingDesign";
import MessageItemLoader from "@/components/chat/messageItemLoader";
import useReadMessages from "@/hooks/useReadMessages";

// ─────────────────────────────────────────────────────────────────────────────
// ChatPane — Right pane of support layout
// Full native-app chat feel: auto-scroll, send on Enter, read receipts
// h-[calc(100vh-4rem)] is set on the parent — this fills it perfectly
// ─────────────────────────────────────────────────────────────────────────────

interface ChatPaneProps {
  ticket: SupportTicket | null;
  onUpdateTicket?: (updated: SupportTicket) => void;
}

// Empty state when no ticket is selected
function EmptyState() {
  const t = useTranslations("AdminSupport" as any);
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <MessageSquare size={28} className="text-slate-400" />
      </div>
      <h3 className="text-base font-semibold font-display text-slate-700 mb-1">
        {t("select_conversation")}
      </h3>
      <p className="text-sm text-slate-400 max-w-xs">
        {t("choose_ticket_from_left")}
      </p>
    </div>
  );
}

export function ChatPane({ ticket, onUpdateTicket }: ChatPaneProps) {
  const session = useSession();
  const socket = useSocket();
  const userId = ticket?.user?.id ?? (ticket as any)?.userId ?? "";
  const adminId = session?.data?.user?.id;
  const adminName = session?.data?.user?.name;
  const sessionDetails = ticket?.user;
  const queryClient = useQueryClient();
  const t = useTranslations("AdminSupport" as any);
  // console.log("this is admin id", adminId);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetMessages(ticket?.id ?? "", adminId);
  // stats & refذ
  const { mutate } = useReadMessages();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevTicketId = useRef<string | null>(null);
  const inputAreaRef = useRef<InputAreaHandle>(null);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);

  // ─── 1. Memoized Functions ──────────────────────────────────────────────

  // scroll
  const scrollS = useCallback((type: ScrollType) => {
    ScrollS(messagesEndRef, type);
  }, []);

  type whosType = "sender" | "reciever";
  const callSetDataInCashFn = useCallback(
    (newMessage: MessageType, whos: whosType = "sender") => {
      // console.log("callSetDataInCashFn called");
      setDataInCash(queryClient, newMessage, whos, userId);
    },
    [queryClient, userId],
  );

  // messageId => come from server
  const callupdataDataInCash = useCallback(
    (messageId: string, data: MessageType) => {
      if (!userId) return;
      updataDataInCash(messageId, data, queryClient, userId);
    },
    [queryClient, userId],
  );

  const sendToSocket = useCallback(async () => {
    setIsMessageSent((prev) => !prev);
    const params: any = {
      inputAreaRef,
      userId,
      adminId,
      adminName,
      socket,
      callSetDataInCashFn,
      sessionDetails,
    };
    sendtoSocketLogic(params);
  }, [userId, adminId, socket, callSetDataInCashFn, sessionDetails]);

  // ─── 2. Effects & Setup ──────────────────────────────────────────────────

  // Reset messages when ticket changes
  useEffect(() => {
    if (ticket && ticket.id !== prevTicketId.current) {
      prevTicketId.current = ticket.id;
    }
  }, [ticket]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sessionRef = useObserveSessionRef(ticket?.id);

  // ─── 3. Socket Hooks ─────────────────────────────────────────────────────

  // -- join room
  useJoinToRoom({ socket, userId });

  //   recive message hook
  useEffect(() => {
    if (!socket) return;

    // ده "الرادار" اللي بيسمع كل الأحداث
    socket.onAny((eventName, ...args) => {
      // console.log(`[SOCKET_ANY] Event: ${eventName}`, args);
    });

    return () => {
      socket.offAny(); // تنظيف الرادار
    };
  }, [socket]);

  useChatReceiver({
    socket,
    session: adminId,
    sessionRef,
    callSetDataInCashFn,
    scrollS,
  });

  // to check if message sent and optimistic update (update message status)
  useChatMessageSent({
    socket,
    callupdataDataInCash,
  });

  // -- user typing status
  useChatTypingStatus({
    socket,
    setIsTyping,
  });

  const uniqueMessages = useMemo(() => {
    return insideUniqueMessages(data as any);
  }, [data]);

  // ── IntersectionObserver for infinte scroll pagination ─── hook───────────
  useInfiniteScroll({
    targetRef: messagesStartRef, // الـ Ref اللي إنت حاطه في أول الرسايل
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    scrollS,
  });

  // read msg
  useEffect(() => {
    if (!userId) return;
    mutate({ userId, roomId: userId });
  }, [userId, mutate, ticket?.id]);
  if (!ticket) return <EmptyState />;
  if (isLoading) return <MessageItemLoader />;

  // 4. Render
  return (
    <>
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-violet-50/20 to-blue-50/10">
        <header className="relative flex items-center gap-3 px-4 sm:px-5 py-4 bg-gradient-to-br from-white via-violet-50/30 to-blue-50/20 border-b border-violet-100/50 backdrop-blur-sm shrink-0 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />

          <div className="relative">
            <Image
              src={
                (ticket.user as any).image ?? (ticket as any).user.avatar ?? ""
              }
              alt={ticket.user.name}
              width={100}
              height={100}
              className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-lg shadow-violet-200/50 ring-2 ring-violet-100/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-300/60"
            />
          </div>

          <div className="flex-1 min-w-0 relative">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate font-display">
                {ticket.user.name}
              </h2>
              <TicketStatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>
        </header>

        <div
          className="flex-1 overflow-y-auto px-4 sm:px-5 py-6 space-y-5 scrollbar-thin relative"
          style={{
            background: `
            radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
            linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)
          `,
          }}
          role="log"
          aria-label={t("chat_messages_aria")}
          aria-live="polite"
          onScroll={(e) => handleScrollVisibility(e, arrowRef)}
        >
          <div
            className="absolute inset-0 opacity-[0.015] pointer-events-none"
            style={{
              backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(139, 92, 246, 0.4) 35px, rgba(139, 92, 246, 0.4) 36px),
              repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(59, 130, 246, 0.4) 35px, rgba(59, 130, 246, 0.4) 36px)
            `,
            }}
          />

          <div className="flex items-center gap-3 py-2" aria-hidden="true">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
            <span className="text-[10px] font-bold text-transparent bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-violet-50 to-blue-50 shadow-sm border border-violet-100/50">
              {t("conversation_separator")}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
          </div>

          <div ref={messagesStartRef} />

          <div className="space-y-4">
            {uniqueMessages?.map((message, index) => (
              <div
                key={message.id}
                className="animate-[fadeInUp_0.4s_ease-out] opacity-0"
                style={{
                  animation: `fadeInUp 0.4s ease-out ${index * 0.05}s forwards`,
                }}
              >
                <MessageItem message={message as any} />
              </div>
            ))}
          </div>

          {isTyping && (
            <div className="animate-[fadeInUp_0.3s_ease-out]">
              <IsTypingDesign />
            </div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        <InputArea ref={inputAreaRef} onSend={sendToSocket} />

        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
          }

          .scrollbar-thin::-webkit-scrollbar-track {
            background: linear-gradient(
              to bottom,
              rgba(139, 92, 246, 0.05),
              rgba(59, 130, 246, 0.05)
            );
            border-radius: 10px;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: linear-gradient(
              to bottom,
              rgba(139, 92, 246, 0.3),
              rgba(59, 130, 246, 0.3)
            );
            border-radius: 10px;
            transition: all 0.3s ease;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(
              to bottom,
              rgba(139, 92, 246, 0.5),
              rgba(59, 130, 246, 0.5)
            );
          }
        `}</style>
      </div>
    </>
  );
}
