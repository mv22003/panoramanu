import Link from "next/link";
import { redirect } from "next/navigation";

import AdminForm from "@/app/admin/admin-form";
import { removePhoto } from "@/app/admin/actions";
import { hasAdminSession, isAdminAuthConfigured } from "@/lib/auth";
import { getDailyVisits } from "@/lib/analytics";
import { getCountryFlagPath } from "@/lib/country";
import { formatTakenOn } from "@/lib/photo-date";
import { getPhotoById, getPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ edit?: string; view?: string; photoView?: string }>;
};

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

function renderBreakdown(
  entries: Array<{ label: string; value: number }>,
  emptyLabel: string,
) {
  if (!entries.length) {
    return <p className="py-4 text-sm text-stone-500">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div className="flex items-center justify-between gap-4 text-sm" key={entry.label}>
          <span className="text-stone-400">{entry.label}</span>
          <span className="font-medium text-stone-100">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  if (!isAdminAuthConfigured()) {
    redirect("/login?error=setup");
  }

  if (!(await hasAdminSession())) {
    redirect("/login");
  }

  const { edit, view, photoView } = await searchParams;
  const showingAnalytics = view === "analytics";
  const showingNewFrame = photoView === "new";
  const dailyVisits = await getDailyVisits();
  const photos = await getPhotos();
  const editingPhoto = edit ? await getPhotoById(edit) : null;
  const today = new Date().toISOString().slice(0, 10);
  const todaySummary = dailyVisits.find((day) => day.date === today);
  const todayVisits = todaySummary?.visits ?? 0;
  const todayUniqueVisitors = todaySummary?.uniqueVisitors ?? 0;
  const totalVisits = dailyVisits.reduce((total, day) => total + day.visits, 0);
  const totalUniqueVisitors = dailyVisits.reduce((total, day) => total + day.uniqueVisitors, 0);
  const averageDuration =
    dailyVisits.length > 0
      ? Math.round(
          dailyVisits.reduce((total, day) => total + day.averageDurationSeconds, 0) /
            dailyVisits.length,
        )
      : 0;
  const deviceBreakdown = (todaySummary?.deviceBreakdown ?? []).map((entry) => ({
    label: entry.deviceType,
    value: entry.visits,
  }));
  const countryBreakdown = (todaySummary?.countryBreakdown ?? []).map((entry) => ({
    label: entry.countryCode,
    value: entry.visits,
  }));

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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Admin sections"
          className="flex w-fit gap-1 rounded-full border border-stone-800/80 bg-[#141210]/94 p-1 shadow-[0_16px_50px_rgba(0,0,0,0.24)]"
        >
          <Link
            className={`rounded-full px-5 py-2.5 text-sm transition ${
              !showingAnalytics
                ? "bg-stone-100 text-stone-950"
                : "text-stone-400 hover:text-stone-100"
            }`}
            href="/admin"
          >
            Photos
          </Link>
          <Link
            className={`rounded-full px-5 py-2.5 text-sm transition ${
              showingAnalytics
                ? "bg-stone-100 text-stone-950"
                : "text-stone-400 hover:text-stone-100"
            }`}
            href="/admin?view=analytics"
          >
            Analytics
          </Link>
        </nav>

        {!showingAnalytics ? (
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
        ) : null}
      </div>

      {showingAnalytics ? (
        <>
      <section className="rounded-[2rem] border border-stone-800/80 bg-[#141210]/94 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Analytics</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-50">Site visits</h2>
          </div>
          <p className="text-xs text-stone-500">Daily session rows</p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.25rem] border border-stone-800 bg-stone-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Today visits</p>
            <p className="mt-3 text-3xl font-semibold text-stone-50">{todayVisits}</p>
          </div>
          <div className="rounded-[1.25rem] border border-stone-800 bg-stone-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
              Today unique visitors
            </p>
            <p className="mt-3 text-3xl font-semibold text-stone-50">{todayUniqueVisitors}</p>
          </div>
          <div className="rounded-[1.25rem] border border-stone-800 bg-stone-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Total visits</p>
            <p className="mt-3 text-3xl font-semibold text-stone-50">{totalVisits}</p>
          </div>
          <div className="rounded-[1.25rem] border border-stone-800 bg-stone-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
              Avg duration
            </p>
            <p className="mt-3 text-3xl font-semibold text-stone-50">
              {formatDuration(averageDuration)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[1.25rem] border border-stone-800 bg-stone-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Device breakdown</p>
            <div className="mt-4">{renderBreakdown(deviceBreakdown, "No device data yet.")}</div>
          </div>
          <div className="rounded-[1.25rem] border border-stone-800 bg-stone-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Country breakdown</p>
            <div className="mt-4">{renderBreakdown(countryBreakdown, "No country data yet.")}</div>
          </div>
        </div>

        <div className="mt-6 divide-y divide-stone-800/80 border-t border-stone-800/80">
          {dailyVisits.length ? (
            dailyVisits.map((day) => (
              <div className="grid gap-3 py-4 text-sm md:grid-cols-[1fr_auto_auto_auto]" key={day.date}>
                <span className="text-stone-400">{day.date}</span>
                <span className="text-stone-300">Visits: {day.visits}</span>
                <span className="text-stone-300">Unique: {day.uniqueVisitors}</span>
                <span className="text-stone-300">Avg: {formatDuration(day.averageDurationSeconds)}</span>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-stone-500">
              Run <code>supabase/analytics.sql</code> in Supabase to start collecting visits.
            </p>
          )}
        </div>
      </section>

        </>
      ) : (
        <>
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
        </>
      )}
    </main>
  );
}
