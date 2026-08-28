import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type Photo = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  locationName: string;
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
  takenOn: string | null;
  lat: number;
  lng: number;
};

const photosFilePath = path.join(process.cwd(), "data", "photos.json");

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

async function ensureDataFile() {
  await fs.mkdir(path.dirname(photosFilePath), { recursive: true });

  try {
    await fs.access(photosFilePath);
  } catch {
    await fs.writeFile(photosFilePath, "[]\n", "utf8");
  }
}

async function writePhotos(photos: Photo[]) {
  await ensureDataFile();
  await fs.writeFile(photosFilePath, `${JSON.stringify(photos, null, 2)}\n`, "utf8");
}

export async function getPhotos(): Promise<Photo[]> {
  await ensureDataFile();

  const raw = await fs.readFile(photosFilePath, "utf8");
  const parsed = JSON.parse(raw) as Array<Photo & { takenOn?: string | null }>;

  return parsed
    .map((photo) => ({
      ...photo,
      description: photo.description ?? "",
      imageUrl: normalizeImageUrl(photo.imageUrl ?? ""),
      takenOn: photo.takenOn ?? null,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createPhoto(draft: PhotoDraft): Promise<Photo> {
  const photo: Photo = {
    id: randomUUID(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    imageUrl: normalizeImageUrl(draft.imageUrl),
    locationName: draft.locationName.trim(),
    takenOn: draft.takenOn,
    lat: draft.lat,
    lng: draft.lng,
    createdAt: new Date().toISOString(),
  };

  const photos = await getPhotos();
  await writePhotos([photo, ...photos]);

  return photo;
}

export async function getPhotoById(photoId: string) {
  const photos = await getPhotos();
  return photos.find((photo) => photo.id === photoId) ?? null;
}

export async function updatePhoto(photoId: string, draft: PhotoDraft): Promise<Photo> {
  const photos = await getPhotos();
  const existingPhoto = photos.find((photo) => photo.id === photoId);

  if (!existingPhoto) {
    throw new Error("Photo not found.");
  }

  const updatedPhoto: Photo = {
    ...existingPhoto,
    title: draft.title.trim(),
    description: draft.description.trim(),
    imageUrl: normalizeImageUrl(draft.imageUrl),
    locationName: draft.locationName.trim(),
    takenOn: draft.takenOn,
    lat: draft.lat,
    lng: draft.lng,
  };

  await writePhotos(
    photos.map((photo) => (photo.id === photoId ? updatedPhoto : photo)),
  );

  return updatedPhoto;
}

export async function deletePhoto(photoId: string) {
  const photos = await getPhotos();
  const nextPhotos = photos.filter((photo) => photo.id !== photoId);

  if (nextPhotos.length === photos.length) {
    throw new Error("Photo not found.");
  }

  await writePhotos(nextPhotos);
}

function parseTakenOn(value: unknown) {
  const takenOn = String(value ?? "").trim();

  if (!takenOn) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(takenOn)) {
    throw new Error("Date must use YYYY-MM-DD.");
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
    takenOn,
    lat,
    lng,
  };
}
