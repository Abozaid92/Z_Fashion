import { MessageType } from "@/app/[locale]/utils/messagesType";

export const playSoundEffect = (sound: HTMLAudioElement) => {
  sound.currentTime = 0;
  sound.play().catch(() => {});
  // setTimeout(() => scrollS("bottom"), 100);
};
export const getMessageDetails = (data: MessageType) => {
  const newMessage: MessageType = {
    id: crypto.randomUUID(),
    message: data.message,
    isRead: data.isRead,
    isDelevired: data.isDelevired,
    userId: data.userId || "admin",
    createdAt: new Date(data.createdAt || Date.now()),
    isMessageSent: true,
  };

  return newMessage;
};
