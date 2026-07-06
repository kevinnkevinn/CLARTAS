import { NextResponse } from "next/server";
import { getSessionUser } from "@/features/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "unconfigured" }, { status: 503 });
  }

  const { data, error } = await admin
    .from("ai_jobs")
    .select("id, status, action, output_payload, error_message, credit_cost, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    jobId: data.id,
    status: data.status,
    action: data.action,
    output: data.output_payload,
    error: data.error_message,
    creditCost: data.credit_cost,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });
}
