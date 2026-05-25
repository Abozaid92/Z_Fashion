import { useTranslations } from "next-intl";
import Image from "next/image";
import { cn, getInitials } from "../../../_lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Avatar — optimized image with accessible initials fallback
// ─────────────────────────────────────────────────────────────────────────────

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
  online?: boolean;
}

const sizeMap: Record<
  AvatarSize,
  { px: number; className: string; text: string }
> = {
  xs: { px: 24, className: "w-6 h-6", text: "text-[9px]" },
  sm: { px: 32, className: "w-8 h-8", text: "text-xs" },
  md: { px: 40, className: "w-10 h-10", text: "text-sm" },
  lg: { px: 48, className: "w-12 h-12", text: "text-base" },
  xl: { px: 64, className: "w-16 h-16", text: "text-lg" },
};

// Deterministic color from name for initials fallback
function getColorFromName(name: string): string {
  const colors = [
    "bg-gradient-to-br from-lime-400 to-emerald-500",
    "bg-gradient-to-br from-emerald-400 to-teal-500",
    "bg-gradient-to-br from-sky-400 to-cyan-500",
    "bg-gradient-to-br from-violet-400 to-purple-500",
    "bg-gradient-to-br from-amber-400 to-orange-500",
    "bg-gradient-to-br from-rose-400 to-pink-500",
    "bg-gradient-to-br from-cyan-400 to-sky-500",
    "bg-gradient-to-br from-indigo-400 to-blue-500",
    "bg-gradient-to-br from-fuchsia-400 to-violet-500",
    "bg-gradient-to-br from-orange-400 to-red-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  name,
  size = "md",
  className,
  online,
}: AvatarProps) {
  const { px, className: sizeClass, text } = sizeMap[size];
  const initials = getInitials(name);
  const colorClass = getColorFromName(name);

  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "rounded-full overflow-hidden ring-[1.5px] ring-white/80 shadow-sm",
          sizeClass,
        )}
        title={name}
      >
        {src ?
          <Image
            src={src}
            alt={name}
            width={px}
            height={px}
            className="object-cover w-full h-full"
            unoptimized={src.includes("dicebear")}
          />
        : <div
            aria-label={name}
            className={cn(
              "w-full h-full flex items-center justify-center font-bold text-white",
              colorClass,
              text,
            )}
          >
            {initials}
          </div>
        }
      </div>
      {online && (
        <span
          aria-label="Online"
          className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-[1.5px] ring-white shadow-sm shadow-emerald-500/40"
        />
      )}
    </div>
  );
}

// ─── Avatar Group ─────────────────────────────────────────────────────────────
interface AvatarGroupProps {
  users: Array<{ name: string; avatar?: string }>;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ users, max = 4, size = "sm" }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((user, i) => (
        <Avatar
          key={i}
          src={user.avatar}
          name={user.name}
          size={size}
          className="ring-[1.5px] ring-white"
        />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-semibold ring-[1.5px] ring-white shadow-sm",
            sizeMap[size].className,
            sizeMap[size].text,
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
