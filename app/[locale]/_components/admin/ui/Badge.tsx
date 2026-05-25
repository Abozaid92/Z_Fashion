import { useTranslations } from "next-intl";
import { cn } from "../../../_lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Badge — renders colored pill labels for statuses, roles, priorities, channels
// ─────────────────────────────────────────────────────────────────────────────

type BadgeVariant =
  | "lime"
  | "emerald"
  | "amber"
  | "rose"
  | "sky"
  | "violet"
  | "slate"
  | "cyan";

type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  lime: "bg-lime-50 text-lime-700 ring-1 ring-lime-200/80",
  emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
  rose: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/80",
  sky: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/80",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/80",
  slate: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80",
  cyan: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200/80",
};

const dotColors: Record<BadgeVariant, string> = {
  lime: "bg-lime-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  slate: "bg-slate-400",
  cyan: "bg-cyan-500",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1 leading-none",
  md: "text-[11px] px-2 py-0.5 gap-1.5 leading-none",
};

export function Badge({
  children,
  variant = "slate",
  size = "md",
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full tracking-wide",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn(
            "rounded-full shrink-0 animate-pulse",
            dotColors[variant],
            size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5",
          )}
        />
      )}
      {children}
    </span>
  );
}

// ─── Convenience mappers ──────────────────────────────────────────────────────

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    pending: { variant: "amber", label: "Pending" },
    processing: { variant: "sky", label: "Processing" },
    shipped: { variant: "violet", label: "Shipped" },
    delivered: { variant: "emerald", label: "Delivered" },
    cancelled: { variant: "slate", label: "Cancelled" },
    refunded: { variant: "rose", label: "Refunded" },
  };
  const config = map[status] ?? { variant: "slate", label: status };
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

export function UserStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    active: { variant: "lime", label: "Active" },
    inactive: { variant: "amber", label: "Inactive" },
    banned: { variant: "rose", label: "Banned" },
  };
  const config = map[status] ?? { variant: "slate", label: status };
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

export function UserRoleBadge({ role }: { role: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    admin: { variant: "violet", label: "Admin" },
    vendor: { variant: "cyan", label: "Vendor" },
    customer: { variant: "slate", label: "Customer" },
  };
  const config = map[role] ?? { variant: "slate", label: role };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    low: { variant: "slate", label: "Low" },
    medium: { variant: "amber", label: "Medium" },
    high: { variant: "rose", label: "High" },
    urgent: { variant: "rose", label: "Urgent" },
  };
  const config = map[priority] ?? { variant: "slate", label: priority };
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

export function TicketStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    open: { variant: "sky", label: "Open" },
    pending: { variant: "amber", label: "Pending" },
    resolved: { variant: "emerald", label: "Resolved" },
    closed: { variant: "slate", label: "Closed" },
  };
  const config = map[status] ?? { variant: "slate", label: status };
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}

export function NotificationStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    sent: { variant: "emerald", label: "Sent" },
    scheduled: { variant: "sky", label: "Scheduled" },
    draft: { variant: "slate", label: "Draft" },
    failed: { variant: "rose", label: "Failed" },
  };
  const config = map[status] ?? { variant: "slate", label: status };
  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
