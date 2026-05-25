// hooks/useUsersCount.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// بنحدد شكل الفلاتر اللي الهوك هيستقبلها
interface UsersCountFilters {
  search: string | null;
  role: string | null;
  status: string | null;
}

const fetchUsersCount = async (filters: UsersCountFilters): Promise<number> => {
  const params = new URLSearchParams();

  // لو الفلتر موجود، بنضيفه للـ URL
  if (filters.search) params.append("search", filters.search);
  if (filters.role) params.append("role", filters.role);
  if (filters.status) params.append("status", filters.status);

  // تأكد إن المسار ده هو نفس مسار الـ API اللي إنت بعته
  const { data } = await axios.get(`/api/users/count?${params.toString()}`);

  // بما إن الباك إند بيرجع الرقم مباشرة، فـ data هي الرقم
  return data;
};

export const useUsersCount = (filters: UsersCountFilters) => {
  return useQuery<number>({
    queryKey: ["users-count", filters], // حطينا الفلاتر في الـ Key عشان لو اتغيرت يجيب داتا جديدة
    queryFn: () => fetchUsersCount(filters),
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
