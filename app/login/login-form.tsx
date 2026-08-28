'use client'

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type LoginState = {
  error: string;
  message: string;
};

const initialLoginState: LoginState = {
  error: "",
  message: "",
};

export default function LoginForm({ adminEmail }: { adminEmail: string }) {
  const [state, setState] = useState(initialLoginState);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(initialLoginState);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    if (!email) {
      setState({
        error: "Enter your admin email address.",
        message: "",
      });
      setPending(false);
      return;
    }

    if (email !== adminEmail.trim().toLowerCase()) {
      setState({
        error: "Only the configured admin email can sign in here.",
        message: "",
      });
      setPending(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        },
      });

      if (error) {
        setState({
          error: error.message,
          message: "",
        });
        setPending(false);
        return;
      }

      setState({
        error: "",
        message: "Check your email for the sign-in link.",
      });
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : "Unable to request a sign-in link.",
        message: "",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Admin email
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          defaultValue={adminEmail}
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </label>

      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-emerald-300">{state.message}</p> : null}

      <button
        className="inline-flex w-full items-center justify-center rounded-full bg-amber-200 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Sending link..." : "Email me a sign-in link"}
      </button>
    </form>
  );
}
