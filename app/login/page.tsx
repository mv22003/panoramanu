import Link from "next/link";

import LoginForm from "@/app/login/login-form";
import { isAdminAuthConfigured } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

function getErrorMessage(error: string | undefined) {
  switch (error) {
    case "invalid-key":
      return "That admin key is not valid.";
    case "try-later":
      return "Too many login attempts. Please try again in a few minutes.";
    case "setup":
      return "Add ADMIN_ACCESS_KEY and ADMIN_SESSION_SECRET to your local environment.";
    default:
      return "";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-5 py-10 sm:px-8">
      <section className="w-full rounded-[2rem] border border-stone-800/80 bg-[#141210]/94 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">The back room</p>
          <Link
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-700/80 text-xs uppercase tracking-[0.18em] text-stone-400 transition hover:border-stone-500 hover:text-stone-100 sm:h-auto sm:w-auto sm:px-4 sm:py-2"
            href="/"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 5-7 7 7 7M5 12h14" />
            </svg>
            <span className="sr-only">Back to gallery</span>
          </Link>
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-50">
          Looking for the photo cupboard?
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-300">
          This is the little back room for adding photographs. If you’re here to
          browse, the gallery is through the other door.
        </p>

        {isAdminAuthConfigured() ? (
          <LoginForm error={errorMessage} />
        ) : (
          <div className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm leading-7 text-amber-100">
            The back room isn’t set up yet.
          </div>
        )}
      </section>
    </main>
  );
}
