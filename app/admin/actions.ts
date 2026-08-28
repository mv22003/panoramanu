'use server'

import { revalidatePath } from "next/cache";

import { createPhoto, parsePhotoDraft } from "@/lib/photos";
import { isAdminClaims } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type AdminFormState = {
  error: string;
  message: string;
};

export async function addPhoto(
  _prevState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!isAdminClaims(data?.claims)) {
    return {
      error: "Only the admin user can add photos.",
      message: "",
    };
  }

  try {
    const draft = parsePhotoDraft(Object.fromEntries(formData.entries()));
    await createPhoto(draft);
    revalidatePath("/");
    revalidatePath("/admin");

    return {
      error: "",
      message: "Photo added to the collection.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save photo.",
      message: "",
    };
  }
}
