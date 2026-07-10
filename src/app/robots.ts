import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://clartas.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/*/admin/", "/*/settings/", "/*/billing/"],
      },
    ],
    sitemap: `${APP_URL.replace(/\/$/, "")}/sitemap.xml`,
  };
}
