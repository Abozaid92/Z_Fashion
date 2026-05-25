"use client";

import { useTranslations } from "next-intl";
import PaginationComponent from "./Pagination";
import { useQueryState } from "nuqs";
import { useOrdersCount } from "@/hooks/useOrdersCount";

const PaginationWhole = () => {
  const [status] = useQueryState("status");

  const { data: count, isLoading, isError } = useOrdersCount(status);

  if (isLoading) {
    return (
      <div className="text-center p-5 text-emerald-600 animate-pulse">
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

export default PaginationWhole;
