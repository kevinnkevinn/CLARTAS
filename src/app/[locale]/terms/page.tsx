import { setRequestLocale } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingProviders } from "@/features/marketing/marketing-providers";

export default async function TermsPage({
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
      <main className="container max-w-3xl flex-1 py-12">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground">Last updated: July 10, 2026</p>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground">
          <p>
            By using CLARTAS you agree to these terms. CLARTAS provides AI-assisted tools to create
            marketplace-ready product content. You retain ownership of content you upload and
            generate, subject to third-party AI provider terms for processing.
          </p>
          <p>
            You are responsible for ensuring your listings comply with marketplace policies
            (Shopee, Tokopedia, Amazon, etc.). Credits and subscriptions are billed according to
            your selected plan. Refunds follow Paddle and applicable consumer law.
          </p>
          <p>
            Do not upload illegal content, infringe IP rights, or abuse the service. We may suspend
            accounts that violate these terms. The service is provided &quot;as is&quot; without
            warranties of uninterrupted availability or specific sales outcomes.
          </p>
          <p>
            Contact:{" "}
            <a href="mailto:legal@clartas.com" className="text-primary underline">
              legal@clartas.com
            </a>
          </p>
        </div>
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
