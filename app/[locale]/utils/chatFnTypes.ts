import { RefObject } from "react";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter"; // لو بتستخدم الإصدارات الجديدة
import { InputAreaHandle } from "@/components/chat/InputArea";

interface newMessageType {
  id: string;
  message: string;
  userId: string | undefined;
  isMessageSent: boolean;
  isRead: boolean;
  createdAt: Date;
}

export interface sendToSocketParams {
  inputAreaRef: RefObject<InputAreaHandle | null>;
  userId: string | undefined;
  adminId?: string | undefined;
  adminName?: string | undefined;
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  callSetDataInCashFn: (myNewMessage: newMessageType) => void;
  sessionDetails: typeSessionDetails | undefined;
}
interface typeSessionDetails {
  name?: string | null | undefined;
  image?: string | null | undefined;
}
