'use client'

import { useActionState } from "react";

import type { Photo } from "@/lib/photos";
import { addPhoto, type AdminFormState } from "@/app/admin/actions";

const initialAdminFormState: AdminFormState = {
  error: "",
  message: "",
};

type AdminFormProps = {
  photo?: Photo | null;
};

function getTakenOnMonth(value: string | null | undefined) {
  const takenOn = String(value ?? "").trim();

  if (!takenOn) {
    return "";
  }

  return takenOn.slice(0, 7);
}

export default function AdminForm({ photo }: AdminFormProps) {
  const [state, formAction, pending] = useActionState(addPhoto, initialAdminFormState);
  const isEditing = Boolean(photo);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <input name="photoId" type="hidden" value={photo?.id ?? ""} />
      <input name="existingImageUrl" type="hidden" value={photo?.imageUrl ?? ""} />
      <input
        name="existingSlideshowImageUrl"
        type="hidden"
        value={photo?.slideshowImageUrl ?? ""}
      />

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Title
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="title"
          defaultValue={photo?.title ?? ""}
          placeholder="Rain on Brick Lane"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Description <span className="normal-case tracking-normal text-stone-600">(optional)</span>
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="description"
          defaultValue={photo?.description ?? ""}
          placeholder="Cinestill 800T, wet pavement, late train"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Date <span className="normal-case tracking-normal text-stone-600">(month and year)</span>
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          defaultValue={getTakenOnMonth(photo?.takenOn)}
          name="takenOnMonth"
          type="month"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Framed image URL{" "}
          <span className="normal-case tracking-normal text-stone-600">(optional if uploading)</span>
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="imageUrl"
          defaultValue={photo?.imageUrl ?? ""}
          placeholder="https://..."
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Upload framed file{" "}
          <span className="normal-case tracking-normal text-stone-600">(optional)</span>
        </span>
        <input
          accept="image/*"
          className="block w-full rounded-2xl border border-dashed border-stone-700 bg-stone-900/60 px-4 py-4 text-sm text-stone-300 file:mr-4 file:rounded-full file:border-0 file:bg-amber-200 file:px-4 file:py-2 file:text-sm file:font-medium file:text-stone-950 hover:file:bg-amber-100"
          name="framedImageFile"
          type="file"
        />
        <span className="mt-2 block text-xs leading-6 text-stone-500">
          Uploaded files are stored in Supabase Storage when it is configured.
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Slideshow image URL{" "}
          <span className="normal-case tracking-normal text-stone-600">(unframed, optional)</span>
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="slideshowImageUrl"
          defaultValue={photo?.slideshowImageUrl ?? ""}
          placeholder="https://..."
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Upload slideshow file{" "}
          <span className="normal-case tracking-normal text-stone-600">(unframed, optional)</span>
        </span>
        <input
          accept="image/*"
          className="block w-full rounded-2xl border border-dashed border-stone-700 bg-stone-900/60 px-4 py-4 text-sm text-stone-300 file:mr-4 file:rounded-full file:border-0 file:bg-amber-200 file:px-4 file:py-2 file:text-sm file:font-medium file:text-stone-950 hover:file:bg-amber-100"
          name="slideshowImageFile"
          type="file"
        />
        <span className="mt-2 block text-xs leading-6 text-stone-500">
          Only photos with an unframed image appear in the slideshow.
        </span>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Location
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="locationName"
          defaultValue={photo?.locationName ?? ""}
          placeholder="Shoreditch, London"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Instagram post URL{" "}
          <span className="normal-case tracking-normal text-stone-600">(optional)</span>
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="instagramUrl"
          defaultValue={photo?.instagramUrl ?? ""}
          placeholder="https://www.instagram.com/p/..."
          type="url"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Country <span className="normal-case tracking-normal text-stone-600">(optional, used for intro stats)</span>
        </span>
        <input
          className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
          name="countryName"
          defaultValue={photo?.countryName ?? ""}
          placeholder="United Kingdom"
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
            defaultValue={photo?.lat ?? ""}
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
            defaultValue={photo?.lng ?? ""}
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
        {pending ? "Saving photo..." : isEditing ? "Save changes" : "Add photo"}
      </button>
    </form>
  );
}
