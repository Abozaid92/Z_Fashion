"use client";

import { Clock, Headphones } from "lucide-react";
import { memo } from "react";
import { MessageTypeToMessageItem } from "@/app/[locale]/utils/messagesType";
import Image from "next/image";

interface typeProps {
  message: MessageTypeToMessageItem;
  sessionDetails?: any; // أضفنا التفاصيل عشان الصورة
}

const formatTime = (dateInput: Date | string) => {
  if (!dateInput) return "";
  const msgDate = new Date(dateInput);
  const now = new Date();
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(msgDate, now)) {
    return msgDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (isSameDay(msgDate, yesterday)) return "Yesterday";
  return msgDate.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const compareMessages = (prev: typeProps, next: typeProps) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.message === next.message.message &&
    (prev.message.isMessageSent ?? true) ===
      (next.message.isMessageSent ?? true)
  );
};

const MessageItem = memo(({ message, sessionDetails }: typeProps) => {
  const isAdmin = message.sender === "admin";
  const userImage = sessionDetails?.image || "/default-avatar.png"; // صورة المستخدم

  return (
    <div
      className={`flex items-end gap-2 w-full ${
        isAdmin ? "justify-start" : "justify-end"
      }`}
    >
      {/* أيقونة الأدمن (تظهر فقط لو هو المرسل) */}
      {isAdmin && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm border border-emerald-200">
          <Headphones size={18} />
        </div>
      )}

      {/* التعديل هنا: أضفنا min-w-0 عشان الـ flex ميهريش لبره */}
      <div
        className={`relative flex flex-col ${
          isAdmin ? "items-start" : "items-end"
        } max-w-[75%] min-w-0`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isAdmin ?
              "bg-white text-gray-800 rounded-bl-none border border-gray-100"
            : "bg-emerald-500 text-white rounded-br-none"
          }`}
          style={!isAdmin ? { backgroundColor: "#10b981" } : {}}
        >
          {/* التعديل الجوهري: break-words و whitespace-pre-wrap */}
          <p
            style={{ maxWidth: "240px" }}
            className="text-[13.5px] leading-relaxed font-medium break-words  whitespace-pre-wrap"
          >
            {message.message}
          </p>
        </div>

        {/* الوقت وحالة الإرسال */}
        <div className="flex items-center gap-1.5 mt-1 px-1">
          <p className="text-[10px] text-gray-400 font-medium">
            {formatTime(message.createdAt)}
          </p>
          {!isAdmin && message.isMessageSent === false && (
            <Clock size={10} className="text-gray-300 animate-pulse" />
          )}
        </div>
      </div>

      {/* صورة المستخدم (تظهر فقط لو هو المرسل) */}
      {!isAdmin && (
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border-2 border-emerald-100 shadow-sm">
          <Image src={userImage} alt="User" fill className="object-cover" />
        </div>
      )}
    </div>
  );
}, compareMessages);

MessageItem.displayName = "MessageItem";
export default MessageItem;
