import { NextResponse, type NextRequest } from "next/server";

import {
  createAdminSession,
  isAdminAccessKeyValid,
  isAdminAuthConfigured,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=setup", request.url), {
      status: 302,
    });
  }

  const formData = await request.formData();
  const accessKey = String(formData.get("accessKey") ?? "");

  if (!isAdminAccessKeyValid(accessKey)) {
    return NextResponse.redirect(new URL("/login?error=invalid-key", request.url), {
      status: 302,
    });
  }

  await createAdminSession();

  return NextResponse.redirect(new URL("/admin", request.url), {
    status: 302,
  });
}
