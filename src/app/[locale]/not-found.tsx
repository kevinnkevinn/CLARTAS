import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

export default async function LocaleNotFound() {
  const t = await getTranslations("states");
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-bold gradient-text">404</p>
      <h1 className="mt-4 text-2xl font-semibold">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("notFoundMessage")}</p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>
        {t("goHome")}
      </Link>
    </div>
  );
}
