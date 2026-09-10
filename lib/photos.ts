import "server-only";
import { prisma } from "@/lib/prisma";

export type Photo = { id:string; title:string; description:string; imageUrl:string; slideshowImageUrl:string; instagramUrl:string; locationName:string; countryName:string; takenOn:string|null; lat:number; lng:number; createdAt:string };
export type PhotoDraft = { title:string; description:string; imageUrl:string; slideshowImageUrl:string; instagramUrl:string; locationName:string; countryName:string; takenOn:string|null; lat:number; lng:number };

function normalizeImageUrl(value: string) {
  const normalized = value.trim().replace(/\\/g, "/");
  return !normalized ? "" : normalized.startsWith("/") || normalized.startsWith("http://") || normalized.startsWith("https://") ? normalized : `/${normalized}`;
}
function mapPhoto(row: { id:string; title:string; description:string; imageUrl:string; slideshowImageUrl:string; instagramUrl:string; locationName:string; countryName:string; takenOn:Date|null; lat:number; lng:number; createdAt:Date }): Photo {
  return { id:row.id, title:row.title, description:row.description, imageUrl:normalizeImageUrl(row.imageUrl), slideshowImageUrl:normalizeImageUrl(row.slideshowImageUrl), instagramUrl:row.instagramUrl, locationName:row.locationName, countryName:row.countryName, takenOn:row.takenOn?.toISOString().slice(0,10) ?? null, lat:row.lat, lng:row.lng, createdAt:row.createdAt.toISOString() };
}
function draftData(draft: PhotoDraft) { return { title:draft.title.trim(), description:draft.description.trim(), imageUrl:normalizeImageUrl(draft.imageUrl), slideshowImageUrl:normalizeImageUrl(draft.slideshowImageUrl), instagramUrl:draft.instagramUrl.trim(), locationName:draft.locationName.trim(), countryName:draft.countryName.trim(), takenOn:draft.takenOn ? new Date(`${draft.takenOn}T00:00:00.000Z`) : null, lat:draft.lat, lng:draft.lng }; }

export async function getPhotos() { return (await prisma.photo.findMany({ orderBy:{ createdAt:"desc" } })).map(mapPhoto); }
export async function getPhotoById(photoId:string) { const row = await prisma.photo.findUnique({ where:{ id:photoId } }); return row ? mapPhoto(row) : null; }
export async function createPhoto(draft:PhotoDraft) { return mapPhoto(await prisma.photo.create({ data:draftData(draft) })); }
export async function updatePhoto(photoId:string, draft:PhotoDraft) { const row = await prisma.photo.updateMany({ where:{ id:photoId }, data:draftData(draft) }); if (!row.count) throw new Error("Photo not found."); return mapPhoto(await prisma.photo.findUniqueOrThrow({ where:{ id:photoId } })); }
export async function deletePhoto(photoId:string) { const row = await prisma.photo.deleteMany({ where:{ id:photoId } }); if (!row.count) throw new Error("Photo not found."); }

function parseTakenOn(value: unknown) { const takenOn=String(value??"").trim(); if(!takenOn)return null; if(!/^\d{4}-\d{2}(-\d{2})?$/.test(takenOn))throw new Error("Date must use YYYY-MM or YYYY-MM-DD."); return takenOn; }
export function parsePhotoDraft(input:unknown):PhotoDraft { if(!input||typeof input!=="object")throw new Error("Invalid photo payload."); const draft=input as Record<string,unknown>; const title=String(draft.title??"").trim(),description=String(draft.description??"").trim(),imageUrl=String(draft.imageUrl??"").trim(),slideshowImageUrl=String(draft.slideshowImageUrl??"").trim(),instagramUrl=String(draft.instagramUrl??"").trim(),locationName=String(draft.locationName??"").trim(),countryName=String(draft.countryName??"").trim(),takenOn=parseTakenOn(draft.takenOn),lat=Number(draft.lat),lng=Number(draft.lng); if(!title||!imageUrl||!locationName)throw new Error("Title, framed image, and location are required."); if(!Number.isFinite(lat)||!Number.isFinite(lng))throw new Error("Latitude and longitude must be valid numbers."); if(lat < -90||lat > 90||lng < -180||lng > 180)throw new Error("Coordinates are out of range."); return {title,description,imageUrl,slideshowImageUrl,instagramUrl,locationName,countryName,takenOn,lat,lng}; }
