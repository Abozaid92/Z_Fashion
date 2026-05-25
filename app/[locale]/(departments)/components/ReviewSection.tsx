"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import Image from "next/image";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import StarRating, { StarPicker } from "./StarRating";
import type { Comment, CommentsPage } from "./product";
import { cn } from "../../_lib/utils";
import { DOMAIN } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RatingStats {
  rating: number;
  count: number;
  percentage: number;
}

interface StatsResponse {
  totalComments: number;
  stats: RatingStats[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const RATING_COLORS = {
  5: "#16a34a", // green-600
  4: "#84cc16", // lime-500
  3: "#eab308", // yellow-500
  2: "#f97316", // orange-500
  1: "#dc2626", // red-600
} as const;

// ─── 1. Ratings Breakdown with Pie Chart & Progress Bars ─────────────────────
interface RatingsBreakdownProps {
  stats: RatingStats[];
  totalReviews: number;
  avgRating: number;
  onWriteReview: () => void;
}

function RatingsBreakdown({
  stats,
  totalReviews,
  avgRating,
  onWriteReview,
}: RatingsBreakdownProps) {
  const t: any = useTranslations();

  // Prepare data for pie chart
  const pieData = stats
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: `${s.rating} Stars`,
      value: s.count,
      rating: s.rating,
    }));

  const recommended = stats
    .filter((s) => s.rating >= 4)
    .reduce((acc, s) => acc + s.count, 0);
  const recommendedPercentage =
    totalReviews > 0 ? Math.round((recommended / totalReviews) * 100) : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left: Progress Bars */}
      <div>
        <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[.08em] text-stone-600">
          {t("ReviewSection.rating_distribution")}
        </h3>
        <div className="space-y-3">
          {stats.map((stat) => (
            <div key={stat.rating} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-[13px] font-medium text-stone-700">
                {stat.rating}{" "}
                {t("ReviewSection.star_label", { count: String(stat.rating) })}
              </span>
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${stat.percentage}%`,
                    backgroundColor:
                      RATING_COLORS[stat.rating as keyof typeof RATING_COLORS],
                  }}
                  role="progressbar"
                  aria-valuenow={stat.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${stat.rating} stars: ${stat.percentage.toFixed(1)}%`}
                />
              </div>
              <span className="w-12 text-right text-[13px] font-medium tabular-nums text-stone-600">
                {stat.count}
              </span>
              <span className="w-12 text-right text-[12px] tabular-nums text-stone-400">
                {stat.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 p-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
              Average Rating
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-[28px] font-bold text-stone-900">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-[13px] text-stone-500">out of 5</span>
            </div>
            <StarRating rating={avgRating} size={16} className="mt-1" />
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
              Total Reviews
            </p>
            <p className="mt-1 text-[28px] font-bold text-stone-900">
              {totalReviews.toLocaleString()}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onWriteReview}
          className="mt-4 w-full rounded-lg bg-stone-900 px-5 py-3 text-[13px] font-semibold text-white transition-all hover:bg-stone-800 active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
        >
          {t("ReviewSection.write_review")}
        </button>
      </div>

      {/* Right: Pie Chart */}
      <div>
        <h3 className="mb-4 text-[13px] font-semibold uppercase tracking-[.08em] text-stone-600">
          {t("ReviewSection.visual_breakdown")}
        </h3>
        {pieData.length > 0 ?
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name?.split(" ")[0]}★: ${((percent || 0) * 100).toFixed(1)}%`
                }
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      RATING_COLORS[entry.rating as keyof typeof RATING_COLORS]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const data = payload[0];
                  return (
                    <div className="rounded-lg border border-stone-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
                      <p className="mb-1 text-[13px] font-semibold text-stone-900">
                        {data.name}
                      </p>
                      <p className="text-[12px] text-stone-600">
                        Reviews: <span className="font-bold">{data.value}</span>
                      </p>
                      <p className="text-[12px] text-stone-600">
                        Share:{" "}
                        <span className="font-bold">
                          {(
                            ((data.value as number) / totalReviews) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </p>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-[12px] font-medium text-stone-700">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        : <div className="flex h-[320px] items-center justify-center rounded-lg border-2 border-dashed border-stone-200">
            <p className="text-[13px] text-stone-400">
              {t("ReviewSection.no_reviews_yet")}
            </p>
          </div>
        }

        <div className="mt-4 rounded-lg bg-green-50 p-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-green-700">
            {t("ReviewSection.customer_recommended")}
          </p>
          <p className="mt-1 text-[32px] font-bold text-green-700">
            {recommendedPercentage}%
          </p>
          <p className="text-[12px] text-green-600">
            {recommended.toLocaleString()} {t("ReviewSection.out_of")}{" "}
            {totalReviews.toLocaleString()} {t("ReviewSection.customers")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Review Card ───────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Comment }) {
  const t: any = useTranslations();
  const [helpful, setHelpful] = useState(0);

  return (
    <article
      className={cn(
        "rounded-xl border bg-white p-5 transition-all duration-500",
        review._optimistic ?
          "border-green-200 shadow-[0_0_0_3px_rgba(22,163,74,.1)]"
        : "border-stone-200",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-stone-100">
            {review.user.image ?
              <Image
                src={review.user.image}
                alt={review.user.name ?? "Reviewer"}
                fill
                className="object-cover"
                sizes="40px"
              />
            : <span className="flex size-full items-center justify-center text-[14px] font-semibold text-stone-600">
                {(review.user.name ?? "?").charAt(0).toUpperCase()}
              </span>
            }
          </div>
          <div>
            <p className="text-[13px] font-semibold text-stone-900">
              {review.user.name ?? t("ReviewSection.anonymous")}
            </p>
            <time
              className="text-[11px] text-stone-400"
              dateTime={review.createdAt}
            >
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
        </div>

        <div className="text-right">
          <StarRating rating={review.rating} size={14} />
          {review._optimistic && (
            <p className="mt-1 text-[10px] font-medium text-green-600">
              ✓ {t("ReviewSection.just_posted")}
            </p>
          )}
        </div>
      </div>

      <p className="mb-3 text-[13px] leading-relaxed text-stone-700">
        {review.content}
      </p>

      <button
        type="button"
        onClick={() => setHelpful((n) => n + 1)}
        aria-label={t("ReviewSection.mark_helpful_aria", {
          count: helpful > 0 ? String(helpful) : undefined,
        })}
        className="inline-flex items-center gap-1.5 rounded-md border border-stone-200 px-3 py-1.5 text-[11px] text-stone-500 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
      >
        <span aria-hidden="true">👍</span>
        {t("ReviewSection.helpful")}
        {helpful > 0 && ` (${helpful})`}
      </button>
    </article>
  );
}

// ─── 3. Review Form with Optimistic Updates ──────────────────────────────────
interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const t: any = useTranslations();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (payload: { rating: number; content: string }) => {
      const res = await fetch("/api/products/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...payload }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit review");
      }
      return res.json();
    },

    // ① Optimistic updates for both comments AND stats
    onMutate: async ({ rating: r, content: c }) => {
      const commentsKey = ["comments", productId];
      const statsKey = ["commentsStats", productId];

      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: commentsKey });
      await queryClient.cancelQueries({ queryKey: statsKey });

      // Get snapshots
      const commentsSnapshot = queryClient.getQueryData(commentsKey);
      const statsSnapshot = queryClient.getQueryData(statsKey);

      // Create optimistic comment
      const optimistic: Comment = {
        id: `opt-${Date.now()}`,
        content: c,
        rating: r,
        createdAt: new Date().toISOString(),
        user: { name: "You", image: null },
        _optimistic: true,
      };

      // Update comments list
      queryClient.setQueryData(
        commentsKey,
        (old: { pages: CommentsPage[]; pageParams: unknown[] } | undefined) => {
          if (!old) return old;
          const pages = [...old.pages];
          pages[0] = {
            ...pages[0],
            comments: [optimistic, ...(pages[0]?.comments ?? [])],
          };
          return { ...old, pages };
        },
      );

      // Update stats optimistically
      queryClient.setQueryData(statsKey, (old: StatsResponse | undefined) => {
        if (!old) return old;

        const newTotal = old.totalComments + 1;
        const newStats = old.stats.map((stat) => {
          if (stat.rating === r) {
            const newCount = stat.count + 1;
            const newPercentage = (newCount / newTotal) * 100;
            return {
              ...stat,
              count: newCount,
              percentage: parseFloat(newPercentage.toFixed(1)),
            };
          }
          // Recalculate percentages for other ratings
          const newPercentage = (stat.count / newTotal) * 100;
          return {
            ...stat,
            percentage: parseFloat(newPercentage.toFixed(1)),
          };
        });

        return {
          totalComments: newTotal,
          stats: newStats,
        };
      });

      return { commentsSnapshot, statsSnapshot };
    },

    // ② Invalidate and refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", productId] });
      queryClient.invalidateQueries({ queryKey: ["commentsStats", productId] });
      setRating(0);
      setContent("");
      onSuccess();
    },

    // ③ Rollback on error
    onError: (_err, _vars, ctx) => {
      if (ctx?.commentsSnapshot) {
        queryClient.setQueryData(["comments", productId], ctx.commentsSnapshot);
      }
      if (ctx?.statsSnapshot) {
        queryClient.setQueryData(
          ["commentsStats", productId],
          ctx.statsSnapshot,
        );
      }
    },
  });

  const canSubmit = rating > 0 && content.trim().length > 0;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-[16px] font-semibold text-stone-900">
        {t("ReviewSection.form.title")}
      </h3>

      <div className="mb-4">
        <label
          htmlFor="rating-picker"
          className="mb-2 block text-[12px] font-medium text-stone-700"
        >
          {t("ReviewSection.form.your_rating")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <div id="rating-picker">
          <StarPicker value={rating} onChange={setRating} size={28} />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="review-content"
          className="mb-2 block text-[12px] font-medium text-stone-700"
        >
          {t("ReviewSection.form.your_review")}{" "}
          <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("ReviewSection.form.placeholder")}
          rows={5}
          className="w-full resize-y rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-[13px] leading-relaxed text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-200"
          aria-describedby="review-hint"
        />
        <p id="review-hint" className="mt-1 text-[11px] text-stone-500">
          {t("ReviewSection.form.min_chars")}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => canSubmit && mutate({ rating, content })}
          disabled={!canSubmit || isPending}
          aria-busy={isPending}
          className={cn(
            "rounded-lg px-6 py-2.5 text-[13px] font-semibold text-white transition-all",
            canSubmit && !isPending ?
              "bg-stone-900 hover:bg-stone-800 active:scale-[.98]"
            : "cursor-not-allowed bg-stone-300",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2",
          )}
        >
          {isPending ?
            <span className="flex items-center gap-2">
              <svg
                className="size-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="31.4"
                  strokeDashoffset="10"
                />
              </svg>
              {t("ReviewSection.form.submitting")}
            </span>
          : t("ReviewSection.form.submit")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-stone-200 px-5 py-2.5 text-[13px] font-medium text-stone-600 hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
        >
          {t("ReviewSection.form.cancel")}
        </button>
      </div>
    </div>
  );
}

// ─── 4. Main ReviewSection with Infinite Scroll ──────────────────────────────
interface ReviewSectionProps {
  productId: string;
  productSlug: string;
}

export default function ReviewSection({
  productId,
  productSlug,
}: ReviewSectionProps) {
  const t: any = useTranslations();
  const [showForm, setShowForm] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fetch comments with infinite scroll
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<CommentsPage>({
      queryKey: ["comments", productId],
      queryFn: async ({ pageParam }) => {
        const url =
          pageParam ?
            `${DOMAIN}/api/products/comments?productId=${productId}&productSlug=${productSlug}&cursor=${pageParam}`
          : `${DOMAIN}/api/products/comments?productId=${productId}&productSlug=${productSlug}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load reviews");
        return res.json();
      },
      initialPageParam: null as string | null,
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      staleTime: Infinity, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      gcTime: Infinity,
    });

  // Fetch stats
  const { data: statsData, isLoading: isStatsLoading } =
    useQuery<StatsResponse>({
      queryKey: ["commentsStats", productId],
      queryFn: async () => {
        const res = await fetch(
          `${DOMAIN}/api/products/comments/stats?productId=${productId}`,
        );

        if (!res.ok) throw new Error("Failed to load stats");
        return res.json();
      },
      staleTime: Infinity, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      gcTime: Infinity,
    });

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1, rootMargin: "100px" },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allComments = data?.pages.flatMap((p) => p.comments) ?? [];

  // Calculate average rating
  const avgRating =
    statsData ?
      statsData.stats.reduce((acc, stat) => acc + stat.rating * stat.count, 0) /
      (statsData.totalComments || 1)
    : 0;

  return (
    <section aria-labelledby="reviews-heading" className="space-y-8">
      {/* Section header */}
      <div>
        <h2
          id="reviews-heading"
          className="mb-1 text-[26px] font-bold text-stone-900"
          style={{ fontFamily: "Georgia,'Times New Roman',serif" }}
        >
          {t("ReviewSection.header.title")}
        </h2>
        <p className="text-[13px] text-stone-500">
          {statsData?.totalComments.toLocaleString() ?? 0}{" "}
          {t("ReviewSection.header.verified_purchases")}
        </p>
      </div>

      {/* Stats Loading Skeleton */}
      {isStatsLoading && (
        <div className="rounded-xl border border-stone-200 bg-white p-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-6 animate-pulse rounded bg-stone-100"
                />
              ))}
            </div>
            <div className="h-[400px] animate-pulse rounded-lg bg-stone-100" />
          </div>
        </div>
      )}

      {/* Ratings breakdown with charts */}
      {!isStatsLoading && statsData && (
        <div className="rounded-xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <RatingsBreakdown
            stats={statsData.stats}
            totalReviews={statsData.totalComments}
            avgRating={avgRating}
            onWriteReview={() => setShowForm(true)}
          />
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!showForm && !isStatsLoading && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg border-2 border-stone-900 px-5 py-2.5 text-[12px] font-bold uppercase tracking-widest text-stone-900 transition-all hover:bg-stone-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
        >
          <span aria-hidden="true">+</span>
          {t("ReviewSection.write_review")}
        </button>
      )}

      {/* Comments Loading Skeleton */}
      {isLoading && (
        <div
          className="space-y-4"
          aria-busy="true"
          aria-label="Loading reviews"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-stone-100"
            />
          ))}
        </div>
      )}

      {/* Review list */}
      {!isLoading && allComments.length > 0 && (
        <div className="space-y-4" role="list">
          {allComments.map((comment) => (
            <ReviewCard key={comment.id} review={comment} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && allComments.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 p-12 text-center">
          <p className="text-[15px] font-medium text-stone-600">
            {t("ReviewSection.no_reviews_yet")}
          </p>
          <p className="mt-1 text-[13px] text-stone-500">
            {t("ReviewSection.be_first")}
          </p>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} aria-hidden="true" className="h-1" />

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4" aria-live="polite">
          <span className="flex items-center gap-2 text-[13px] text-stone-500">
            <svg
              className="size-4 animate-spin text-stone-600"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="31.4"
                strokeDashoffset="10"
              />
            </svg>
            {t("ReviewSection.loading_more")}
          </span>
        </div>
      )}

      {/* End of list */}
      {!hasNextPage && allComments.length > 0 && (
        <p className="text-center text-[12px] text-stone-400">
          {t("ReviewSection.all_reviews_loaded", {
            count: statsData?.totalComments.toLocaleString() ?? 0,
          })}
        </p>
      )}
    </section>
  );
}
