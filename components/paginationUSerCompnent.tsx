// app/admin/users/_components/UsersPaginationWhole.tsx
"use client";

import { useTranslations } from "next-intl";
import PaginationComponent from "./Pagination";
import { parseAsString, useQueryStates } from "nuqs";
import { useUsersCount } from "@/hooks/useUsersCount";

// دي البارسرز عشان نعلم nuqs إزاي يقرأ القيم من الرابط
const usersParsers = {
  search: parseAsString.withDefault(""),
  role: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
};

const UsersPaginationWhole = () => {
  // 1. بنسحب كل الفلاتر مرة واحدة من الـ URL
  const [{ search, role, status }] = useQueryStates(usersParsers);

  // 2. بنبعتهم للهوك اللي لسه عاملينه
  const {
    data: count,
    isLoading,
    isError,
  } = useUsersCount({
    search: search || null,
    role: role || null,
    status: status || null,
  });

  // 3. نفس الستايل اللي إنت عملته في الأوردرز بالظبط (Emerald)
  if (isLoading) {
    return (
      <div className="text-center p-5 text-emerald-600 animate-pulse font-medium">
        Loading count...
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <div className="w-full">
      <PaginationComponent count={count ?? 0} />
    </div>
  );
};

export default UsersPaginationWhole;
