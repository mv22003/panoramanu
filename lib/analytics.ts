import "server-only";

import { createClient } from "@supabase/supabase-js";

export type DailyVisitRow = {
  date: string;
  visits: number;
  uniqueVisitors: number;
  averageDurationSeconds: number;
  deviceBreakdown: Array<{ deviceType: string; visits: number }>;
  countryBreakdown: Array<{ countryCode: string; visits: number }>;
};

export type VisitSessionRow = {
  id: string;
  visitorId: string;
  sessionId: string;
  path: string;
  countryCode: string | null;
  deviceType: string | null;
  browser: string | null;
  operatingSystem: string | null;
  startedAt: string;
  lastSeenAt: string;
  durationSeconds: number;
};

function createAnalyticsClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const secretKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ??
    "";

  if (!url || !secretKey) {
    return null;
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function recordVisitSession(input: {
  visitorId: string;
  sessionId: string;
  path: string;
  countryCode: string | null;
  deviceType: string | null;
  browser: string | null;
  operatingSystem: string | null;
  durationSeconds: number;
}) {
  const client = createAnalyticsClient();

  if (!client) {
    return;
  }

  const nowIso = new Date().toISOString();

  const { error } = await client.from("site_visit_sessions").upsert(
    {
      visitor_id: input.visitorId,
      session_id: input.sessionId,
      path: input.path,
      country_code: input.countryCode,
      device_type: input.deviceType,
      browser: input.browser,
      operating_system: input.operatingSystem,
      last_seen_at: nowIso,
      duration_seconds: input.durationSeconds,
    },
    {
      onConflict: "session_id",
    },
  );

  if (error) {
    console.warn("Unable to record site visit session:", error.message);
  }
}

export async function getDailyVisits(limit = 30): Promise<DailyVisitRow[]> {
  const client = createAnalyticsClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("site_visits_daily")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Unable to load site visits:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    date: String(row.date),
    visits: Number(row.visits ?? 0),
    uniqueVisitors: Number(row.unique_visitors ?? 0),
    averageDurationSeconds: Number(row.average_duration_seconds ?? 0),
    deviceBreakdown: Array.isArray(row.device_breakdown)
      ? row.device_breakdown.map((entry: { device_type?: string; visits?: number }) => ({
          deviceType: String(entry.device_type ?? "Unknown"),
          visits: Number(entry.visits ?? 0),
        }))
      : [],
    countryBreakdown: Array.isArray(row.country_breakdown)
      ? row.country_breakdown.map((entry: { country_code?: string; visits?: number }) => ({
          countryCode: String(entry.country_code ?? "Unknown"),
          visits: Number(entry.visits ?? 0),
        }))
      : [],
  }));
}

export async function getRecentVisitSessions(limit = 50): Promise<VisitSessionRow[]> {
  const client = createAnalyticsClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("site_visit_sessions")
    .select(
      "id, visitor_id, session_id, path, country_code, device_type, browser, operating_system, started_at, last_seen_at, duration_seconds",
    )
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Unable to load site visit sessions:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    visitorId: String(row.visitor_id),
    sessionId: String(row.session_id),
    path: String(row.path),
    countryCode: row.country_code ? String(row.country_code) : null,
    deviceType: row.device_type ? String(row.device_type) : null,
    browser: row.browser ? String(row.browser) : null,
    operatingSystem: row.operating_system ? String(row.operating_system) : null,
    startedAt: String(row.started_at),
    lastSeenAt: String(row.last_seen_at),
    durationSeconds: Number(row.duration_seconds ?? 0),
  }));
}
