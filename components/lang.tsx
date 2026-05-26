import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Flag from "react-world-flags";

import React, { useState } from "react";

const locales = [
  { code: "ar", name: "العربية", flag: "🇪🇬", flagCode: "EGY" },
  { code: "en", name: "English", flag: "🇺🇸", flagCode: "USA" },
  { code: "fr", name: "Français", flag: "🇫🇷", flagCode: "FRA" },
  { code: "de", name: "Deutsch", flag: "🇩🇪", flagCode: "DEU" },
  { code: "zh", name: "中文", flag: "🇨🇳", flagCode: "CHN" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳", flagCode: "IND" },
  { code: "es", name: "Español", flag: "🇪🇸", flagCode: "ESP" },
  { code: "ru", name: "Русский", flag: "🇷🇺", flagCode: "RUS" },
];
const Lang = () => {
  const locale = useLocale(); // current locale code (ar-en-etc)
  const pathname = usePathname();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const currentLocale = locales.find((l) => l.code === locale) || locales[0];
  return (
    <div className="flex items-center gap-2 group">
      <motion.div
        onClick={() => setIsLangOpen(!isLangOpen)}
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.5 }}
        className="w-10 h-10 bg-gradient-to-br from-green-500 to-lime-600 rounded-full flex items-center justify-center"
      >
        <Globe className="text-white cursor-pointer text-xl" />
      </motion.div>
      <div className="relative cursor-pointer">
        <button
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="flex items-center cursor-pointer text-black gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl ">
            {" "}
            <Flag
              code={currentLocale.flagCode}
              alt={currentLocale.name}
              className="w-4 h-4"
            />
          </span>
          <span className="text-xl">{currentLocale.flag}</span>
          <span className="hidden sm:inline text-sm font-medium">
            {currentLocale.name}
          </span>
        </button>

        {isLangOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2  sm:-mr-72  sm:w-44 md:w-52 lg:w-60 bg-white rounded-xl md:-mr-40  shadow-xl py-2 border border-gray-200"
          >
            {locales.map((loc) => (
              <Link
                key={loc.code}
                href={pathname}
                locale={loc.code}
                onClick={() => setIsLangOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-black hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">
                  <Flag
                    code={loc.flagCode}
                    alt={loc.name}
                    className="w-4 h-4"
                  />
                </span>
                <span className="text-xl ">{loc.flag}</span>
                <span className="text-sm font-medium">{loc.name}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Lang;
