"use client";

import Link from "next/link";
import { Mail, Phone, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("Footer" as any);

  const links = [
    { label: t("support.contact_us"), href: "/about" },
    { label: t("support.faqs"), href: "/about" },
    { label: t("company.about"), href: "/about" },
  ];

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top */}
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              {t("support.title")}
            </h3>
            <ul className="space-y-2">
              {links.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              {t("contact.title")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:shadatucme@gmail.com"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  <Mail className="w-4 h-4" />
                  shadatucme@gmail.com
                </a>
              </li>

              <li>
                <a
                  href="https://wa.me/201060382482"
                  target="_blank"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  <Phone className="w-4 h-4" />
                  +20 106 038 2482
                </a>
              </li>

              <li>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  <Linkedin className="w-4 h-4" />
                  {t("contact.linkedin")}
                </a>
              </li>
            </ul>
          </div>

          {/* Branding */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Brand</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-xs">
                Simple, clean and modern experience for your users.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-200 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            {t("bottom.copy", {
              year: String(new Date().getFullYear()),
            })}
          </p>

          <div className="flex gap-2 text-xs text-slate-400">
            <span>VISA</span>
            <span>•</span>
            <span>MC</span>
            <span>•</span>
            <span>AMEX</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
