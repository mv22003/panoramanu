import Link from "next/link";
import { redirect } from "next/navigation";

import AdminForm from "@/app/admin/admin-form";
import { removePhoto } from "@/app/admin/actions";
import { hasAdminSession, isAdminAuthConfigured } from "@/lib/auth";
import { getDailyVisits, getRecentVisitSessions } from "@/lib/analytics";
import { formatTakenOn } from "@/lib/photo-date";
import { getPhotoById, getPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ edit?: string }>;
};

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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

  const { edit } = await searchParams;
  const dailyVisits = await getDailyVisits();
  const visitSessions = await getRecentVisitSessions();
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

      <section className="rounded-[2rem] border border-stone-800/80 bg-[#141210]/94 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Sessions</p>
            <h2 className="mt-3 text-2xl font-semibold text-stone-50">Recent visits</h2>
          </div>
          <p className="text-xs text-stone-500">Latest {visitSessions.length} rows</p>
        </div>

        <div className="mt-6 space-y-3">
          {visitSessions.length ? (
            visitSessions.map((session) => (
              <div
                key={session.id}
                className="rounded-[1.25rem] border border-stone-800 bg-stone-950/70 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-stone-100">{session.path}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                      {session.visitorId}
                    </p>
                  </div>
                  <div className="text-right text-xs uppercase tracking-[0.14em] text-stone-500">
                    <p>{session.countryCode ?? "Unknown country"}</p>
                    <p className="mt-1">{session.deviceType ?? "Unknown device"}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-stone-300 md:grid-cols-2">
                  <p>Started: {formatTimestamp(session.startedAt)}</p>
                  <p>Last activity: {formatTimestamp(session.lastSeenAt)}</p>
                  <p>Browser: {session.browser ?? "Unknown"}</p>
                  <p>OS: {session.operatingSystem ?? "Unknown"}</p>
                  <p>Duration: {formatDuration(session.durationSeconds)}</p>
                  <p>Session: {session.sessionId}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="py-4 text-sm text-stone-500">
              No session rows yet.
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-stone-800/80 bg-[#141210]/94 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
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
                  <div className="text-right">
                    <p className="text-xs text-stone-500">
                      {photo.lat.toFixed(4)}, {photo.lng.toFixed(4)}
                    </p>
                    {photo.takenOn ? (
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-600">
                        {formatTakenOn(photo.takenOn)}
                      </p>
                    ) : null}
                  </div>
                </div>
                {photo.description ? (
                  <p className="mt-3 text-sm leading-6 text-stone-300">{photo.description}</p>
                ) : (
                  <p className="mt-3 text-sm italic text-stone-500">No description</p>
                )}
                <div className="mt-5 flex gap-3">
                  <Link
                    className="rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-300 transition hover:border-stone-600 hover:text-stone-50"
                    href={`/admin?edit=${photo.id}`}
                  >
                    Edit
                  </Link>
                  <form action={removePhoto.bind(null, photo.id)}>
                    <button
                      className="rounded-full border border-red-400/40 px-4 py-2 text-sm text-red-200 transition hover:border-red-300/60 hover:text-red-100"
                      type="submit"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
