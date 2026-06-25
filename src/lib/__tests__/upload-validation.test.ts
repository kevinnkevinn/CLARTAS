import { describe, it, expect } from "vitest";
import { validateUpload, isImage } from "@/lib/upload-validation";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/lib/constants";

describe("validateUpload", () => {
  it("accepts a valid image", () => {
    expect(validateUpload("image/png", 1024)).toEqual({ ok: true, kind: "image" });
  });

  it("rejects oversized images", () => {
    expect(validateUpload("image/jpeg", MAX_IMAGE_BYTES + 1)).toEqual({
      ok: false,
      kind: "image",
      error: "size",
    });
  });

  it("accepts a valid video", () => {
    expect(validateUpload("video/mp4", 1024)).toEqual({ ok: true, kind: "video" });
  });

  it("rejects oversized videos", () => {
    expect(validateUpload("video/webm", MAX_VIDEO_BYTES + 1)).toEqual({
      ok: false,
      kind: "video",
      error: "size",
    });
  });

  it("rejects disallowed types", () => {
    expect(validateUpload("application/pdf", 1024)).toEqual({ ok: false, error: "type" });
  });

  it("identifies images by mime type", () => {
    expect(isImage("image/webp")).toBe(true);
    expect(isImage("video/mp4")).toBe(false);
  });
});
