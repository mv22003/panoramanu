import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type Photo = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  locationName: string;
  lat: number;
  lng: number;
  createdAt: string;
};

export type PhotoDraft = {
  title: string;
  description: string;
  imageUrl: string;
  locationName: string;
  lat: number;
  lng: number;
};

const photosFilePath = path.join(process.cwd(), "data", "photos.json");

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
  const parsed = JSON.parse(raw) as Photo[];

  return parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createPhoto(draft: PhotoDraft): Promise<Photo> {
  const photo: Photo = {
    id: randomUUID(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    imageUrl: draft.imageUrl.trim(),
    locationName: draft.locationName.trim(),
    lat: draft.lat,
    lng: draft.lng,
    createdAt: new Date().toISOString(),
  };

  const photos = await getPhotos();
  await writePhotos([photo, ...photos]);

  return photo;
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
  const lat = Number(draft.lat);
  const lng = Number(draft.lng);

  if (!title || !description || !imageUrl || !locationName) {
    throw new Error("All fields are required.");
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
    lat,
    lng,
  };
}
