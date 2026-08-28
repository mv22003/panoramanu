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

export async function saveUploadedPhoto(file: File) {
  if (!file || file.size === 0) {
    return "";
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Uploaded files must be images.");
  }

  const bucket = getStorageBucket();
  const client = createStorageClient();
  const filename = `${randomUUID()}${getExtension(file.name)}`;
  const objectPath = `photos/${filename}`;

  const { error: uploadError } = await client.storage.from(bucket).upload(objectPath, file, {
    cacheControl: "3600",
    contentType: file.type || undefined,
    upsert: false,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = client.storage.from(bucket).getPublicUrl(objectPath);

  return data.publicUrl;
}
