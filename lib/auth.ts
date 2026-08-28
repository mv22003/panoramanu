import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "panoramanu_admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getAdminAccessKey() {
  return process.env.ADMIN_ACCESS_KEY?.trim() ?? "";
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
}

function signSessionValue(value: string) {
  return createHmac("sha256", getAdminSessionSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function buildSessionValue() {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${signSessionValue(issuedAt)}`;
}

function isSessionValueValid(value: string) {
  const [issuedAt, signature] = value.split(".");

  if (!issuedAt || !signature) {
    return false;
  }

  const issuedAtNumber = Number(issuedAt);

  if (!Number.isFinite(issuedAtNumber)) {
    return false;
  }

  const expiresAt = issuedAtNumber + ADMIN_SESSION_MAX_AGE * 1000;

  if (Date.now() > expiresAt) {
    return false;
  }

  return safeEqual(signature, signSessionValue(issuedAt));
}

export function isAdminAuthConfigured() {
  return Boolean(getAdminAccessKey() && getAdminSessionSecret());
}

export function isAdminAccessKeyValid(input: string) {
  const configuredKey = getAdminAccessKey();
  const providedKey = input.trim();

  return Boolean(
    configuredKey &&
      providedKey &&
      safeEqual(providedKey, configuredKey),
  );
}

export async function hasAdminSession() {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";

  return isSessionValueValid(sessionValue);
}

export async function requireAdminSession() {
  if (!(await hasAdminSession())) {
    throw new Error("Only the admin user can manage photos.");
  }
}

export async function createAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, buildSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
