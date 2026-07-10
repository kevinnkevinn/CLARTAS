import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://clartas.com").replace(/\/$/, "");

const PUBLIC_PATHS = ["", "/pricing", "/sign-in", "/sign-up", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of PUBLIC_PATHS) {
      const prefix = locale === "en" ? "" : `/${locale}`;
      entries.push({
        url: `${APP_URL}${prefix}${path || "/"}`,
        lastModified: new Date(),
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.7,
      });
    }
  }

  return entries;
}
