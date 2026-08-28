'use server'

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import { saveUploadedPhoto } from "@/lib/photo-assets";
import { createPhoto, deletePhoto, parsePhotoDraft, updatePhoto } from "@/lib/photos";

export type AdminFormState = {
  error: string;
  message: string;
};

async function requireAdmin() {
  await requireAdminSession();
}

export async function addPhoto(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    await requireAdmin();

    const photoId = String(formData.get("photoId") ?? "").trim();
    const uploadedFile = formData.get("imageFile");
    const uploadedImageUrl =
      uploadedFile instanceof File && uploadedFile.size > 0
        ? await saveUploadedPhoto(uploadedFile)
        : "";
    const fallbackImageUrl = String(formData.get("existingImageUrl") ?? "").trim();

    const draft = parsePhotoDraft({
      ...Object.fromEntries(formData.entries()),
      imageUrl:
        uploadedImageUrl || String(formData.get("imageUrl") ?? "").trim() || fallbackImageUrl,
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
