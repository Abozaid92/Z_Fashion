// app/admin/users/_types/users.types.ts

// 1. تعديل شكل الأوردر عشان يتماشى مع الـ Select اللي عملناه في الـ service
export type UserOrder = {
  totalAmount: number;
  status: string;
};

// 2. الشكل الخام اللي راجع من الداتابيز (Prisma Output)
export type UserFromAPI = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BANNED";
  country: string | null; // ضيفنا الدولة
  createdAt: string;
  updatedAt: string; // موجودة في الـ JSON بتاعك

  // prisma _count feature
  _count?: {
    order: number;
  };

  // المصفوفة اللي بنحسب منها الـ totalSpent
  order: UserOrder[];
};

// 3. الشكل النهائي اللي الـ UI بيتعامل معاه (بعد الـ Normalization في الهوك)
export type UserRow = UserFromAPI & {
  totalSpent: number;
  // بنحول اسم "order" لـ "orders" لو حابب للتسهيل،
  // بس هنمشيها "order" زي ما البريزما بتبعتها
};

// 4. الرد اللي راجع من الـ API (Envelope)
export type UsersAPIResponse = {
  users: UserFromAPI[];
  // بما إننا فصلنا الـ Count في ريكوست لوحده، ممكن تسيب دول أو تشيلهم
  // بس خليهم عشان لو قررت تدمجهم مستقبلاً
  total?: number;
};

// 5. الفلاتر (Nuqs)
export type UsersFilters = {
  userNumber: number;
  search: string;
  role: string; // "" | "USER" | "ADMIN"
  status: string; // "" | "ACTIVE" | "BANNED"
};

// 6. الأكشنز (Status Update)
export type UpdateUserStatusPayload = {
  userId: string;
  status: "ACTIVE" | "BANNED";
};
