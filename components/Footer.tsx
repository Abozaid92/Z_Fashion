"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  const t = useTranslations("Footer" as any);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FaGlobe className="text-blue-500 text-2xl" />
              <span className="text-xl font-bold text-white">
                {t("brand_name")}
              </span>
            </div>
            <p className="text-sm text-gray-400">{t("brand_description")}</p>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t("sections.about_us")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="hover:text-blue-400 transition-colors text-sm"
                >
                  {t("links.our_story")}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-blue-400 transition-colors text-sm"
                >
                  {t("links.careers")}
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="hover:text-blue-400 transition-colors text-sm"
                >
                  {t("links.press")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t("sections.customer_service")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-400 transition-colors text-sm"
                >
                  {t("links.contact_us")}
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="hover:text-blue-400 transition-colors text-sm"
                >
                  {t("links.shipping_info")}
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="hover:text-blue-400 transition-colors text-sm"
                >
                  {t("links.returns")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {t("sections.follow_us")}
            </h3>
            <div className="flex gap-4">
              <motion.a
                whileHover={{ scale: 1.2 }}
                href="#"
                className="text-2xl hover:text-blue-400 transition-colors"
                aria-label={t("social.facebook")}
              >
                <FaFacebook />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2 }}
                href="#"
                className="text-2xl hover:text-blue-400 transition-colors"
                aria-label={t("social.twitter")}
              >
                <FaTwitter />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2 }}
                href="#"
                className="text-2xl hover:text-blue-400 transition-colors"
                aria-label={t("social.instagram")}
              >
                <FaInstagram />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2 }}
                href="#"
                className="text-2xl hover:text-blue-400 transition-colors"
                aria-label={t("social.youtube")}
              >
                <FaYoutube />
              </motion.a>
            </div>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm mb-2">{t("newsletter.title")}</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t("newsletter.placeholder")}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {t("newsletter.subscribe_button")}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            © {currentYear} {t("copyright.brand")}.{" "}
            {t("copyright.rights_reserved")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
