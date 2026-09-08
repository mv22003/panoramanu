'use client'

import { useEffect, useMemo, useRef, useState } from "react";

import PhotoMapShell from "@/app/components/photo-map-shell";
import { formatTakenOn } from "@/lib/photo-date";
import type { Photo } from "@/lib/photos";

type PortfolioShellProps = {
  initialPhotos: Photo[];
};

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <rect
        height="14"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.8"
        width="14"
        x="5"
        y="5"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.8" cy="7.6" fill="currentColor" r="1" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.33 6.84 9.68.5.1.68-.22.68-.5 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.61.07-.61 1 .07 1.53 1.05 1.53 1.05.88 1.56 2.32 1.11 2.88.85.09-.66.34-1.11.62-1.37-2.22-.26-4.56-1.15-4.56-5.1 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.32.1-2.75 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.9c.85 0 1.71.12 2.51.35 1.91-1.34 2.75-1.06 2.75-1.06.55 1.43.2 2.49.1 2.75.64.72 1.03 1.64 1.03 2.77 0 3.96-2.35 4.83-4.58 5.08.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .28.18.61.69.5A10.23 10.23 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="10" fill="currentColor" r="2.1" />
    </svg>
  );
}

function MagnifierIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15.2 15.2 4.3 4.3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function PortfolioShell({ initialPhotos }: PortfolioShellProps) {
  const [photos] = useState(initialPhotos);
  const [selectedPhotoId, setSelectedPhotoId] = useState("");
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [heroPhotoIndex, setHeroPhotoIndex] = useState(0);
  const [zoomedPhotoId, setZoomedPhotoId] = useState("");
  const galleryCardRefs = useRef(new Map<string, HTMLButtonElement>());
  const mapSectionRef = useRef<HTMLElement | null>(null);

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedPhotoId),
    [photos, selectedPhotoId],
  );
  const slideshowPhotos = useMemo(
    () => photos.filter((photo) => photo.slideshowImageUrl),
    [photos],
  );
  const heroPhoto = slideshowPhotos[heroPhotoIndex] ?? slideshowPhotos[0];
  const zoomedPhoto = useMemo(
    () => photos.find((photo) => photo.id === zoomedPhotoId),
    [photos, zoomedPhotoId],
  );
  const countriesCount = useMemo(
    () =>
      new Set(
        photos
          .map((photo) => photo.countryName.trim())
          .filter(Boolean),
      ).size,
    [photos],
  );

  useEffect(() => {
    if (slideshowPhotos.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setHeroPhotoIndex((currentIndex) => (currentIndex + 1) % slideshowPhotos.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [slideshowPhotos]);

  useEffect(() => {
    if (!zoomedPhoto) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setZoomedPhotoId("");
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [zoomedPhoto]);

  function selectPhotoAndScrollToGallery(photoId: string) {
    setSelectedPhotoId(photoId);

    window.requestAnimationFrame(() => {
      galleryCardRefs.current.get(photoId)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  function selectPhotoAndScrollToMap(photoId: string) {
    setSelectedPhotoId(photoId);

    window.requestAnimationFrame(() => {
      mapSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  function renderPhotoSurface(photo: Photo, mode: "hero" | "gallery") {
    const heroSource = photo.slideshowImageUrl;

    if (!(mode === "hero" ? heroSource : photo.imageUrl)) {
      return (
        <div
          className={`flex items-center justify-center bg-[radial-gradient(circle_at_top,#2a241d_0%,#16120e_60%,#0f0d0a_100%)] text-stone-500 ${
            mode === "hero" ? "h-full w-full" : "aspect-[4/3]"
          }`}
        >
          <div className="px-6 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-600">
              Image pending
            </p>
            <p className="mt-3 text-sm text-stone-500">
              Upload this frame from the admin area to restore the preview.
            </p>
          </div>
        </div>
      );
    }

    if (mode === "gallery") {
      return (
        <div className="relative w-full overflow-hidden bg-[#0f0d0a]">
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-24 blur-2xl saturate-[0.82]"
            src={photo.imageUrl}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06)_0%,rgba(18,16,13,0.14)_26%,rgba(10,9,7,0.72)_100%)]" />
          <img
            alt={photo.title}
            className="relative z-10 block h-auto w-full transition duration-500 group-hover:scale-[1.015]"
            src={photo.imageUrl}
          />
        </div>
      );
    }

    return (
      <img
        alt={photo.title}
        className="h-full w-full object-cover"
        src={heroSource}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#232019_0%,#15120f_48%,#0b0a08_100%)] text-stone-100">
      {zoomedPhoto ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(6,5,4,0.94)] px-4 py-6 sm:px-6"
          onClick={() => setZoomedPhotoId("")}
          role="dialog"
        >
          <button
            aria-label="Close zoomed photo"
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-stone-700/80 bg-[#12100d]/90 text-stone-300 transition hover:border-stone-500 hover:text-stone-50"
            onClick={() => setZoomedPhotoId("")}
            type="button"
          >
            <span className="text-lg leading-none">×</span>
          </button>
          <div
            className="flex max-h-full w-full max-w-6xl flex-col gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
              {zoomedPhoto.imageUrl ? (
                <img
                  alt={zoomedPhoto.title}
                  className="h-auto max-h-[calc(100vh-12rem)] w-auto max-w-[calc(100vw-3rem)] object-contain shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:max-w-[calc(100vw-5rem)]"
                  src={zoomedPhoto.imageUrl}
                />
              ) : null}
            </div>
            <div className="mx-auto w-full max-w-3xl border-t border-stone-800/80 pt-4 text-center">
              <p className="text-xl font-semibold text-stone-50">{zoomedPhoto.title}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-stone-400">
                {zoomedPhoto.locationName}
              </p>
              {zoomedPhoto.takenOn ? (
                <p className="mt-2 text-sm text-stone-500">
                  {formatTakenOn(zoomedPhoto.takenOn)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <section className="rounded-[2rem] border border-stone-800/80 bg-[#171411]/92 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              35mm film journal
            </p>
            <div className="relative z-20">
              <button
                aria-expanded={isAccessOpen}
                aria-label="Toggle access menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-800/80 bg-[#12100d]/80 text-stone-400 transition hover:border-stone-700 hover:text-stone-200"
                onClick={() => setIsAccessOpen((open) => !open)}
                type="button"
              >
                <span className="flex flex-col gap-1.5">
                  <span className="block h-px w-4 bg-current" />
                  <span className="block h-px w-4 bg-current" />
                  <span className="block h-px w-4 bg-current" />
                </span>
              </button>
              <div
                className={`absolute right-0 top-12 z-10 w-44 rounded-[1.25rem] border border-stone-800/80 bg-[#12100d]/96 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition ${
                  isAccessOpen
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                }`}
              >
                <a
                  className="block rounded-[0.9rem] px-3 py-2 text-sm text-stone-300 transition hover:bg-stone-900/80 hover:text-stone-50"
                  href="/login"
                >
                  Admin access
                </a>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,36rem)] lg:items-center">
            <div className="max-w-3xl lg:self-center">
              <h1 className="text-4xl font-semibold tracking-tight text-stone-50 sm:text-5xl">
                panoramanu
              </h1>
              <p className="mt-4 text-sm leading-7 text-stone-300 sm:text-base">
                A personal archive of film photographs gathered across streets,
                stations, parks, and passing light. Each frame stays close to its
                place, so the collection reads like a map of where the camera has
                been.
              </p>
              <div className="mt-6 space-y-3 text-xs uppercase tracking-[0.18em] text-stone-500">
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full border border-stone-800/80 px-3 py-1.5 text-stone-400">
                    {photos.length} frames
                  </span>
                  <span className="rounded-full border border-stone-800/80 px-3 py-1.5 text-stone-400">
                    {countriesCount} {countriesCount === 1 ? "country" : "countries"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-stone-800/80 px-3 py-1.5 transition hover:border-stone-700 hover:text-stone-300"
                    href="https://instagram.com/panoramanu_"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <InstagramIcon />
                    Instagram / @panoramanu_
                  </a>
                  <a
                    className="inline-flex items-center gap-2 rounded-full border border-stone-800/80 px-3 py-1.5 transition hover:border-stone-700 hover:text-stone-300"
                    href="https://github.com/mv22003/panoramanu"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <GitHubIcon />
                    GitHub / panoramanu
                  </a>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.6rem] border border-stone-800/80 bg-[#12100d]/80 lg:justify-self-end">
              {heroPhoto ? (
                <button
                  aria-label={`Open ${heroPhoto.title} in the gallery`}
                  className="relative block aspect-[16/10] w-full text-left"
                  onClick={() => selectPhotoAndScrollToGallery(heroPhoto.id)}
                  type="button"
                >
                  {renderPhotoSurface(heroPhoto, "hero")}
                  <div className="absolute inset-x-0 bottom-0 border-t border-stone-800/80 bg-[#12100d] px-5 py-4">
                    <p className="text-right text-xs uppercase tracking-[0.22em] text-stone-300">
                      {heroPhoto.locationName}
                    </p>
                  </div>
                </button>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center text-sm text-stone-500">
                  Add an unframed image to start the slideshow.
                </div>
              )}
            </div>
          </div>
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

          <div className="mt-8 columns-1 gap-5 md:columns-2">
            {photos.map((photo) => {
              const isSelected = photo.id === selectedPhoto?.id;

              return (
                <article
                  key={photo.id}
                  className={`group mb-5 inline-block w-full break-inside-avoid overflow-hidden rounded-b-[1.5rem] border text-left align-top transition ${
                    isSelected
                      ? "border-[#8a7148] bg-[#1d1812] shadow-[0_18px_40px_rgba(138,113,72,0.14)]"
                      : "border-stone-800 bg-stone-950/70 hover:-translate-y-0.5 hover:border-stone-700"
                  }`}
                >
                  <button
                    className="block w-full text-left"
                    ref={(node) => {
                      if (node) {
                        galleryCardRefs.current.set(photo.id, node);
                        return;
                      }

                      galleryCardRefs.current.delete(photo.id);
                    }}
                    onClick={() =>
                      setSelectedPhotoId((currentId) => (currentId === photo.id ? "" : photo.id))
                    }
                    type="button"
                  >
                    <div className="overflow-hidden bg-stone-900">
                      {renderPhotoSurface(photo, "gallery")}
                    </div>
                  </button>
                  <div className="relative p-5 pr-24">
                    <button
                      className="block w-full text-left"
                      onClick={() =>
                        setSelectedPhotoId((currentId) => (currentId === photo.id ? "" : photo.id))
                      }
                      type="button"
                    >
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-stone-50">
                          {photo.title}
                        </h3>
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                          {photo.locationName}
                        </p>
                      </div>
                    </button>
                    {photo.description ? (
                      <button
                        className="mt-3 block w-full text-left text-sm leading-6 text-stone-300"
                        onClick={() =>
                          setSelectedPhotoId((currentId) => (currentId === photo.id ? "" : photo.id))
                        }
                        type="button"
                      >
                        {photo.description}
                      </button>
                    ) : null}
                    <button
                      className="mt-3 block text-left text-xs text-stone-500"
                      onClick={() =>
                        setSelectedPhotoId((currentId) => (currentId === photo.id ? "" : photo.id))
                      }
                      type="button"
                    >
                      {photo.takenOn ? `${formatTakenOn(photo.takenOn)} | ` : ""}
                      {photo.lat.toFixed(4)}, {photo.lng.toFixed(4)}
                    </button>
                    <div className="absolute bottom-5 right-5 flex gap-2">
                      <button
                        aria-label={`Show ${photo.title} on the map`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-700 text-stone-500 transition hover:border-stone-500 hover:text-stone-300"
                        onClick={() => selectPhotoAndScrollToMap(photo.id)}
                        type="button"
                      >
                        <MapPinIcon />
                      </button>
                      <button
                        aria-label={`Zoom ${photo.title}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-700 text-stone-500 transition hover:border-stone-500 hover:text-stone-300"
                        onClick={() => setZoomedPhotoId(photo.id)}
                        type="button"
                      >
                        <MagnifierIcon />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section ref={mapSectionRef}>
          <div className="overflow-hidden rounded-[2rem] border border-stone-800/80 bg-[#12100d]/88 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
            <div className="flex items-center justify-between gap-4 border-b border-stone-800/80 px-6 py-4 sm:px-8">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                Map view
              </p>
              {selectedPhoto ? (
                <button
                  className="appearance-none border-0 bg-transparent p-0 font-inherit text-inherit"
                  onClick={() => setSelectedPhotoId("")}
                  type="button"
                >
                  <span className="text-xs uppercase tracking-[0.28em] text-stone-500 transition hover:text-stone-200">
                    See different image
                  </span>
                </button>
              ) : (
                <p className="text-xs text-stone-500">Photo location context</p>
              )}
            </div>
            <div className="relative">
              {selectedPhoto ? (
                <div className="pointer-events-none absolute right-4 top-4 z-[500] inline-flex w-fit max-w-[13rem] flex-col overflow-hidden rounded-b-[1.25rem] border border-stone-800/90 bg-[#12100d]/96 shadow-[0_18px_45px_rgba(0,0,0,0.4)] sm:right-6 sm:top-6">
                  <div className="relative w-full overflow-hidden bg-stone-950">
                    {selectedPhoto.imageUrl ? (
                      <>
                        <img
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-28 blur-2xl saturate-[0.82]"
                          src={selectedPhoto.imageUrl}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05)_0%,rgba(18,16,13,0.1)_26%,rgba(10,9,7,0.66)_100%)]" />
                        <div className="relative flex w-full max-h-[13rem] min-h-[8.5rem] items-center justify-center">
                          <img
                            alt={selectedPhoto.title}
                            className="block h-auto max-h-[13rem] w-auto max-w-[13rem] self-center"
                            src={selectedPhoto.imageUrl}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex min-h-[8.5rem] min-w-[9rem] max-w-[13rem] items-center justify-center bg-[radial-gradient(circle_at_top,#2a241d_0%,#16120e_60%,#0f0d0a_100%)] px-4 text-center text-xs uppercase tracking-[0.22em] text-stone-500">
                        Image pending
                      </div>
                    )}
                  </div>
                  <div className="max-w-[13rem] space-y-2 border-t border-stone-800/80 px-3 py-3">
                    <p className="text-sm font-semibold text-stone-100">
                      {selectedPhoto.title}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
                      {selectedPhoto.locationName}
                    </p>
                    {selectedPhoto.takenOn ? (
                      <p className="text-[11px] text-stone-500">
                        {formatTakenOn(selectedPhoto.takenOn)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <PhotoMapShell
                onSelectPhoto={setSelectedPhotoId}
                photos={photos}
                selectedPhotoId={selectedPhotoId}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
