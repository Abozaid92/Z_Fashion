/**
 * StarRating — zero external dependencies.
 * Fractional fill formula: fillPct = max(0, min(100, (rating - starIndex) * 100))
 * Renders a CSS linearGradient inside each SVG star for pixel-accurate halves/thirds.
 */

import { useTranslations } from "next-intl";

interface StarRatingProps {
  /** 0–5 floating point value */
  rating: number;
  maxStars?: number;
  /** px size of each star */
  size?: number;
  /** show numeric value next to stars */
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 14,
  showValue = false,
  className,
}: StarRatingProps) {
  // Stable id seed so multiple instances don't clash in the same SVG defs
  const seed = Math.round(rating * 1000);

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className ?? ""}`}
      role="img"
      aria-label={`${rating.toFixed(1)} out of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const fillPct = Math.max(0, Math.min(100, (rating - i) * 100));
        const gradId = `sr-${seed}-${i}`;

        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <defs>
              <linearGradient id={gradId} x1="0" x2="1" y1="0" y2="0">
                <stop offset={`${fillPct}%`} stopColor="#F59E0B" />
                <stop offset={`${fillPct}%`} stopColor="#E5E7EB" />
              </linearGradient>
            </defs>
            <path
              d="M10 1 l2.39 4.84 L18 6.76 l-4 3.9 .94 5.5 L10 13.77
                 l-4.94 2.59 .94-5.5 -4-3.9 5.61-.92 Z"
              fill={`url(#${gradId})`}
              stroke={fillPct > 0 ? "#D97706" : "#D1D5DB"}
              strokeWidth={0.6}
            />
          </svg>
        );
      })}

      {showValue && (
        <span
          className="ml-1 tabular-nums text-stone-500"
          style={{ fontSize: size * 0.86 }}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}

// ─── Interactive picker variant (for review forms) ───────────────────────────
interface StarPickerProps {
  value: number;
  onChange: (v: number) => void;
  size?: number;
  className?: string;
}

export function StarPicker({
  value,
  onChange,
  size = 28,
  className,
}: StarPickerProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${className ?? ""}`}
      role="radiogroup"
      aria-label="Select star rating"
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
          aria-pressed={value === s}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded transition-transform hover:scale-110 active:scale-95"
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              d="M10 1 l2.39 4.84 L18 6.76 l-4 3.9 .94 5.5 L10 13.77
                 l-4.94 2.59 .94-5.5 -4-3.9 5.61-.92 Z"
              fill={value >= s ? "#F59E0B" : "#E5E7EB"}
              stroke={value >= s ? "#D97706" : "#D1D5DB"}
              strokeWidth={0.6}
            />
          </svg>
        </button>
      ))}
    </span>
  );
}
