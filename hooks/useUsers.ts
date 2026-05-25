// app/admin/users/_hooks/useUsers.ts
"use client";

import { useEffect, useRef, useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { parseAsString, useQueryStates } from "nuqs";
import axios from "axios";
import type {
  UserRow,
  UpdateUserStatusPayload,
} from "@/app/[locale]/utils/AllUserType";
import { DOMAIN } from "@/lib/constants";

export const usersParsers = {
  search: parseAsString.withDefault(""),
  role: parseAsString.withDefault(""),
  status: parseAsString.withDefault(""),
};

export const usersKeys = {
  all: ["users"] as const,
  list: (filters: any) => ["users", "list", filters] as const,
};

export async function fetchUsers(filters: any) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.role) params.set("role", filters.role);
  if (filters.status) params.set("status", filters.status);

  const { data } = await axios.get(
    `${DOMAIN}/api/users/details?${params.toString()}`,
  );
  return data;
}

export async function patchUserStatus(payload: {
  status: string;
  userId: string;
}) {
  const res = await axios.patch(`${DOMAIN}/api/users/details`, {
    status: payload.status,
    userId: payload.userId,
  });
  return res.data;
}

function normalizeAndEnrichData(rawData: any): {
  users: UserRow[];
} {
  if (!rawData) return { users: [] };

  const usersArray: any[] =
    Array.isArray(rawData) ? rawData : rawData.users || [];

  const enrichedUsers: UserRow[] = usersArray.map((user) => {
    const safeOrders = Array.isArray(user.orders) ? user.orders : [];
    const spent = safeOrders
      .filter((o: any) => o.status !== "CANCELLED")
      .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    return { ...user, totalSpent: spent };
  });

  return { users: enrichedUsers };
}

export function useUsers() {
  const [urlFilters, setUrlFilters] = useQueryStates(usersParsers, {
    shallow: true,
  });

  const [searchInput, setSearchInput] = useState(urlFilters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setUrlFilters({ search: value });
    }, 300);
  };

  useEffect(() => {
    setSearchInput(urlFilters.search);
  }, [urlFilters.search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const filters = {
    search: urlFilters.search,
    role: urlFilters.role,
    status: urlFilters.status,
  };

  const queryResult = useQuery({
    queryKey: ["users", "list", filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 60 * 60 * 24,
    gcTime: 60 * 60 * 24 * 100,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (prev) => prev,
    select: normalizeAndEnrichData,
  });

  const safeData = queryResult.data || { users: [] };

  const setRole = (r: string) => setUrlFilters({ role: r });
  const setStatus = (s: string) => setUrlFilters({ status: s });

  return {
    ...queryResult,
    users: safeData.users,
    filters,
    searchInput,
    handleSearchChange,
    setRole,
    setStatus,
  };
}

export async function prefetchUsers(queryClient: QueryClient, filters: any) {
  await queryClient.prefetchQuery({
    queryKey: ["users", "list", filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 30_0000,
  });
}
