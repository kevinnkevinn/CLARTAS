import { defineRouting } from "next-intl/routing";

/**
 * CLARTAS is a global product. English is the default language.
 * Supported locales: English, Indonesian, Mandarin Chinese, Spanish.
 */
export const locales = ["en", "id", "zh", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
  zh: "中文",
  es: "Español",
};

export function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Default locale (en) uses `/` without prefix — http://localhost:3000 works directly.
  localePrefix: "as-needed",
  localeCookie: {
    name: "NEXT_LOCALE",
  },
});
