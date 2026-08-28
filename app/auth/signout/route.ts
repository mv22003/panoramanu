import { NextResponse, type NextRequest } from "next/server";

import { clearAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await clearAdminSession();

  return NextResponse.redirect(new URL("/login", request.url), {
    status: 302,
  });
}
