import "server-only";

import { randomUUID } from "node:crypto";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

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

function getExtension(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  return extension || ".jpg";
}

export async function createPhotoUpload(filename: string, contentType: string) {
  if (!filename || filename.length > 255 || !contentType.startsWith("image/")) {
    throw new Error("Uploaded files must be images.");
  }

  const bucket = getStorageBucket();
  const client = createStorageClient();
  const objectPath = `photos/${randomUUID()}${getExtension(filename)}`;

  const { data: upload, error: uploadError } = await client.storage
    .from(bucket)
    .createSignedUploadUrl(objectPath);

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(objectPath);

  return { signedUrl: upload.signedUrl, publicUrl: data.publicUrl };
}
