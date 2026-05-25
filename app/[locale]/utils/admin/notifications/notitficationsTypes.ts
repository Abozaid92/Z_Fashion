import { Role, NotificationType } from "@prisma/client";

export interface NotificationItem {
  id: string;
  sender: Role;
  title: string;
  description: string;
  senderImage: string | null;
  senderName: string;
  opens_count: number;
  targetUsers: number;
  createdAt: string;
  updatedAt: string;
  notificationTypes: NotificationType[];
  pushImage?: string | undefined;
  pushUrl?: string | undefined;
}

export interface typeResponse {
  notifications: NotificationItem[];
  total: number;
}

export interface CreateNotifPayload {
  title: string;
  description: string;
  senderName: string;
  senderImage?: string;
  sender?: Role;
  notificationType: NotificationType[];
  pushUrl?: string | undefined;
  pushImage?: string | undefined;
}
