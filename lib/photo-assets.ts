import "server-only";

import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

export const MAX_PHOTO_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() ?? "";
}

function getSupabaseSecretKey() {
  return (
    process.env.SUPABASE_SECRET_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    ""
  );
}

function createStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const secretKey = getSupabaseSecretKey();

  if (!url || !secretKey || !getStorageBucket()) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, and SUPABASE_STORAGE_BUCKET before uploading files.",
    );
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getExtension(contentType: string) {
  switch (contentType) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    default:
      return ".jpg";
  }
}

export async function createPhotoUpload(
  filename: string,
  contentType: string,
  size: number,
) {
  if (!filename || filename.length > 255 || !ALLOWED_PHOTO_TYPES.has(contentType)) {
    throw new Error("Only JPEG, PNG, and WebP photos can be uploaded.");
  }

  if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_PHOTO_UPLOAD_BYTES) {
    throw new Error("Photos must be smaller than 10 MB.");
  }

  const bucket = getStorageBucket();
  const client = createStorageClient();
  const objectPath = `photos/${randomUUID()}${getExtension(contentType)}`;

  const { data: upload, error: uploadError } = await client.storage
    .from(bucket)
    .createSignedUploadUrl(objectPath);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(objectPath);

  return { signedUrl: upload.signedUrl, publicUrl: data.publicUrl };
}
