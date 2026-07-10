import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * CLARTAS supports two build targets:
 *
 * 1. Web (default): a full Next.js server with secure API route handlers
 *    (AI proxy, Paddle webhooks, uploads). Deploy to Vercel.
 *
 * 2. Mobile (BUILD_TARGET=mobile): a static export bundled by Capacitor for
 *    iOS / Android. Static export CANNOT run server-side API routes, so the
 *    mobile app must talk to the deployed web backend via NEXT_PUBLIC_APP_URL.
 *    See README "Mobile build guide".
 */
const isMobileBuild = process.env.BUILD_TARGET === "mobile";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const baseConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

const mobileConfig: NextConfig = {
  ...baseConfig,
  output: "export",
  images: {
    unoptimized: true,
  },
  // Static export tidak mendukung headers() dinamis — diabaikan saat build mobile.
  headers: undefined,
};

let nextConfig: NextConfig = isMobileBuild ? mobileConfig : baseConfig;

if (process.env.ANALYZE === "true") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withBundleAnalyzer = require("@next/bundle-analyzer")({ enabled: true });
  nextConfig = withBundleAnalyzer(nextConfig);
}

export default withNextIntl(nextConfig);
