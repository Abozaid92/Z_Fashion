// import { useTranslations } from "next-intl";
// import EmojiPicker from "@/components/chat/EmojiPicker"; // ✅ إضافة الإيموجي بيكر
// import useGetMessages from "@/hooks/useGetMessage";
// import { io, Socket } from "socket.io-client";
// import { useSession } from "next-auth/react";

// import {
//   MessageCircle,
//   X,
//   Send,
//   Minimize2,
//   Maximize2,
//   Smile,
// } from "lucide-react";
// import { useState, memo, useRef, useEffect, useCallback } from "react";

// interface Message {
//   id: string;
//   text: string;
//   sender: "user" | "admin";
//   timestamp: Date;
// }

// const formatTime = (date: Date) => {
//   return date.toLocaleTimeString("ar-EG", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// // ✅ دالة إضافة الإيموجي

// interface typeProps {
//   isMinimized: boolean;
//   isOpen: boolean;
// }
// const ChatWindow = memo(({ isMinimized, isOpen }: typeProps) => {
//   const session = useSession().data?.user?.id;

//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputValue, setInputValue] = useState("");
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [isVisible, setIsVisible] = useState(false);
//   // ... داخل ChatWidget ...

//   const socketRef = useRef<Socket | null>(null); // "خزنة" هنشيل فيها الاتصال

//   useEffect(() => {
//     if (!session) return;
//     // 1. فتح الاتصال مع سيرفر النود
//     socketRef.current = io("http://localhost:5000");
//     socketRef.current.on("connect", () => {
//       socketRef?.current?.emit(
//         "roomId",
//         "297f5711-f496-4ee8-ae29-18d3a2906e7a",
//       );
//     });

//     socketRef.current.on("receive_message", (data) => {
//       if (data.userId !== session) {
//         // console.log(data.userId);
//         // console.log(session);
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: Date.now().toString(),
//             text: data.message,
//             sender: "user",
//             timestamp: new Date(),
//           },
//         ]);
//       }
//     });

//     return () => {
//       socketRef.current?.disconnect();
//     };
//   }, [session]);

//   const sendToSocket = async () => {
//     if (!session) {
//       handleSendMessage();
//       return;
//     }
//     const myNewMessage = {
//       id: Date.now().toString(),
//       text: inputRef?.current?.value || "",
//       sender: "admin" as const,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, myNewMessage]);

//     const data = {
//       message: inputRef.current?.value,
//       userId: session,
//       //   simple user id
//       roomId: "297f5711-f496-4ee8-ae29-18d3a2906e7a",
//     };

//     setInputValue("");
//     socketRef?.current?.emit("send_message", data);
//   };

//   //  messagesStartRef.current.({ behavior: "smooth" });

//   // Auto scroll to bottom
//   const scrollToBottom = () => {
//     // console.log(messagesEndRef);
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     if (isOpen && !isMinimized) {
//       scrollToBottom();
//       inputRef.current?.focus();
//     }
//   }, [messages, isOpen, isMinimized, scrollToBottom]);

//   const handleSendMessage = useCallback(async () => {
//     if (!inputValue.trim()) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       text: inputValue,
//       sender: "user",
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputValue("");
//     setIsTyping(true);

//     setTimeout(() => {
//       const adminMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         text: "please login before continue",
//         sender: "admin",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, adminMessage]);
//       setIsTyping(false);
//     }, 1500);
//   }, [inputValue]);

//   const handleKeyPress = useCallback(
//     (e: React.KeyboardEvent) => {
//       if (e.key === "Enter" && !e.shiftKey) {
//         e.preventDefault();
//         sendToSocket();
//       }
//     },
//     [sendToSocket],
//   );

//   const [isTyping, setIsTyping] = useState(false);
//   return (
//     <>
//       <div
//         className={`fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 sm:w-lvh ${
//           isMinimized ? "h-16" : "h-[600px]"
//         }`}
//         style={{ maxHeight: "calc(100vh - 100px)" }}
//       >
//         {/* Header */}

//         {/* Messages Area */}
//         {!isMinimized && (
//           <>
//             <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
//               <div className="space-y-4">
//                 {messages.map((message) => (
//                   <div
//                     key={message.id}
//                     className={`flex ${
//                       message.sender === "user" ?
//                         "justify-start"
//                       : "justify-end"
//                     }`}
//                   >
//                     <div
//                       className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
//                         message.sender === "admin" ?
//                           "bg-gradient-to-br from-emerald-500 to-green-600 text-white"
//                         : "bg-white text-gray-800 shadow-sm"
//                       }`}
//                     >
//                       <p className="text-sm leading-relaxed">{message.text}</p>
//                       <p
//                         className={`mt-1 text-xs ${
//                           message.sender === "admin" ?
//                             "text-emerald-100"
//                           : "text-gray-400"
//                         }`}
//                       >
//                         {formatTime(message.timestamp)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Typing Indicator */}
//                 {isTyping && (
//                   <div className="flex justify-start">
//                     <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
//                       <div className="flex gap-1">
//                         <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"></span>
//                         <span
//                           className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"
//                           style={{ animationDelay: "0.1s" }}
//                         ></span>
//                         <span
//                           className="h-2 w-2 animate-bounce rounded-full bg-emerald-500"
//                           style={{ animationDelay: "0.2s" }}
//                         ></span>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div ref={messagesEndRef} />
//               </div>
//             </div>

//             {/* Input Area */}
//             <div className="relative border-t border-gray-200 bg-white p-4">
//               {/* ✅ Emoji Picker */}

//               <button
//                 onClick={sendToSocket}
//                 disabled={!inputValue.trim()}
//                 className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white transition-all hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
//                 aria-label="إرسال الرسالة"
//                 type="button"
//               >
//                 <Send className="h-4 w-4" aria-hidden="true" />
//               </button>
//               <p className="mt-2 text-xs text-gray-500">اضغط Enter للإرسال</p>
//             </div>
//           </>
//         )}
//       </div>
//     </>
//   );
// });

// export default ChatWindow;
