import { readFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

async function loadEnvFile(filename) {
  const filePath = path.join(process.cwd(), filename);

  try {
    const raw = await readFile(filePath, "utf8");

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }

    throw error;
  }
}

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function mapPhotoRow(photo) {
  const imageUrl = String(photo.imageUrl ?? "").trim();
  const slideshowImageUrl = String(photo.slideshowImageUrl ?? imageUrl).trim() || imageUrl;

  return {
    id: String(photo.id),
    title: String(photo.title ?? "").trim(),
    description: String(photo.description ?? "").trim(),
    image_url: imageUrl,
    slideshow_image_url: slideshowImageUrl,
    location_name: String(photo.locationName ?? "").trim(),
    country_name: String(photo.countryName ?? "").trim(),
    taken_on: photo.takenOn ? String(photo.takenOn) : null,
    lat: Number(photo.lat),
    lng: Number(photo.lng),
    created_at: String(photo.createdAt),
  };
}

async function main() {
  await loadEnvFile(".env.local");
  await loadEnvFile(".env");

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseKey) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY in .env.local or environment.",
    );
  }

  const tableName = process.env.SUPABASE_PHOTOS_TABLE?.trim() || "photos";
  const photosPath = path.join(process.cwd(), "data", "photos.json");
  const raw = await readFile(photosPath, "utf8");
  const photos = JSON.parse(raw);

  if (!Array.isArray(photos)) {
    throw new Error("data/photos.json must contain an array.");
  }

  const rows = photos.map(mapPhotoRow);
  const invalidRow = rows.find(
    (row) =>
      !row.id ||
      !row.title ||
      !row.location_name ||
      !Number.isFinite(row.lat) ||
      !Number.isFinite(row.lng),
  );

  if (invalidRow) {
    throw new Error(`Found invalid photo row for id "${invalidRow.id || "unknown"}".`);
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await client.from(tableName).upsert(rows, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  console.log(`Imported ${rows.length} photo record(s) into ${tableName}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
