"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { TicketList } from "../../_components/admin/support/TicketList";
import { ChatPane } from "../../_components/admin/support/ChatPane";
import { ArrowLeft } from "lucide-react";
import { cn } from "../../_lib/utils";
import type { SupportTicket } from "../../_types/index";
import useGetchatRooms from "@/hooks/useGetChatRoom";
import { useSocket } from "@/context/SocketProvider";
import { updateChatCache } from "@/hooks/useUpdateChatRoom";
import { useQueryClient } from "@tanstack/react-query";
// ─────────────────────────────────────────────────────────────────────────────
// SupportClient — Split-pane layout
//
// Layout math:
//   - TopNav height: h-16 (4rem = 64px)
//   - This container: h-[calc(100vh-4rem)] overflow-hidden
//   - Left pane: fixed width w-80 on desktop, full-width on mobile
//   - Right pane: flex-1, fills remaining space
//
// Mobile: shows either list OR chat (not both simultaneously)
// Desktop (lg+): side-by-side split pane
// ─────────────────────────────────────────────────────────────────────────────

interface SupportClientProps {
  tickets: SupportTicket[];
}

export function SupportClient() {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const t = useTranslations("AdminSupport" as any);
  const { data: tickets, isLoading } = useGetchatRooms();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const allTickets = useMemo(() => {
    return (tickets as any)?.pages?.flatMap((page: any) => page) || [];
  }, [(tickets as any)?.pages]);

  const selectedTicket = useMemo(() => {
    return (
      (allTickets as any).find((ticket: any) => ticket.id === selectedId) ||
      null
    );
  }, [allTickets, selectedId]);

  function handleSelectTicket(id: string) {
    setSelectedId(id);
    setMobileView("chat"); // switch to chat pane on mobile
  }

  function handleBackToList() {
    setMobileView("list");
    setSelectedId(null);
  }

  useEffect(() => {
    if (!socket) return;

    const handleGlobalEarChat = (data: any) => {
      updateChatCache(queryClient, data, selectedId);
      // console.log("this is data in handleGlobalEarChat", data);
    };
    socket.on("global-ear-chat", handleGlobalEarChat);
    return () => {
      socket.off("global-ear-chat", handleGlobalEarChat);
    };
  }, [socket]);
  return (
    // h-[calc(100vh-4rem)] = full viewport minus the TopNav height (h-16)
    // overflow-hidden prevents double scrollbars — each pane manages its own scroll
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* ══ LEFT PANE — Ticket List ══ */}
      <div
        className={cn(
          // Mobile: full width, hidden when in chat view
          "flex-shrink-0 w-full",
          // Desktop: fixed sidebar width, always visible
          "lg:w-80 lg:flex",
          // Mobile visibility toggle
          mobileView === "list" ? "flex flex-col" : "hidden lg:flex",
        )}
        aria-label={t("ticket_list_panel_aria")}
      >
        <TicketList
          // تم التعديل هنا: تمرير كل التذاكر بدل الصفحة الأولى فقط
          tickets={allTickets}
          selectedId={selectedId}
          onSelect={handleSelectTicket}
        />
      </div>

      {/* ══ RIGHT PANE — Chat ══ */}
      <main
        className={cn(
          // Mobile: full width, hidden when in list view
          "flex-1 flex flex-col min-w-0 overflow-hidden",
          mobileView === "chat" ? "flex" : "hidden lg:flex",
        )}
        aria-label={t("chat_panel_aria")}
      >
        {/* Mobile back button */}
        {selectedTicket && (
          <button
            type="button"
            onClick={handleBackToList}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border-b border-slate-100 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors shrink-0"
            aria-label={t("back_to_ticket_list_aria")}
          >
            <ArrowLeft size={16} />
            {t("all_tickets")}
          </button>
        )}

        <div className="flex-1 overflow-hidden">
          {selectedTicket && (
            <ChatPane ticket={selectedTicket} key={selectedTicket.id} />
          )}
        </div>
      </main>
    </div>
  );
}
