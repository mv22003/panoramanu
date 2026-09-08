import { randomUUID } from "crypto";

import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import { recordVisitSession } from "@/lib/analytics";

const CONSENT_COOKIE = "panoramanu_cookie_consent";
const VISITOR_COOKIE = "panoramanu_visitor_id";
const SESSION_COOKIE = "panoramanu_visit_session_id";

type RequestBody = {
  path?: string;
  durationSeconds?: number;
};

function utcDateString() {
  return new Date().toISOString().slice(0, 10);
}

function nextUtcMidnightAgeSeconds() {
  const now = new Date();
  const nextDay = new Date(`${utcDateString()}T00:00:00.000Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  return Math.max(1, Math.ceil((nextDay.getTime() - now.getTime()) / 1000));
}

function normalizePath(path: string | undefined) {
  if (!path || !path.startsWith("/")) {
    return "/";
  }

  return path.split("?")[0] || "/";
}

function getCountryCode(requestHeaders: Headers) {
  const country =
    requestHeaders.get("x-vercel-ip-country") ??
    requestHeaders.get("cf-ipcountry") ??
    requestHeaders.get("x-country-code") ??
    "";

  return country && country !== "XX" ? country.toUpperCase() : null;
}

function detectDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (ua.includes("tablet") || ua.includes("ipad")) {
    return "tablet";
  }

  if (
    ua.includes("mobi") ||
    ua.includes("iphone") ||
    ua.includes("android") ||
    ua.includes("windows phone")
  ) {
    return "mobile";
  }

  return "desktop";
}

function detectBrowser(userAgent: string) {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) return "Chrome";
  if (/safari\//i.test(userAgent) && !/chrome\//i.test(userAgent)) return "Safari";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  if (/msie|trident\//i.test(userAgent)) return "Internet Explorer";
  return "Other";
}

function detectOperatingSystem(userAgent: string) {
  if (/windows nt/i.test(userAgent)) return "Windows";
  if (/android/i.test(userAgent)) return "Android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/mac os x/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Other";
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const consentCookie = cookieStore.get(CONSENT_COOKIE)?.value ?? "";

  if (consentCookie !== "granted") {
    return NextResponse.json({ counted: false, consented: false });
  }

  const body = (await request.json().catch(() => ({}))) as RequestBody;
  const path = normalizePath(body.path);
  const visitorId = cookieStore.get(VISITOR_COOKIE)?.value ?? randomUUID();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value ?? randomUUID();
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") ?? "";

  await recordVisitSession({
    visitorId,
    sessionId,
    path,
    countryCode: getCountryCode(requestHeaders),
    deviceType: detectDeviceType(userAgent),
    browser: detectBrowser(userAgent),
    operatingSystem: detectOperatingSystem(userAgent),
    durationSeconds: Number(body.durationSeconds ?? 0),
  });

  const response = NextResponse.json({ counted: true, consented: true });

  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    maxAge: nextUtcMidnightAgeSeconds(),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
