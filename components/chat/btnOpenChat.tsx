"use client";

// components/support/SupportWidget.tsx

// ══════════════════════════════════════════════════════════

// الاستخدام في layout.tsx:

//   const SupportWidget = dynamic(

//     () => import("@/components/support/SupportWidget"),

//     { ssr: false, loading: () => <div className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 animate-pulse" /> }

//   );

// ══════════════════════════════════════════════════════════

import { useTranslations } from "next-intl";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from "react";

import {
  MessageCircle,
  X,
  Bot,
  Phone,
  Headphones,
  Send,
  Trash2,
  Loader2,
  ChevronUp,
} from "lucide-react";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import useReadMessages from "@/hooks/useReadMessages";

import useGetMessages from "@/hooks/useGetMessage";

import { useSocket } from "@/context/SocketProvider";

// ══ Types ═══════════════════════════════════════════════════════

type Sender = "USER" | "BOT";

type WidgetView = "closed" | "menu" | "chatbot";

interface ChatMessage {
  id: string;

  message: string;

  sender: Sender;

  createdAt: string;
}

interface ApiPage {
  messages: ChatMessage[];

  nextCursor: string | null;
}

interface SupportWidgetProps {
  toggleChat: () => void;

  session: string;

  messageCount: number;
}

// ══ Constants ════════════════════════════════════════════════════

const WA_URL = "https://wa.me/201080761700";

const HOTLINE = "tel:01080761700";

const QK = (s: string) => ["chatbot", s] as const;

// ══ Mini Components ══════════════════════════════════════════════

/** أيقونة واتساب الرسمية */

const WAIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/** نقاط تفكير البوت */

const ThinkingDots = ({ label }: { label: string }) => (
  <div role="status" aria-label={label} className="flex gap-1.5 px-4 py-3">
    {[0, 150, 300].map((d, i) => (
      <span
        key={i}
        aria-hidden="true"
        className="h-2 w-2 rounded-full bg-emerald-400"
        style={{
          animation: "sw-bounce 1.4s ease-in-out infinite",

          animationDelay: `${d}ms`,
        }}
      />
    ))}
  </div>
);

/** أفاتار البوت الصغير */

const BotAvatar = () => (
  <div
    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg self-start mt-0.5"
    style={{ background: "linear-gradient(135deg,#10b981,#84cc16)" }}
    aria-hidden="true"
  >
    <Bot className="h-3.5 w-3.5 text-white" />
  </div>
);

// ══ Main Component ════════════════════════════════════════════════

export default function SupportWidget({
  toggleChat,

  session,

  messageCount,
}: SupportWidgetProps) {
  const t = useTranslations("ChatWidget");

  const [view, setView] = useState<WidgetView>("closed");

  const [inputValue, setInputValue] = useState("");

  const [isStreaming, setIsStreaming] = useState(false);

  const [streamText, setStreamText] = useState("");

  const queryClient = useQueryClient();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const topRef = useRef<HTMLDivElement>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const prevHeightRef = useRef(0);

  const abortRef = useRef<AbortController | null>(null);

  const streamingRef = useRef(false); // sync ref لتجنب stale closure

  // ══════════════════════════════════════════════════════════════

  //  منطق BtnOpenChat القديم — محافظ عليه 100% بدون أي تغيير

  // ══════════════════════════════════════════════════════════════

  const { data: existingChatData } = useGetMessages(session);

  const socket = useSocket();

  const { mutate: readMessages } = useReadMessages();

  const unReadCount =
    existingChatData?.filter(
      (el) => el.isRead === false && el.userId !== session,
    ).length ?? 0;

  const readAllMsg = useCallback(() => {
    if (!session) return;

    readMessages({ userId: session } as any);
  }, [readMessages, session]);

  const handleTechnicalSupport = useCallback(() => {
    setView("closed");

    toggleChat();

    readAllMsg();
  }, [toggleChat, readAllMsg]);

  // ══════════════════ نهاية المنطق القديم ══════════════════════

  // إلغاء الـ stream لما الشات يُغلق

  useEffect(() => {
    if (view !== "chatbot") abortRef.current?.abort();
  }, [view]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },

    [],
  );

  // ── Infinite Query ──────────────────────────────────────────

  const {
    data,

    fetchNextPage,

    hasNextPage,

    isFetchingNextPage,

    isLoading: chatLoading,
  } = useInfiniteQuery<ApiPage>({
    queryKey: QK(session),

    queryFn: async ({ pageParam }) => {
      const url =
        pageParam ? `/api/chat/bot?cursor=${pageParam}` : "/api/chat/bot";

      const res = await fetch(url);

      if (!res.ok) throw new Error(t("errors.loadMessages"));

      return res.json();
    },

    initialPageParam: null as string | null,

    getNextPageParam: (p) => p.nextCursor ?? undefined,

    enabled: view === "chatbot" && session !== null,

    staleTime: 60_000,

    gcTime: 300_000,
  });

  const allMessages = useMemo<ChatMessage[]>(() => {
    if (!data) return [];

    return [...data.pages.flatMap((p) => p.messages)].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [data]);

  // ── Streaming Send ──────────────────────────────────────────

  const handleSend = useCallback(
    async (preset?: string) => {
      const msg = (preset ?? inputValue).trim();

      if (!msg || streamingRef.current) return;

      if (!preset) setInputValue("");

      // Optimistic: أضف رسالة المستخدم فوراً

      const tempId = `opt-${Date.now()}`;

      const optMsg: ChatMessage = {
        id: tempId,

        message: msg,

        sender: "USER",

        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        QK(session),

        (old: { pages: ApiPage[]; pageParams: unknown[] } | undefined) => {
          if (!old)
            return {
              pages: [{ messages: [optMsg], nextCursor: null }],

              pageParams: [null],
            };

          const pages = [...old.pages];

          pages[pages.length - 1] = {
            ...pages[pages.length - 1],

            messages: [...pages[pages.length - 1].messages, optMsg],
          };

          return { ...old, pages };
        },
      );

      streamingRef.current = true;

      setIsStreaming(true);

      setStreamText("");

      const ctrl = new AbortController();

      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/chat/bot", {
          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ message: msg }),

          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) throw new Error(t("errors.connectionFailed"));

        const reader = res.body.getReader();

        const decoder = new TextDecoder();

        let full = "";

        // ← هنا بنقرأ الـ Stream كلمة كلمة

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          full += decoder.decode(value, { stream: true });

          setStreamText(full); // الـ UI يُحدَّث فوراً بكل chunk
        }

        // بعد انتهاء الـ Stream → أضف الرد كاملاً للـ cache

        if (full) {
          queryClient.setQueryData(
            QK(session),

            (old: { pages: ApiPage[]; pageParams: unknown[] } | undefined) => {
              if (!old) return old;

              const pages = [...old.pages];

              pages[pages.length - 1] = {
                ...pages[pages.length - 1],

                messages: [
                  ...pages[pages.length - 1].messages,

                  {
                    id: `bot-${Date.now()}`,

                    message: full,

                    sender: "BOT" as Sender,

                    createdAt: new Date().toISOString(),
                  },
                ],
              };

              return { ...old, pages };
            },
          );
        }
      } catch (err) {
        // لو مش abort → ارجع الرسالة المتفائلة

        if ((err as Error).name !== "AbortError") {
          queryClient.setQueryData(
            QK(session),

            (old: { pages: ApiPage[]; pageParams: unknown[] } | undefined) => {
              if (!old) return old;

              return {
                ...old,

                pages: old.pages.map((p) => ({
                  ...p,

                  messages: p.messages.filter((m) => m.id !== tempId),
                })),
              };
            },
          );
        }
      } finally {
        streamingRef.current = false;

        setIsStreaming(false);

        setStreamText("");
      }
    },

    [inputValue, session, queryClient, t],
  );

  // ── Side effects ────────────────────────────────────────────

  // Auto-scroll لأسفل

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length, streamText]);

  // Auto-focus

  useEffect(() => {
    if (view !== "chatbot") return;

    const t = setTimeout(() => inputRef.current?.focus(), 120);

    return () => clearTimeout(t);
  }, [view]);

  // IntersectionObserver للـ Infinite Scroll

  useEffect(() => {
    const sentinel = topRef.current;

    if (!sentinel || !hasNextPage) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || isFetchingNextPage) return;

        prevHeightRef.current = scrollRef.current?.scrollHeight ?? 0;

        fetchNextPage();
      },

      { threshold: 0.1 },
    );

    obs.observe(sentinel);

    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // تثبيت موضع التمرير بعد تحميل صفحة قديمة

  useEffect(() => {
    if (!isFetchingNextPage && prevHeightRef.current > 0) {
      const el = scrollRef.current;

      if (el) {
        el.scrollTop = el.scrollHeight - prevHeightRef.current;

        prevHeightRef.current = 0;
      }
    }
  }, [isFetchingNextPage]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      void handleSend();
    }
  };

  const handleClear = useCallback(() => {
    queryClient.setQueryData(QK(session), {
      pages: [{ messages: [], nextCursor: null }],

      pageParams: [null],
    });
  }, [queryClient, session]);

  const busy = isStreaming;

  // Quick questions array

  const QUICK = [
    t("quickQuestions.q1"),

    t("quickQuestions.q2"),

    t("quickQuestions.q3"),
  ] as const;

  // ═══════════════════════ JSX ══════════════════════════════════

  return (
    <>
      {/* ── Keyframes ────────────────────────────────────────── */}

      <style>{`

        @keyframes sw-bounce {

          0%,60%,100% { transform:translateY(0);   opacity:.25 }

          30%          { transform:translateY(-6px); opacity:1   }

        }

        @keyframes sw-up {

          from { opacity:0; transform:translateY(6px) }

          to   { opacity:1; transform:translateY(0)   }

        }

        @keyframes sw-slide {

          from { opacity:0; transform:translateY(14px) scale(.98) }

          to   { opacity:1; transform:translateY(0)    scale(1)   }

        }

        @keyframes sw-badge {

          0%   { transform:scale(0) }

          65%  { transform:scale(1.2) }

          100% { transform:scale(1) }

        }

        @keyframes sw-blink {

          0%,100% { opacity:1 }

          50%     { opacity:0 }

        }

        .sw-up    { animation:sw-up    .18s ease-out      forwards }

        .sw-slide { animation:sw-slide .22s cubic-bezier(.22,.68,0,1.1) forwards }

        .sw-badge { animation:sw-badge .3s  cubic-bezier(.34,1.56,.64,1) forwards }

        .sw-cursor::after {

          content:'▋';

          animation:sw-blink .7s ease-in-out infinite;

          display:inline-block;

          margin-right:1px;

          color:#10b981;

          font-size:.65em;

          vertical-align:middle;

        }

        .sw-scroll::-webkit-scrollbar { display:none }

        .sw-scroll { -ms-overflow-style:none; scrollbar-width:none }

      `}</style>

      {/* ── Backdrop موبايل ──────────────────────────────────── */}

      {view !== "closed" && (
        <div
          className="fixed inset-0 z-40 sm:hidden bg-black/20 backdrop-blur-[2px]"
          onClick={() => setView("closed")}
          aria-hidden="true"
        />
      )}

      {/* ══════════════════════════════════════════════════════

          لوحة الشات الذكي

      ══════════════════════════════════════════════════════ */}

      {view === "chatbot" && (
        <div
          role="dialog"
          style={{ zIndex: 9999, border: "1px solid #e2e8f0" }}
          aria-modal="true"
          aria-label={t("chatbot.ariaLabel")}
          className={[
            "fixed z-50 flex flex-col overflow-hidden sw-slide",

            /* Mobile — bottom sheet */

            "bottom-0 left-0 right-0 h-[88dvh] rounded-t-2xl",

            /* Desktop — floating card */

            "sm:bottom-24 sm:right-6 sm:left-auto sm:w-80 sm:h-[510px] sm:rounded-2xl",

            /* شكل */

            "bg-white shadow-2xl shadow-slate-300/40",
          ].join(" ")}
        >
          {/* ── Header ───────────────────────────────────────── */}

          <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg,#10b981,#84cc16)",

                    boxShadow: "0 2px 8px rgba(16,185,129,.3)",
                  }}
                >
                  <Bot className="h-4 w-4 text-white" aria-hidden="true" />
                </div>

                {/* Online dot */}

                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white"
                  style={{ boxShadow: "0 0 5px rgba(52,211,153,.7)" }}
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {t("chatbot.botName")}
                </p>

                <p className="text-[11px] font-medium text-emerald-500 mt-0.5">
                  {t("chatbot.status")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                type="button"
                aria-label={t("chatbot.clearChat")}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              <button
                onClick={() => setView("closed")}
                type="button"
                aria-label={t("chatbot.close")}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* ── Quick Replies (ثابتة فوق الرسائل) ────────────── */}

          <div
            className="shrink-0 px-3 py-2 bg-slate-50 border-b border-slate-100/80"
            role="group"
            aria-label={t("chatbot.quickQuestionsLabel")}
          >
            <p
              className="text-[10px] font-semibold text-slate-400 tracking-wide mb-1.5 uppercase"
              aria-hidden="true"
            >
              {t("chatbot.quickQuestionsLabel")}
            </p>

            <div className="flex gap-1.5 overflow-x-auto sw-scroll">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={busy}
                  onClick={() => void handleSend(q)}
                  className="shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    borderColor: "#d1fae5",
                    background: "#f0fdf4",
                    color: "#059669",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#ecfdf5";
                    e.currentTarget.style.borderColor = "#a7f3d0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f0fdf4";
                    e.currentTarget.style.borderColor = "#d1fae5";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2 sw-scroll"
            style={{
              background: "linear-gradient(180deg,#f8fafc 0%,#ffffff 100%)",
            }}
            aria-live="polite"
            aria-relevant="additions"
          >
            {/* Infinite scroll sentinel */}

            <div ref={topRef} aria-hidden="true" className="h-px" />

            {/* تحميل رسائل أقدم */}

            {isFetchingNextPage && (
              <div className="flex justify-center py-1">
                <Loader2
                  className="h-4 w-4 animate-spin text-emerald-400"
                  aria-label={t("chatbot.loading")}
                />
              </div>
            )}

            {hasNextPage && !isFetchingNextPage && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    prevHeightRef.current =
                      scrollRef.current?.scrollHeight ?? 0;

                    fetchNextPage();
                  }}
                  className="text-[11px] flex items-center gap-1 px-3 py-1 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <ChevronUp className="h-3 w-3" />

                  {t("chatbot.olderMessages")}
                </button>
              </div>
            )}

            {/* Skeleton */}

            {chatLoading && (
              <div
                className="space-y-2.5"
                aria-busy="true"
                aria-label={t("chatbot.loading")}
              ></div>
            )}

            {/* Empty state */}

            {!chatLoading && allMessages.length === 0 && !isStreaming && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-6">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(16,185,129,.1),rgba(132,204,22,.1))",

                    border: "1.5px solid rgba(16,185,129,.2)",
                  }}
                >
                  <Bot
                    className="h-7 w-7 text-emerald-500"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-slate-700 font-bold text-sm">
                    {t("chatbot.emptyStateTitle")}
                  </p>

                  <p className="text-slate-400 text-xs mt-1">
                    {t("chatbot.emptyStateSubtitle")}
                  </p>
                </div>
              </div>
            )}

            {/* الرسائل المحفوظة */}

            {allMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 sw-up ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "BOT" && <BotAvatar />}

                <div
                  dir="rtl"
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.sender === "USER" ?
                      "rounded-br-sm text-white"
                    : "rounded-bl-sm text-slate-700 bg-white shadow-sm"
                  }`}
                  style={
                    msg.sender === "USER" ?
                      {
                        background: "linear-gradient(135deg,#10b981,#84cc16)",

                        boxShadow: "0 1px 8px rgba(16,185,129,.2)",
                      }
                    : { border: "1px solid #e2e8f0" }
                  }
                >
                  {msg.message}
                </div>
              </div>
            ))}

            {/* رسالة الـ Streaming — تظهر كلمة كلمة */}

            {isStreaming && (
              <div className="flex gap-2 justify-start sw-up">
                <BotAvatar />

                <div
                  dir="rtl"
                  className="max-w-[80%] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm leading-relaxed text-slate-700 bg-white shadow-sm"
                  style={{ border: "1px solid #e2e8f0" }}
                >
                  {streamText ?
                    <span className={isStreaming ? "sw-cursor" : ""}>
                      {streamText}
                    </span>
                  : <ThinkingDots label={t("chatbot.typing")} />}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          {/* ── Input ─────────────────────────────────────────── */}

          <div className="shrink-0 px-3 pb-4 pt-2 bg-white border-t border-slate-100">
            <div
              className="flex items-end gap-2 rounded-xl px-3 py-2 transition-all"
              style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}
              onFocusCapture={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "#6ee7b7";

                (e.currentTarget as HTMLDivElement).style.background = "#fff";
              }}
              onBlurCapture={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "#e2e8f0";

                (e.currentTarget as HTMLDivElement).style.background =
                  "#f8fafc";
              }}
            >
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={busy}
                rows={1}
                placeholder={t("chatbot.inputPlaceholder")}
                dir="rtl"
                aria-label={t("chatbot.inputLabel")}
                className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50 max-h-24 sw-scroll"
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />

              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={!inputValue.trim() || busy}
                aria-label={t("chatbot.sendMessage")}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed"
                style={{
                  background:
                    !inputValue.trim() || busy ?
                      "linear-gradient(135deg,#a7f3d0,#d9f99d)"
                    : "linear-gradient(135deg,#10b981,#84cc16)",

                  boxShadow:
                    !inputValue.trim() || busy ?
                      "none"
                    : "0 1px 8px rgba(16,185,129,.3)",
                }}
              >
                {busy ?
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                : <Send className="h-3.5 w-3.5" aria-hidden="true" />}
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400 mt-1.5 select-none">
              {t("chatbot.poweredBy")}
            </p>
          </div>
        </div>
      )}

      {view === "menu" && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 sw-slide"
          role="menu"
          aria-label={t("menu.ariaLabel")}
        >
          {/* 1. الدعم الفني */}

          <button
            type="button"
            role="menuitem"
            onClick={handleTechnicalSupport}
            className="group flex items-center gap-3 rounded-2xl px-4 py-3 w-60 bg-white border border-slate-200 shadow-lg hover:border-indigo-200 hover:shadow-indigo-100/60 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {unReadCount > 0 && (
              <span
                className="sw-badge absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
                aria-label={t("menu.unreadMessages", { count: unReadCount })}
              >
                {unReadCount > 9 ? "9+" : unReadCount}
              </span>
            )}

            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",

                boxShadow: "0 2px 10px rgba(99,102,241,.35)",
              }}
            >
              <Headphones className="h-5 w-5 text-white" aria-hidden="true" />
            </span>

            <div dir="rtl">
              <p className="text-sm font-bold text-slate-800">
                {t("menu.technicalSupport.title")}
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                {t("menu.technicalSupport.subtitle")}
              </p>
            </div>
          </button>

          {/* 2. واتساب */}

          <a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setView("closed")}
            className="group flex items-center gap-3 rounded-2xl px-4 py-3 w-60 bg-white border border-slate-200 shadow-lg hover:border-green-200 hover:shadow-green-100/60 transition-all focus:outline-none focus:ring-2 focus:ring-green-200"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{
                background: "#25D366",

                boxShadow: "0 2px 10px rgba(37,211,102,.35)",
              }}
            >
              <WAIcon />
            </span>

            <div dir="rtl">
              <p className="text-sm font-bold text-slate-800">
                {t("menu.whatsapp.title")}
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                {t("menu.whatsapp.subtitle")}
              </p>
            </div>
          </a>

          <a
            href={HOTLINE}
            role="menuitem"
            onClick={() => setView("closed")}
            className="group flex items-center gap-3 rounded-2xl px-4 py-3 w-60 bg-white border border-slate-200 shadow-lg hover:border-orange-200 hover:shadow-orange-100/60 transition-all focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg,#f97316,#ef4444)",

                boxShadow: "0 2px 10px rgba(249,115,22,.35)",
              }}
            >
              <Phone className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <div dir="rtl">
              <p className="text-sm font-bold text-slate-800">
                {t("menu.hotline.title")}
              </p>

              <p className="text-xs text-slate-500 mt-0.5">
                {t("menu.hotline.number")}
              </p>
            </div>
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={() => setView("chatbot")}
            className="group flex items-center gap-3 rounded-2xl px-4 py-3 w-60 bg-white shadow-lg hover:shadow-emerald-100/60 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200"
            style={{
              border: "1.5px solid #a7f3d0",
              boxShadow: "0 4px 16px rgba(16,185,129,.1)",
            }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg,#10b981,#84cc16)",
                boxShadow: "0 2px 10px rgba(16,185,129,.4)",
              }}
            >
              <Bot className="h-5 w-5 text-white" aria-hidden="true" />
            </span>

            <div dir="rtl">
              <p className="text-sm font-bold text-slate-800">
                {t("menu.aiAssistant.title")}
              </p>

              <p className="text-xs font-semibold text-emerald-500 mt-0.5">
                {t("menu.aiAssistant.subtitle")}
              </p>
            </div>
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setView((p) => (p === "closed" ? "menu" : "closed"))}
        // كود Tailwind مركز ومعمول له Optimized 100%
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full 
           bg-emerald-600 text-white shadow-lg shadow-emerald-200/50
           transition-all duration-300 hover:scale-105 hover:bg-emerald-700
           active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-100"
        aria-label={view !== "closed" ? t("fab.close") : t("fab.open")}
        aria-expanded={view !== "closed"}
      >
        {view !== "closed" ?
          <X className="h-6 w-6" aria-hidden="true" />
        : <button>
            {unReadCount > 0 && (
              <span
                className="sw-badge absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
                aria-label={t("menu.unreadMessages", { count: unReadCount })}
              >
                {unReadCount > 9 ? "9+" : unReadCount}
              </span>
            )}
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </button>
        }
      </button>
    </>
  );
}
