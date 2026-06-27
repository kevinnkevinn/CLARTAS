import { NextResponse } from "next/server";
import { getSessionUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { validateUpload } from "@/lib/upload-validation";
import { resolveFileMimeType } from "@/lib/mime";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { isDemoMode } from "@/lib/demo/config";
import { logError } from "@/lib/logger";

/**
 * Secure upload endpoint. Validates file type/size, stores the file in the
 * private `raw-assets` bucket namespaced by user id, and records an asset row.
 * In demo mode, returns a base64 data URL for client-side processing.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const validation = validateUpload(resolveFileMimeType(file), file.size);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error === "size" ? "file_too_large" : "invalid_file_type" },
      { status: 400 },
    );
  }

  if (isDemoMode()) {
    const mime = resolveFileMimeType(file) || file.type || "application/octet-stream";
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${mime};base64,${base64}`;
    return NextResponse.json({
      asset: {
        id: crypto.randomUUID(),
        original_filename: file.name,
        file_type: file.type,
        processing_status: "ready",
      },
      signedUrl: dataUrl,
      demo: true,
    });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Storage is not configured" }, { status: 503 });
  }

  const workspaceId = formData.get("workspaceId");

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.raw)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      await logError("upload", uploadError, { path }, user.id);
      return NextResponse.json({ error: "upload_failed" }, { status: 502 });
    }

    const { data: asset, error: insertError } = await supabase
      .from("assets")
      .insert({
        user_id: user.id,
        workspace_id: typeof workspaceId === "string" && workspaceId ? workspaceId : null,
        file_path: path,
        file_type: file.type,
        original_filename: file.name,
        processing_status: "ready",
        metadata: { size: file.size, kind: validation.kind },
      })
      .select("*")
      .single();

    if (insertError) {
      await logError("upload:insert", insertError, { path }, user.id);
      return NextResponse.json({ error: "record_failed" }, { status: 502 });
    }

    const { data: signed } = await supabase.storage
      .from(STORAGE_BUCKETS.raw)
      .createSignedUrl(path, 3600);

    return NextResponse.json({ asset, signedUrl: signed?.signedUrl ?? null });
  } catch (error) {
    await logError("upload:unexpected", error, {}, user.id);
    return NextResponse.json({ error: "upload_failed" }, { status: 502 });
  }
}
