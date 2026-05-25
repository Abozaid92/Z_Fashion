"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

interface UserFiltersProps {
  searchInput: string;
  handleSearchChange: (value: string) => void;
  isFetching: boolean;
  role: string;
  setRole: (role: string) => void;
  status: string;
  setStatus: (status: string) => void;
  userPerPage: number;
  setLimit: (limit: number) => void;
}

export default function UserFilters({
  searchInput,
  handleSearchChange,
  isFetching,
  role,
  setRole,
  status,
  setStatus,
  userPerPage,
  setLimit,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 transition-colors"
        />
        {/* Subtle spinner inside search when fetching */}
        {isFetching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 rounded-full border-2 border-slate-200 border-t-lime-500 animate-spin" />
        )}
      </div>

      {/* Role filter */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-lime-400 cursor-pointer"
      >
        <option value="">All roles</option>
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>

      {/* Status filter */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-lime-400 cursor-pointer"
      >
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="BANNED">Banned</option>
      </select>
    </div>
  );
}
