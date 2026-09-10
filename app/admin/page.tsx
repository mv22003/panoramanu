import Link from "next/link";
import { redirect } from "next/navigation";

import AdminForm from "@/app/admin/admin-form";
import { removePhoto } from "@/app/admin/actions";
import { hasAdminSession, isAdminAuthConfigured } from "@/lib/auth";
import { getCountryFlagPath } from "@/lib/country";
import { formatTakenOn } from "@/lib/photo-date";
import { getPhotoById, getPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ edit?: string; photoView?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  if (!isAdminAuthConfigured()) {
    redirect("/login?error=setup");
  }

  if (!(await hasAdminSession())) {
    redirect("/login");
  }

  const { edit, photoView } = await searchParams;
  const showingNewFrame = photoView === "new";
  const photos = await getPhotos();
  const editingPhoto = edit ? await getPhotoById(edit) : null;

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
        </div>
      </section>

      <nav
        aria-label="Photo sections"
        className="flex w-fit gap-1 rounded-full border border-stone-800/80 bg-[#141210]/94 p-1 shadow-[0_16px_50px_rgba(0,0,0,0.24)]"
      >
        <Link
          className={`rounded-full px-5 py-2.5 text-sm transition ${
            !showingNewFrame
              ? "bg-stone-100 text-stone-950"
              : "text-stone-400 hover:text-stone-100"
          }`}
          href="/admin"
        >
          Existing photos
        </Link>
        <Link
          className={`rounded-full px-5 py-2.5 text-sm transition ${
            showingNewFrame
              ? "bg-stone-100 text-stone-950"
              : "text-stone-400 hover:text-stone-100"
          }`}
          href="/admin?photoView=new"
        >
          New frame
        </Link>
      </nav>

      {showingNewFrame ? (
        <section className="rounded-[2rem] border border-stone-800/80 bg-[#141210]/94 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                {editingPhoto ? "Edit frame" : "New frame"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-stone-50">
                {editingPhoto ? "Update photo" : "Add a photo"}
              </h2>
            </div>
            {editingPhoto ? (
              <Link
                className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-300 transition hover:border-stone-600 hover:text-stone-50"
                href="/admin"
              >
                Cancel
              </Link>
            ) : null}
          </div>
          <AdminForm photo={editingPhoto} />
        </section>
      ) : (
        <section className="rounded-[2rem] border border-stone-800/80 bg-[#141210]/94 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Archive</p>
              <h2 className="mt-3 text-2xl font-semibold text-stone-50">
                Existing photos
              </h2>
            </div>
            <p className="text-xs text-stone-500">{photos.length} photos</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="flex gap-4 rounded-[1.25rem] border border-stone-800 bg-stone-950/70 p-3 transition hover:bg-stone-900/70 sm:items-center sm:p-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-800 bg-stone-900 sm:h-20 sm:w-20">
                  {photo.imageUrl ? (
                    <img
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                      src={photo.imageUrl}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-[10px] uppercase tracking-[0.14em] text-stone-600">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <h3 className="truncate text-base font-semibold text-stone-50">{photo.title}</h3>
                    <p className="shrink-0 text-xs text-stone-500">
                      {photo.takenOn ? formatTakenOn(photo.takenOn) : "No date"}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs uppercase tracking-[0.14em] text-stone-500">
                    <span>
                      {photo.locationName || "No location"}
                      {getCountryFlagPath(photo.countryName) ? (
                        <img
                          alt=""
                          aria-hidden="true"
                          className="ml-1 inline-block h-[1em] w-auto align-[-0.12em]"
                          src={getCountryFlagPath(photo.countryName) ?? undefined}
                        />
                      ) : null}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      className="inline-flex h-9 w-16 appearance-none items-center justify-center rounded-full border border-stone-700 p-0 font-sans text-stone-300 transition hover:border-stone-600 hover:text-stone-50"
                      href={`/admin?photoView=new&edit=${photo.id}`}
                    >
                      <span className="text-[12px] font-normal leading-4">Edit</span>
                    </Link>
                    <form action={removePhoto.bind(null, photo.id)}>
                      <button
                        className="inline-flex h-9 w-16 appearance-none items-center justify-center rounded-full border border-red-400/40 p-0 font-sans text-red-200 transition hover:border-red-300/60 hover:text-red-100"
                        type="submit"
                      >
                        <span className="text-[12px] font-normal leading-4">Delete</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
