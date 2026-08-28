'use client'

import { useActionState } from "react";

import { addPhoto, type AdminFormState } from "@/app/admin/actions";

const initialAdminFormState: AdminFormState = {
  error: "",
  message: "",
};

export default function AdminForm() {
  const [state, formAction, pending] = useActionState(addPhoto, initialAdminFormState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Title
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="title"
          placeholder="Rain on Brick Lane"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Description
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="description"
          placeholder="Cinestill 800T, wet pavement, late train"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Image URL
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="imageUrl"
          placeholder="https://..."
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Location
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="locationName"
          placeholder="Shoreditch, London"
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
            Latitude
          </span>
          <input
            className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
            inputMode="decimal"
            name="lat"
            placeholder="51.5200"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
            Longitude
          </span>
          <input
            className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
            inputMode="decimal"
            name="lng"
            placeholder="-0.0750"
            required
          />
        </label>
      </div>

      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-emerald-300">{state.message}</p> : null}

      <button
        className="inline-flex w-full items-center justify-center rounded-full bg-amber-200 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving photo..." : "Add photo"}
      </button>
    </form>
  );
}
