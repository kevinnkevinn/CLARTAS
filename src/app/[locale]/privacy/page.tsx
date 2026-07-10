import { setRequestLocale } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingProviders } from "@/features/marketing/marketing-providers";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  return (
    <MarketingProviders>
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="container max-w-3xl flex-1 py-12 prose prose-invert">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: July 10, 2026</p>
        <p>
          CLARTAS (&quot;we&quot;, &quot;our&quot;) provides an AI-powered Commerce Content OS for
          e-commerce sellers. This policy explains how we collect, use, and protect your data.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Data we collect</h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground">
          <li>Account information (email, name) via authentication providers</li>
          <li>Product images, videos, and text you upload for editing</li>
          <li>Usage data (AI jobs, credits, billing events)</li>
          <li>Device and browser information for security and performance</li>
        </ul>
        <h2 className="mt-8 text-xl font-semibold">How we use data</h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground">
          <li>To provide photo/video editing, copy generation, and listing tools</li>
          <li>To process payments and manage subscriptions via Paddle</li>
          <li>To improve product quality, security, and support</li>
        </ul>
        <h2 className="mt-8 text-xl font-semibold">Third parties</h2>
        <p className="text-sm text-muted-foreground">
          We use Supabase (auth/storage), Fal.ai and Replicate (AI processing), Paddle (payments),
          and optional email/automation providers. Media may be sent to AI providers solely to
          fulfill your requests. We do not sell your personal data.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Your rights</h2>
        <p className="text-sm text-muted-foreground">
          You may request access, correction, or deletion of your account data by contacting
          support. You can export or delete assets from the Asset Library where available.
        </p>
        <h2 className="mt-8 text-xl font-semibold">Contact</h2>
        <p className="text-sm text-muted-foreground">
          Questions:{" "}
          <a href="mailto:privacy@clartas.com" className="text-primary underline">
            privacy@clartas.com
          </a>
        </p>
        <p className="mt-8">
          <Link href="/" className="text-primary underline">
            Back to home
          </Link>
        </p>
      </main>
      <MarketingFooter />
    </div>
    </MarketingProviders>
  );
}
