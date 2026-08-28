import { redirect } from "next/navigation";

import LoginForm from "@/app/login/login-form";
import { getAdminEmail, isAdminClaims, isSupabaseConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();

    if (isAdminClaims(data?.claims)) {
      redirect("/admin");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-10 sm:px-8">
      <section className="w-full rounded-[2rem] border border-stone-800/80 bg-[#141210]/94 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Admin access</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-50">
          Sign in to manage panoramanu
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-300">
          The public homepage stays photo-first. Only the configured admin email
          can receive a sign-in link and access the management screen.
        </p>

        {isSupabaseConfigured() ? (
          <LoginForm adminEmail={getAdminEmail()} />
        ) : (
          <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm leading-7 text-amber-100">
            Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
            and `ADMIN_EMAIL` to your local environment before using auth.
          </div>
        )}
      </section>
    </main>
  );
}
