'use server'

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { createPhotoUpload } from "@/lib/photo-assets";
import { createPhoto, deletePhoto, parsePhotoDraft, updatePhoto } from "@/lib/photos";

export type AdminFormState = {
  error: string;
  message: string;
};

async function requireAdmin() {
  await requireAdminSession();
}

export async function preparePhotoUpload(filename: string, contentType: string) {
  try {
    await requireAdmin();
    const upload = await createPhotoUpload(filename, contentType);
    return { upload, error: "" };
  } catch (error) {
    return {
      upload: null,
      error: error instanceof Error ? error.message : "Unable to prepare upload.",
    };
  }
}

export async function addPhoto(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    await requireAdmin();

    const photoId = String(formData.get("photoId") ?? "").trim();
    const fallbackImageUrl = String(formData.get("existingImageUrl") ?? "").trim();
    const fallbackSlideshowImageUrl = String(formData.get("existingSlideshowImageUrl") ?? "").trim();
    const takenOnMonth = String(formData.get("takenOnMonth") ?? "").trim();
    const takenOn = takenOnMonth ? `${takenOnMonth}-01` : "";

    const draft = parsePhotoDraft({
      ...Object.fromEntries(formData.entries()),
      takenOn,
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || fallbackImageUrl,
      instagramUrl: String(formData.get("instagramUrl") ?? "").trim(),
      slideshowImageUrl:
        String(formData.get("slideshowImageUrl") ?? "").trim() ||
        fallbackSlideshowImageUrl,
    });

    if (photoId) {
      await updatePhoto(photoId, draft);
    } else {
      await createPhoto(draft);
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return {
      error: "",
      message: photoId
        ? "Photo updated in the collection."
        : "Photo added to the collection.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save photo.",
      message: "",
    };
  }
}

export async function removePhoto(photoId: string) {
  await requireAdmin();
  await deletePhoto(photoId);
  revalidatePath("/");
  revalidatePath("/admin");
}
