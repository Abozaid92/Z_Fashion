"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useShowcasectgImage } from "@/hooks/use-showcase";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=80";

export function CategoryGrid() {
  const t = useTranslations("CategoryGrid" as any);
  // 1. سحب البيانات من الـ Cache بتاع TanStack Query
  const { data: categoryGroups } = useShowcasectgImage();
  // console.log("Showcase Category Groups:", categoryGroups);
  // لو مفيش داتا لسه أو الداتا فاضية، ممكن نرجع null أو هيكل فاضي (الـ Suspense برة هيتولى الـ Loading)
  if (!categoryGroups || categoryGroups.length === 0) {
    return null;
  }

  // 2. تجهيز الداتا عشان تناسب شكل الـ Grid
  // هناخد أول 3 مجموعات بس عشان التقسيمة بتاعتنا (1 كبير شمال، 2 صغير يمين)
  const gridItems = categoryGroups.slice(0, 3).map((ctgImage, index) => {
    // هنجيب بيانات القسم من أول منتج في المجموعة

    return {
      id: ctgImage?.slug || `cat-${index}`,
      name: ctgImage?.name || "CATEGORY",
      sub: "ctgDescribtion", // لو عندك Subtitle في الداتا بيز حطه هنا
      href: `/products?cat=${ctgImage?.slug}`,
      image: ctgImage?.image,
      // السحر كله هنا: أول عنصر بياخد صفين (الصورة الطويلة)، والباقي صف واحد
      span:
        index === 0 ?
          "md:col-span-1 md:row-span-2"
        : "md:col-span-1 md:row-span-1",
    };
  });

  return (
    <section className="bg-stone-100 p-2 md:p-4" aria-label="Shop by category">
      <div
        className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-2 md:gap-4 h-auto md:h-[600px] lg:h-[750px]"
        role="list"
      >
        {gridItems.map((item, i) => {
          // شرط التحقق: لو الصورة بـ null، حط الصورة البديلة
          const safeImageSrc = item.image ? item.image : FALLBACK_IMAGE;

          return (
            <article
              key={item.id}
              className={`group relative overflow-hidden rounded-md ${item.span} min-h-[350px] md:min-h-0 w-full h-full`}
              role="listitem"
            >
              <Image
                quality={100}
                src={safeImageSrc}
                alt={`Shop ${item.name}`}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                sizes={
                  item.span.includes("row-span-2") ?
                    "(max-width: 768px) 100vw, 50vw" // الصورة الكبيرة
                  : "(max-width: 768px) 100vw, 25vw" // الصور الصغيرة
                }
                priority={i === 0}
              />

              <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/40" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 z-10">
                <h2
                  className="font-display font-black text-white text-center tracking-tight leading-none drop-shadow-md transition-transform duration-300 group-hover:-translate-y-2 uppercase"
                  style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
                >
                  {t(item.name)}
                </h2>

                <div className="overflow-hidden h-0 group-hover:h-auto transition-all duration-300">
                  <div className="flex flex-col items-center gap-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                    <p className="text-white text-sm text-center font-medium max-w-[200px] drop-shadow-sm">
                      {t(item.sub)}
                    </p>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/90 backdrop-blur-sm text-stone-900 text-[12px] font-extrabold tracking-widest uppercase rounded-none hover:bg-black hover:text-white transition-all duration-300"
                    >
                      {t("shop_category")}
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href={item.href}
                className="absolute inset-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-lime-500 focus-visible:ring-inset z-20"
                aria-label={`${t("categories")}: ${item.name}`}
                tabIndex={-1}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
