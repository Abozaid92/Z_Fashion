export interface UserNotificationTypes {
  id: string;
  sender: string; // "ADMIN"
  senderName: string; // "الجوكر Gaming"
  senderImage: string; // URL الصورة
  title: string; // العنوان
  description: string; // المحتوى
  isRead: boolean; // حالة القراءة
  createdAt: string; // وقت الإرسال
  updatedAt: string;
  userId: string;
}
export interface NotificationStats {
  totalTargets: number;
  totalOpens: number;
  globalOpenRate: string;
}
