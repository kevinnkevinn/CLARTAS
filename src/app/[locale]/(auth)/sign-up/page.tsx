import { setRequestLocale, getTranslations } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { SocialSignInButtons } from "@/features/auth/social-sign-in-buttons";

export default async function SignUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);
  const t = await getTranslations("auth");

  return (
    <Card className="animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t("signUpTitle")}</CardTitle>
        <CardDescription>{t("signUpSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* OAuth buttons first - quickest signup method */}
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">{t("signUpWith") || "Daftar dengan:"}</p>
            <SocialSignInButtons />
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Email/Password form */}
          <div>
            <p className="mb-4 text-sm font-medium text-muted-foreground">{t("signUpEmail") || "Atau daftar dengan email:"}</p>
            <SignUpForm />
          </div>
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            {t("signInButton")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
