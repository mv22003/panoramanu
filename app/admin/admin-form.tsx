'use client'

import { useActionState, useEffect, useRef, useState } from "react";

import type { Photo } from "@/lib/photos";
import {
  addPhoto,
  preparePhotoUpload,
  type AdminFormState,
} from "@/app/admin/actions";

const initialAdminFormState: AdminFormState = {
  error: "",
  message: "",
};

type AdminFormProps = {
  photo?: Photo | null;
};

async function savePhotoWithUploads(
  previousState: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  try {
    const files = [
      { file: formData.get("framedImageFile"), field: "imageUrl" },
      { file: formData.get("slideshowImageFile"), field: "slideshowImageUrl" },
    ];
    formData.delete("framedImageFile");
    formData.delete("slideshowImageFile");

    for (const { file, field } of files) {
      if (!(file instanceof File) || file.size === 0) continue;

      const { upload, error } = await preparePhotoUpload(
        file.name,
        file.type,
        file.size,
      );
      if (!upload) throw new Error(error);

      const body = new FormData();
      body.append("cacheControl", "31536000");
      body.append("", file);
      const response = await fetch(upload.signedUrl, { method: "PUT", body });
      if (!response.ok) {
        throw new Error(`Unable to upload ${file.name}. Please try again (status ${response.status}).`);
      }
      formData.set(field, upload.publicUrl);
    }

    return await addPhoto(previousState, formData);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save photo. Please try again.",
      message: "",
    };
  }
}

function getTakenOnMonth(value: string | null | undefined) {
  const takenOn = String(value ?? "").trim();

  if (!takenOn) {
    return "";
  }

  return takenOn.slice(0, 7);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminForm({ photo }: AdminFormProps) {
  const [state, formAction, pending] = useActionState(savePhotoWithUploads, initialAdminFormState);
  const [framedFile, setFramedFile] = useState<File | null>(null);
  const [slideshowFile, setSlideshowFile] = useState<File | null>(null);
  const framedInputRef = useRef<HTMLInputElement>(null);
  const slideshowInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const isEditing = Boolean(photo);

  useEffect(() => {
    if (!state.message) return;

    formRef.current?.reset();
    setFramedFile(null);
    setSlideshowFile(null);
  }, [state.message]);

  function clearFile(
    inputRef: { current: HTMLInputElement | null },
    setFile: (file: File | null) => void,
  ) {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <form action={formAction} className="mt-8 grid gap-4 sm:grid-cols-2" ref={formRef}>
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

      <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2">
        <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Upload framed file{" "}
          <span className="normal-case tracking-normal text-stone-600">(optional)</span>
        </span>
        <label
          className="flex min-h-[66px] cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-stone-700 bg-stone-900/60 px-4 py-3 text-sm text-stone-300 transition hover:border-stone-600"
          htmlFor="framedImageFile"
        >
          <span className="shrink-0 rounded-full bg-amber-200 px-4 py-2 font-medium text-stone-950">Choose File</span>
          <span className="min-w-0 flex-1 truncate">
            {framedFile ? `${framedFile.name} (${formatFileSize(framedFile.size)})` : "No file chosen"}
          </span>
          {framedFile ? (
            <button
              aria-label="Deselect framed photo"
              className="shrink-0 text-lg leading-none text-stone-500 transition hover:text-stone-100"
              onClick={(event) => {
                event.preventDefault();
                clearFile(framedInputRef, setFramedFile);
              }}
              type="button"
            >
              ×
            </button>
          ) : null}
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            id="framedImageFile"
            name="framedImageFile"
            onChange={(event) => setFramedFile(event.target.files?.[0] ?? null)}
            ref={framedInputRef}
            type="file"
          />
        </label>
        <span className="mt-2 block text-xs leading-6 text-stone-500">
          Uploaded files are stored in Supabase Storage when it is configured.
        </span>
        </label>

        <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone-500">
          Upload slideshow file{" "}
          <span className="normal-case tracking-normal text-stone-600">(unframed, optional)</span>
        </span>
        <label
          className="flex min-h-[66px] cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-stone-700 bg-stone-900/60 px-4 py-3 text-sm text-stone-300 transition hover:border-stone-600"
          htmlFor="slideshowImageFile"
        >
          <span className="shrink-0 rounded-full bg-amber-200 px-4 py-2 font-medium text-stone-950">Choose File</span>
          <span className="min-w-0 flex-1 truncate">
            {slideshowFile ? `${slideshowFile.name} (${formatFileSize(slideshowFile.size)})` : "No file chosen"}
          </span>
          {slideshowFile ? (
            <button
              aria-label="Deselect slideshow photo"
              className="shrink-0 text-lg leading-none text-stone-500 transition hover:text-stone-100"
              onClick={(event) => {
                event.preventDefault();
                clearFile(slideshowInputRef, setSlideshowFile);
              }}
              type="button"
            >
              ×
            </button>
          ) : null}
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            id="slideshowImageFile"
            name="slideshowImageFile"
            onChange={(event) => setSlideshowFile(event.target.files?.[0] ?? null)}
            ref={slideshowInputRef}
            type="file"
          />
        </label>
        <span className="mt-2 block text-xs leading-6 text-stone-500">
          Only photos with an unframed image appear in the slideshow.
        </span>
        </label>
      </div>

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

      {state.error ? <p className="text-sm text-red-300 sm:col-span-2">{state.error}</p> : null}
      {state.message ? (
        <p className="text-sm text-emerald-300 sm:col-span-2">{state.message}</p>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center rounded-full bg-amber-200 px-5 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving photo..." : isEditing ? "Save changes" : "Add photo"}
      </button>
    </form>
  );
}
