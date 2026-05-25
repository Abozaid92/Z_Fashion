"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useQueryState, parseAsString } from "nuqs";

const StatusFilter = () => {
  const t = useTranslations("AdminStatusFilter" as any);

  const ORDER_STATUSES_OPTIONS = [
    { value: "PENDING", label: t("statuses.pending") },
    { value: "PROCESSING", label: t("statuses.processing") },
    { value: "SHIPPED", label: t("statuses.shipped") },
    { value: "DELIVERED", label: t("statuses.delivered") },
    { value: "CANCELLED", label: t("statuses.cancelled") },
  ];
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );
  const [, setPage] = useQueryState("orderNumber"); // هنجيب الـ setter بس
  return (
    <select
      aria-label={t("filter_aria_label")}
      value={status}
      onChange={(e) => {
        setStatus(e.target.value);
        setPage("1");
      }}
      className="text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 outline-none focus:border-lime-400 cursor-pointer"
    >
      <option value="">{t("all_statuses")}</option>
      {ORDER_STATUSES_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
};

export default StatusFilter;
