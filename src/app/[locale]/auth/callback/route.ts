import { NextResponse } from "next/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getSafeRedirectPath(locale: Locale, nextParam?: string | null) {
  if (nextParam && nextParam.startsWith("/")) {
    return nextParam;
  }

  return `/${locale}/dashboard`;
}

export async function GET(request: Request, context: { params: Promise<{ locale: string }> }) {
  const { locale } = await context.params;
  const resolvedLocale: Locale = isValidLocale(locale) ? locale : "en";
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/${resolvedLocale}/sign-in`, requestUrl.origin));
  }

  const supabase = await createClient();
  if (!supabase || !code) {
    return NextResponse.redirect(new URL(`/${resolvedLocale}/sign-in`, requestUrl.origin));
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(new URL(`/${resolvedLocale}/sign-in`, requestUrl.origin));
  }

  const redirectPath = getSafeRedirectPath(resolvedLocale, nextParam);
  return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
}
