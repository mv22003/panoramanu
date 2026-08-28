'use client'

import { useMemo, useState } from "react";

import PhotoMapShell from "@/app/components/photo-map-shell";
import type { Photo } from "@/lib/photos";

type PortfolioShellProps = {
  initialPhotos: Photo[];
};

export default function PortfolioShell({ initialPhotos }: PortfolioShellProps) {
  const [photos] = useState(initialPhotos);
  const [selectedPhotoId, setSelectedPhotoId] = useState(initialPhotos[0]?.id ?? "");

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedPhotoId) ?? photos[0],
    [photos, selectedPhotoId],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#232019_0%,#15120f_48%,#0b0a08_100%)] text-stone-100">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-stone-800/80 bg-[#171411]/92 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                35mm photo portfolio
              </p>
              <a
                className="rounded-full border border-stone-700 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-stone-400 transition hover:border-stone-600 hover:text-stone-200"
                href="/login"
              >
                Admin
              </a>
            </div>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-stone-50 sm:text-5xl">
              panoramanu
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
              A growing archive of film photographs, pinned to the places where they
              were made. Add a frame, trace it on the map, and keep the collection
              easy to curate as it grows.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#6f5b3f]/55 bg-[linear-gradient(135deg,#18140f_0%,#10100f_100%)] px-6 py-8 text-stone-100 shadow-[0_24px_80px_rgba(0,0,0,0.4)] sm:px-8">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-400">
              Selected frame
            </p>
            {selectedPhoto ? (
              <>
                <h2 className="mt-3 text-2xl font-semibold text-stone-50">
                  {selectedPhoto.title}
                </h2>
                {selectedPhoto.description ? (
                  <p className="mt-3 text-sm leading-7 text-stone-300">
                    {selectedPhoto.description}
                  </p>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-amber-200/70">
                  <span>{selectedPhoto.locationName}</span>
                  {selectedPhoto.takenOn ? <span>{selectedPhoto.takenOn}</span> : null}
                  <span>
                    {selectedPhoto.lat.toFixed(4)}, {selectedPhoto.lng.toFixed(4)}
                  </span>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-stone-300">
                Add your first photo to start mapping the collection.
              </p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-stone-800/80 bg-[#12100d]/88 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <div className="flex items-center justify-between gap-4 border-b border-stone-800/80 px-6 py-4 sm:px-8">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Map view</p>
            <p className="text-xs text-stone-500">{photos.length} photos</p>
          </div>
          <PhotoMapShell
            onSelectPhoto={setSelectedPhotoId}
            photos={photos}
            selectedPhotoId={selectedPhoto?.id ?? ""}
          />
        </section>

        <section className="rounded-[2rem] border border-stone-800/80 bg-[#141210]/94 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-8">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                Gallery
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-50">
                Photo collection
              </h2>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
              Click a frame to center the map
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {photos.map((photo) => {
              const isSelected = photo.id === selectedPhoto?.id;

              return (
                <button
                  key={photo.id}
                  className={`group overflow-hidden rounded-[1.5rem] border text-left transition ${
                    isSelected
                      ? "border-[#8a7148] bg-[#1d1812] shadow-[0_18px_40px_rgba(138,113,72,0.14)]"
                      : "border-stone-800 bg-stone-950/70 hover:-translate-y-0.5 hover:border-stone-700"
                  }`}
                  onClick={() => setSelectedPhotoId(photo.id)}
                  type="button"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-stone-900">
                    <img
                      alt={photo.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      src={photo.imageUrl}
                    />
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-stone-50">
                          {photo.title}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
                          {photo.locationName}
                        </p>
                      </div>
                      <span className="rounded-full border border-stone-700 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-500">
                        map
                      </span>
                    </div>
                    {photo.description ? (
                      <p className="text-sm leading-6 text-stone-300">{photo.description}</p>
                    ) : null}
                    <p className="text-xs text-stone-500">
                      {photo.takenOn ? `${photo.takenOn} | ` : ""}
                      {photo.lat.toFixed(4)}, {photo.lng.toFixed(4)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
