import Link from "next/link";
import { redirect } from "next/navigation";

import AdminForm from "@/app/admin/admin-form";
import { isAdminClaims, isSupabaseConfigured } from "@/lib/auth";
import { getPhotos } from "@/lib/photos";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!isAdminClaims(data?.claims)) {
    redirect("/login");
  }

  const photos = await getPhotos();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-stone-800/80 bg-[#141210]/94 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Admin</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-50">
            Manage the collection
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
            Public visitors only see the portfolio. This screen is for adding new
            frames to the archive.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-300 transition hover:border-stone-600 hover:text-stone-50"
            href="/"
          >
            View site
          </Link>
          <form action="/auth/signout" method="post">
            <button
              className="rounded-full bg-stone-800 px-4 py-2 text-sm text-stone-100 transition hover:bg-stone-700"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-stone-800/80 bg-[#141210]/94 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">New frame</p>
          <h2 className="mt-3 text-2xl font-semibold text-stone-50">Add a photo</h2>
          <AdminForm />
        </div>

        <div className="rounded-[2rem] border border-stone-800/80 bg-[#141210]/94 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Archive</p>
              <h2 className="mt-3 text-2xl font-semibold text-stone-50">
                Existing photos
              </h2>
            </div>
            <p className="text-xs text-stone-500">{photos.length} photos</p>
          </div>

          <div className="mt-8 space-y-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-[1.5rem] border border-stone-800 bg-stone-950/70 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-50">{photo.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                      {photo.locationName}
                    </p>
                  </div>
                  <p className="text-xs text-stone-500">
                    {photo.lat.toFixed(4)}, {photo.lng.toFixed(4)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-300">{photo.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
