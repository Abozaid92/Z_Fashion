import { useTranslations } from "next-intl";
import { ShoppingBasket } from "lucide-react";
import React from "react";

const Header = ({ productCount }: { productCount: number }) => {
  const t = useTranslations("CartHeader" as any);
  return (
    <div className="bg-amber-50 text-center text-black/80 py-8 sm:py-12">
      <div className="container mx-auto text-center px-4 sm:px-6">
        <div className="flex items-center gap-1 justify-center ">
          <div>
            <h1 className="text-3xl text-emerald-500 sm:text-4xl lg:text-5xl font-extrabold">
              {t("title")}
            </h1>
            <p className="text-lime-600 mt-1 text-sm sm:text-base">
              {t("products_in_cart", { count: productCount })}
            </p>
          </div>
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            <ShoppingBasket className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
