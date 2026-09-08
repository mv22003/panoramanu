import "server-only";

import { createClient } from "@supabase/supabase-js";

export type DailyVisit = {
  date: string;
  visits: number;
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

export async function recordVisit() {
  const client = createAnalyticsClient();

  if (!client) {
    return;
  }

  const { error } = await client.rpc("record_site_visit");

  if (error) {
    console.warn("Unable to record site visit:", error.message);
  }
}

export async function getDailyVisits(limit = 30): Promise<DailyVisit[]> {
  const client = createAnalyticsClient();

  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from("site_visits")
    .select("visit_date, visit_count")
    .order("visit_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Unable to load site visits:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    date: String(row.visit_date),
    visits: Number(row.visit_count),
  }));
}
