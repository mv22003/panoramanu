import { createPhoto, getPhotos, parsePhotoDraft } from "@/lib/photos";
import { isAdminClaims } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const photos = await getPhotos();
  return Response.json({ photos });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!isAdminClaims(data?.claims)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const draft = parsePhotoDraft(payload);
    const photo = await createPhoto(draft);

    return Response.json({ photo }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save photo.";

    return Response.json({ error: message }, { status: 400 });
  }
}
