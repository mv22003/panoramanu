import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { recordVisit } from "@/lib/analytics";

const VISIT_COOKIE = "panoramanu_visit_date";

function getUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function secondsUntilNextUtcDay() {
  const now = new Date();
  const nextDay = new Date(`${getUtcDate()}T00:00:00.000Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  return Math.max(1, Math.ceil((nextDay.getTime() - now.getTime()) / 1000));
}

export async function POST() {
  const cookieStore = await cookies();
  const today = getUtcDate();

  if (cookieStore.get(VISIT_COOKIE)?.value === today) {
    return NextResponse.json({ counted: false });
  }

  await recordVisit();

  const response = NextResponse.json({ counted: true });
  response.cookies.set(VISIT_COOKIE, today, {
    httpOnly: true,
    maxAge: secondsUntilNextUtcDay(),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
