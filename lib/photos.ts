import "server-only";

import { createClient } from "@supabase/supabase-js";
export type Photo = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  locationName: string;
  countryName: string;
  takenOn: string | null;
  lat: number;
  lng: number;
  createdAt: string;
};

export type PhotoDraft = {
  title: string;
  description: string;
  imageUrl: string;
  locationName: string;
  countryName: string;
  takenOn: string | null;
  lat: number;
  lng: number;
};

type PhotoRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  location_name: string | null;
  country_name: string | null;
  taken_on: string | null;
  lat: number;
  lng: number;
  created_at: string;
};

const photosTable = process.env.SUPABASE_PHOTOS_TABLE?.trim() || "photos";

function normalizeImageUrl(value: string) {
  const normalized = value.trim().replace(/\\/g, "/");

  if (!normalized) {
    return "";
  }

  if (
    normalized.startsWith("/") ||
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return normalized;
  }

  return `/${normalized}`;
}

function getSupabaseSecretKey() {
  return (
    process.env.SUPABASE_SECRET_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    ""
  );
}

function createPhotosClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const secretKey = getSupabaseSecretKey();

  if (!url || !secretKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY before loading photos.",
    );
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function mapPhotoRow(row: PhotoRow): Photo {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    imageUrl: normalizeImageUrl(row.image_url ?? ""),
    locationName: String(row.location_name ?? "").trim(),
    countryName: String(row.country_name ?? "").trim(),
    takenOn: row.taken_on ?? null,
    lat: Number(row.lat),
    lng: Number(row.lng),
    createdAt: row.created_at,
  };
}

function mapPhotoDraft(draft: PhotoDraft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    image_url: normalizeImageUrl(draft.imageUrl),
    location_name: draft.locationName.trim(),
    country_name: draft.countryName.trim(),
    taken_on: draft.takenOn,
    lat: draft.lat,
    lng: draft.lng,
  };
}

export async function getPhotos(): Promise<Photo[]> {
  const client = createPhotosClient();
  const { data, error } = await client
    .from(photosTable)
    .select(
      "id, title, description, image_url, location_name, country_name, taken_on, lat, lng, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapPhotoRow(row as PhotoRow));
}

export async function createPhoto(draft: PhotoDraft): Promise<Photo> {
  const client = createPhotosClient();
  const { data, error } = await client
    .from(photosTable)
    .insert(mapPhotoDraft(draft))
    .select(
      "id, title, description, image_url, location_name, country_name, taken_on, lat, lng, created_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPhotoRow(data as PhotoRow);
}

export async function getPhotoById(photoId: string) {
  const client = createPhotosClient();
  const { data, error } = await client
    .from(photosTable)
    .select(
      "id, title, description, image_url, location_name, country_name, taken_on, lat, lng, created_at",
    )
    .eq("id", photoId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapPhotoRow(data as PhotoRow) : null;
}

export async function updatePhoto(photoId: string, draft: PhotoDraft): Promise<Photo> {
  const client = createPhotosClient();
  const { data, error } = await client
    .from(photosTable)
    .update(mapPhotoDraft(draft))
    .eq("id", photoId)
    .select(
      "id, title, description, image_url, location_name, country_name, taken_on, lat, lng, created_at",
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Photo not found.");
  }

  return mapPhotoRow(data as PhotoRow);
}

export async function deletePhoto(photoId: string) {
  const client = createPhotosClient();
  const { data, error } = await client
    .from(photosTable)
    .delete()
    .eq("id", photoId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Photo not found.");
  }
}

function parseTakenOn(value: unknown) {
  const takenOn = String(value ?? "").trim();

  if (!takenOn) {
    return null;
  }

  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(takenOn)) {
    throw new Error("Date must use YYYY-MM or YYYY-MM-DD.");
  }

  return takenOn;
}

export function parsePhotoDraft(input: unknown): PhotoDraft {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid photo payload.");
  }

  const draft = input as Record<string, unknown>;
  const title = String(draft.title ?? "").trim();
  const description = String(draft.description ?? "").trim();
  const imageUrl = String(draft.imageUrl ?? "").trim();
  const locationName = String(draft.locationName ?? "").trim();
  const countryName = String(draft.countryName ?? "").trim();
  const takenOn = parseTakenOn(draft.takenOn);
  const lat = Number(draft.lat);
  const lng = Number(draft.lng);

  if (!title || !imageUrl || !locationName) {
    throw new Error("Title, image, and location are required.");
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Latitude and longitude must be valid numbers.");
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error("Coordinates are out of range.");
  }

  return {
    title,
    description,
    imageUrl,
    locationName,
    countryName,
    takenOn,
    lat,
    lng,
  };
}
