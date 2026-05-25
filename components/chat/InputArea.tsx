"use client";

import { useTranslations } from "next-intl";
import React, {
  useState,
  memo,
  useCallback,
  useRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Send, Smile } from "lucide-react";
import EmojiPicker from "@/components/chat/EmojiPicker";
import { useSocket } from "@/context/SocketProvider";

// ── Types ──────────────────────────────────────────────────
export interface InputAreaHandle {
  getValue: () => string;
  clear: () => void;
}

interface InputAreaProps {
  onSend: () => void;
  ref?: React.Ref<InputAreaHandle>;
}

const InputArea = memo(({ ref, onSend }: InputAreaProps) => {
  const t = useTranslations("Chat" as any);
  const socket = useSocket();
  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // نستخدم textareaRef للتحكم في الطول والأداء
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── وظيفة ضبط الارتفاع تلقائياً ──────────────────────────
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // نرجع الارتفاع للـ auto عشان نحسب الـ scrollHeight الحقيقي
      textarea.style.height = "auto";
      // نضبط الارتفاع الجديد (بحد أقصى يوازي تقريباً 100 سطر أو مساحة الرؤية)
      const newHeight = Math.min(textarea.scrollHeight, 400);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // نراقب تغيير القيمة لضبط الطول (مثلاً عند مسح النص بالكامل)
  useEffect(() => {
    adjustHeight();
  }, [inputValue, adjustHeight]);

  const handleInputValue = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // منطق الـ Socket (Typing Status) - لم يتم لمس المنطق
    if (!socket) return;
    setIsTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    socket.emit("set_type_status", { typeStatus: "Typing" });

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("set_type_status", { typeStatus: "notTyping" });
    }, 1000);
  };

  // ── Expose methods للـ parent ─────────────────────────
  useImperativeHandle(ref, () => ({
    getValue: () => inputValue,
    clear: () => {
      setInputValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    },
  }));

  // ── Emoji Select ──────────────────────────────────────
  const handleEmojiSelect = useCallback((emoji: string) => {
    setInputValue((prev) => prev + emoji);
    // نركز على التيكست اريا بعد اختيار الإيموجي
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  // ── Handling Key Press (Enter vs Shift+Enter) ──────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="relative border-t border-gray-200 bg-white p-4">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2 max-w-full">
        {/* Textarea Input - تم استبدال الانبت بذكاء */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputValue}
          onKeyDown={handleKeyDown}
          placeholder={t("type_message")}
          rows={1}
          className="
            flex-1 
            resize-none 
            rounded-xl 
            border 
            border-gray-300 
            px-4 
            py-2.5 
            text-sm 
            text-gray-900 
            transition-[border-color,box-shadow] 
            focus:border-emerald-500 
            focus:outline-none 
            focus:ring-2 
            focus:ring-emerald-500/20 
            scrollbar-thin 
            scrollbar-thumb-gray-300
            min-h-[44px]
          "
          style={{
            lineHeight: "1.5",
            maxHeight: "300px", // يوازي حوالي 12-15 سطر ظاهر قبل التمرير الداخلي
          }}
        />

        {/* Action Buttons Container */}
        <div className="flex items-center gap-2 pb-[2px]">
          {/* Emoji Button */}
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-gray-300 text-gray-600 transition-all hover:bg-gray-50 hover:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-300"
            aria-label={t("choose_emoji")}
            type="button"
          >
            <Smile className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={!inputValue.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white transition-all hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("send_message")}
            type="button"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Hint */}
      <div className="mt-2 flex justify-between items-center px-1">
        <span
          className={`${inputValue.length > 450 ? "text-amber-500" : "text-gray-400"} text-[10px]`}
        >
          {inputValue.length}/500
        </span>
      </div>
    </div>
  );
});

InputArea.displayName = "InputArea";
export default InputArea;
