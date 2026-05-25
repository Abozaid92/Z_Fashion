"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Search, X, MessageCircle } from "lucide-react";
import Image from "next/image";
import { formatRelativeTime } from "../../../_lib/utils";
import { cn } from "../../../_lib/utils";
import type { SupportTicket } from "../../../_types/index";

// ─────────────────────────────────────────────────────────────────────────────
// TicketList — Left pane of the support split layout
// Shows searchable, filterable list of support tickets
// ─────────────────────────────────────────────────────────────────────────────

interface TicketListProps {
  tickets: SupportTicket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_FILTERS = [
  "all",
  "open",
  "pending",
  "resolved",
  "closed",
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export function TicketList({ tickets, selectedId, onSelect }: TicketListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const t = useTranslations("AdminSupport" as any);

  const filtered = tickets?.filter((t) => {
    const matchesSearch =
      !search.trim() ||
      t.user.name.toLowerCase().includes(search.toLowerCase()) ||
      t.messages[0]?.message.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalUnread = tickets?.reduce(
    (sum, t) => sum + (t._count?.messages ?? 0),
    0,
  );

  return (
    <aside
      className="flex flex-col h-full bg-white border-r border-slate-100"
      aria-label={t("support_tickets_list_aria")}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-800 tracking-tight">
              {t("tickets")}
            </h2>
            {totalUnread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-lime-500 text-white text-[10px] font-bold leading-none">
                {totalUnread}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 tabular-nums">
            {filtered?.length ?? 0} / {tickets?.length ?? 0}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            aria-label={t("search_aria")}
            className="w-full pl-8 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-500/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label={t("clear_search")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div
          className="flex gap-1 overflow-x-auto scrollbar-thin pb-0.5"
          role="tablist"
          aria-label={t("filter_by_status_aria")}
        >
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors",
                statusFilter === s ?
                  "bg-lime-500 text-white shadow-sm shadow-lime-500/30"
                : "text-slate-500 hover:bg-slate-100",
              )}
            >
              {t(`status_${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Ticket List ── */}
      <ul
        className="flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-thin"
        role="listbox"
        aria-label={t("tickets")}
      >
        {filtered?.length === 0 ?
          <li className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <MessageCircle size={18} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-0.5">
              {t("no_tickets_found")}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-1 text-xs text-lime-600 hover:text-lime-700 font-medium"
              >
                {t("clear_search")}
              </button>
            )}
          </li>
        : filtered?.map((ticket) => {
            const unreadCount = ticket._count?.messages ?? 0;
            const lastMessage = ticket.messages[0]?.message ?? "";
            const isUnread = unreadCount > 0;

            return (
              <li
                key={ticket.id}
                role="option"
                aria-selected={selectedId === ticket.id}
              >
                <button
                  type="button"
                  onClick={() => onSelect(ticket.id)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 transition-all hover:bg-slate-50/80 group",
                    selectedId === ticket.id ?
                      "bg-lime-50/70 border-r-2 border-lime-500"
                    : "border-r-2 border-transparent",
                  )}
                  aria-label={t("ticket_from", { name: ticket.user.name })}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative shrink-0 mt-0.5">
                      <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-100">
                        <Image
                          src={ticket.user.image || ""}
                          alt={ticket.user.name}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p
                          className={cn(
                            "text-xs truncate",
                            isUnread ?
                              "font-semibold text-slate-800"
                            : "font-medium text-slate-600",
                          )}
                        >
                          {ticket.user.name}
                        </p>
                        <time
                          className="text-[10px] text-slate-400 shrink-0 tabular-nums"
                          dateTime={(ticket as any).updatedAt}
                        >
                          {formatRelativeTime((ticket as any).updatedAt)}
                        </time>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "text-[11px] truncate flex-1",
                            isUnread ? "text-slate-600" : "text-slate-400",
                          )}
                        >
                          {lastMessage || (
                            <span className="italic text-slate-300">
                              {t("no_messages")}
                            </span>
                          )}
                        </p>

                        {/* Unread badge */}
                        {isUnread && (
                          <span className="shrink-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-lime-500 text-white text-[10px] font-bold leading-none">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })
        }
      </ul>

      {/* ── Footer count ── */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
        <p className="text-[11px] text-slate-400">
          {t("showing_range", {
            shown: filtered?.length ?? 0,
            total: tickets?.length ?? 0,
          })}
        </p>
      </div>
    </aside>
  );
}
