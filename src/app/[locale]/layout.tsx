import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { routing, isValidLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://clartas.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "CLARTAS — Commerce Content OS",
    template: "%s · CLARTAS",
  },
  description:
    "CLARTAS is the Commerce Content OS for global sellers: AI photo editing, listing copy, video ads, compliance checks, and multi-marketplace export.",
  applicationName: "CLARTAS",
  keywords: [
    "e-commerce",
    "product photography",
    "AI editor",
    "Shopee",
    "Tokopedia",
    "Amazon",
    "marketplace listing",
    "MSME",
  ],
  authors: [{ name: "CLARTAS" }],
  creator: "CLARTAS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "CLARTAS",
    title: "CLARTAS — Commerce Content OS",
    description:
      "From product photo to published listing — AI editing, copy, video, and multi-marketplace export for global sellers.",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "CLARTAS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CLARTAS — Commerce Content OS",
    description: "AI-powered commerce content for marketplace sellers worldwide.",
    images: ["/icons/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CLARTAS",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  const bodyClassName = cn(
    plusJakarta.variable,
    spaceGrotesk.variable,
    "font-sans min-h-screen bg-background antialiased",
  );

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <Script id="clartas-theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem("clartas-theme");if(t==="light")document.documentElement.classList.remove("dark");else document.documentElement.classList.add("dark");}catch(e){}})();`}
        </Script>
      </head>
      <body className={bodyClassName} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
