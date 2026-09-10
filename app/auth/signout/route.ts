import { NextResponse, type NextRequest } from "next/server";

import { clearAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  await clearAdminSession();

  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
}
