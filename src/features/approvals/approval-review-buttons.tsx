"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { reviewApprovalAction } from "./actions";
import { Button } from "@/components/ui/button";
import type { ApprovalStatus } from "@/lib/supabase/types";

export function ApprovalReviewButtons({ requestId }: { requestId: string }) {
  const t = useTranslations("approvals");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function review(status: ApprovalStatus) {
    startTransition(async () => {
      await reviewApprovalAction(requestId, status);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => review("approved")}>
        {t("approve")}
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => review("rejected")}>
        {t("reject")}
      </Button>
    </div>
  );
}
