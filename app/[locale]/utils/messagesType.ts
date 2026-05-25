export interface isDeleverdType {
  isDeliverd?: boolean;
  isDelivered?: boolean;
  recievedId: string;
}
export interface MessageType {
  id: string;
  message: string;
  isRead?: Boolean;
  isDelevired?: isDeleverdType;

  userId: string;
  isMessageSent?: boolean;
  createdAt: Date | string;
}
export interface MessageTypeToMessageItem {
  id: string;
  userId: string;
  sender: "user" | "admin" | string; // Adjust 'admin' based on your other sender types
  message: string;
  isRead: boolean;
  isMessageSent: boolean;
  isDelivered?: boolean;
  isDelevired?: isDeleverdType;
  createdAt: string | Date; // Use Date if you plan to parse it immediately
}
