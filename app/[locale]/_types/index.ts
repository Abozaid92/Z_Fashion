// ─────────────────────────────────────────────────────────────────────────────
// Z_Fashion ADMIN — Global TypeScript Types
// Swap: replace dummy arrays with → await prisma.model.findMany()
// ─────────────────────────────────────────────────────────────────────────────

// ─── User ─────────────────────────────────────────────────────────────────────
export type UserStatus = "active" | "inactive" | "banned";
export type UserRole = "admin" | "customer" | "vendor";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  country: string;
  joinedAt: string;
  totalOrders: number;
  totalSpent: number;
  lastActive: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: { id: string; name: string; email: string; avatar: string };
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export type ProductCategory =
  | "Electronics"
  | "Apparel"
  | "Home & Garden"
  | "Sports"
  | "Books"
  | "Beauty";

export type ProductStatus = "active" | "draft" | "archived";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: ProductCategory;
  status: ProductStatus;
  inventory: number;
  sku: string;
  images: string[];
  tags: string[];
  createdAt: string;
}

export interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: ProductCategory;
  status: ProductStatus;
  inventory: number;
  sku: string;
  tags: string;
}

// ─── Analytics / Charts ───────────────────────────────────────────────────────
export interface ChartDataPoint {
  date: string;
  Revenue: number;
  Orders: number;
}

export interface GeoDataPoint {
  country: string;
  countryCode: string; // ISO Alpha-3 for react-simple-maps
  value: number;
}

export interface ChartConfig {
  id: string;
  title: string;
  description: string;
  type: "area" | "bar" | "line" | "donut";
  color: string;
  icon: string;
  data: ChartDataPoint[];
  summary: string;
  change: number;
  value: string;
  unit?: string;
}

// ─── Support / Chat ───────────────────────────────────────────────────────────
export type MessageSender = "user" | "admin";
export interface ChatMessage {
  id: string;
  message: string;
  userId: string;
  isRead: boolean;
  createdAt: string | Date;
}

export interface SupportTicket {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string; // غيرتها لـ image عشان تماشي الـ Payload اللي جاي من السوكيت
  };
  userId: string; // مهم جداً عشان الـ Optimistic Update
  subject?: string; // خليتها اختيارية لأن الرسالة العالمية ممكن متجبش الـ Subject
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";

  // التعديل الجوهري هنا عشان يتماشى مع الـ Infinite Query اللي عملناها
  messages: ChatMessage[];

  // الـ _count دي مهمة جداً عشان الـ Optimistic Update اللي كتبناه بيعتمد عليها
  _count: {
    messages: number;
  };

  createdAt: string | Date;
  updatedAt: string | Date;
  category?: string;

  // الحقول دي ممكن تخليها لو محتاجها في الـ UI بس الـ Logic بيعتمد على اللي فوق
  lastMessage?: string;
  unreadCount?: number;
}

export interface InfiniteTicketsResponse {
  pages: SupportTicket[][];
  pageParams: any[];
}
// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationChannel = "push" | "email" | "sms" | "in-app";
export type NotificationSegment = "all" | "active" | "inactive" | "vip";
export type NotificationStatus = "draft" | "scheduled" | "sent" | "failed";

export interface Notification {
  id: string;
  title: string;
  body: string;
  channels: NotificationChannel[];
  segment: NotificationSegment;
  scheduledAt?: string;
  sentAt?: string;
  status: NotificationStatus;
  reach: number;
  openRate?: number;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
  description?: string;
  allDay?: boolean;
}

// ─── Table Sorting ────────────────────────────────────────────────────────────
export type SortDirection = "asc" | "desc";

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  exact?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}
