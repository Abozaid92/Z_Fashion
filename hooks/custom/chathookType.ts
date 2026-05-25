import { MessageType } from "@/app/[locale]/utils/messagesType";
import { InputAreaHandle } from "@/components/chat/InputArea";

export interface ChatHookProps {
  socket: any; // يفضل استخدام النوع الصحيح من socket.io-client
  session: string | null | undefined;
  sessionRef: React.MutableRefObject<string | null | undefined>;
  callSetDataInCashFn: (data: any, type: "sender" | "reciever") => void;
  scrollS?: (type: "bottom" | "nearBy") => void;
}
export interface MessageSentHookProps {
  socket: any;
  callupdataDataInCash: (messageId: string, data: MessageType) => void;
}

export interface UserStatusHookProps {
  socket: any;
  session: string | null | undefined;
  isOpen: boolean;
}

export interface TypingStatusHookProps {
  socket: any;
  setIsTyping: (status: boolean) => void;
}
export interface InfiniteScrollHookProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  scrollS?: (type: "bottom" | "nearBy") => void;
}
export interface joinToRoomHook {
  socket: any;
  userId: string;
}
