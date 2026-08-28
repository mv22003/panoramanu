import { NextResponse, type NextRequest } from "next/server";

import { isAdminClaims } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const flowId = request.nextUrl.searchParams.get("sb_flow_id");
  const next = request.nextUrl.searchParams.get("next") || "/admin";
  const redirectUrl = request.nextUrl.clone();

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);

    const { data } = await supabase.auth.getClaims();

    if (isAdminClaims(data?.claims)) {
      redirectUrl.pathname = next;
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }

    await supabase.auth.signOut({ scope: "local" });
  }

  redirectUrl.pathname = "/login";
  redirectUrl.search = "?error=unauthorized";

  return NextResponse.redirect(redirectUrl);
}
