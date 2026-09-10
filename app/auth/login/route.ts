import { NextResponse, type NextRequest } from "next/server";

import {
  createAdminSession,
  isAdminAccessKeyValid,
  isAdminAuthConfigured,
} from "@/lib/auth";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPT_LIMIT = 10;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientIdentifier(request: NextRequest) {
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isRateLimited(identifier: string) {
  const now = Date.now();
  const current = loginAttempts.get(identifier);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > LOGIN_ATTEMPT_LIMIT;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (isRateLimited(getClientIdentifier(request))) {
    return NextResponse.redirect(new URL("/login?error=try-later", request.url), { status: 303 });
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=setup", request.url), {
      status: 303,
    });
  }

  const formData = await request.formData();
  const accessKey = String(formData.get("accessKey") ?? "");

  if (!isAdminAccessKeyValid(accessKey)) {
    return NextResponse.redirect(new URL("/login?error=invalid-key", request.url), {
      status: 303,
    });
  }

  await createAdminSession();

  return NextResponse.redirect(new URL("/admin", request.url), {
    status: 303,
  });
}
