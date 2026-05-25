import { useTranslations } from "next-intl";
import Link from "next/link";
import type { FavoriteProduct } from "@/app/[locale]/_lib/profile";
import { ProductCard } from "@/components/homePage/product-card";
interface FavoritesGridProps {
  favorites: FavoriteProduct[];
  locale: string;
}

export function FavoritesGrid({ favorites, locale }: FavoritesGridProps) {
  const t = useTranslations("profile");

  if (favorites.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          {t("favorites.title")}
        </h2>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            className="w-16 h-16 text-slate-300 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-slate-600 mb-2">{t("favorites.noItems")}</p>
          <p className="text-sm text-slate-500">
            {t("favorites.startBrowsing")}
          </p>
          <Link
            href={`/${locale}/products`}
            className="mt-4 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all"
          >
            {t("favorites.browseProducts")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {t("favorites.title")}
          </h2>
          <p className="text-sm text-slate-500">
            {favorites.length} {t("favorites.items")}
          </p>
        </div>
        {favorites.length > 4 && (
          <Link
            href={`/${locale}/favorites`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            {t("favorites.viewAll")}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {favorites.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            locale={locale}
            {...({ product: product } as any)}
          />
        ))}
      </div>

      {/* View All Button (Mobile) */}
      {favorites.length > 4 && (
        <div className="mt-4 sm:hidden">
          <Link
            href={`/${locale}/favorites`}
            className="w-full py-2.5 px-4 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {t("favorites.viewAll")}
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
