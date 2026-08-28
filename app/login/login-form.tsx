type LoginFormProps = {
  error?: string;
};

export default function LoginForm({ error }: LoginFormProps) {
  return (
    <form action="/auth/login" className="mt-8 space-y-4" method="post">
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Admin key
        </span>
        <input
          autoComplete="current-password"
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="accessKey"
          placeholder="Enter your private admin key"
          required
          type="password"
        />
      </label>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <button
        className="inline-flex w-full items-center justify-center rounded-full bg-amber-200 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100"
        type="submit"
      >
        Enter admin area
      </button>
    </form>
  );
}
