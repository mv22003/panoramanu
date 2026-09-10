"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function AboutHeader() {
  const headerRef = useRef<HTMLElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function updateHeader() {
      setIsScrolled((headerRef.current?.getBoundingClientRect().top ?? 1) <= 0);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    window.addEventListener("resize", updateHeader);

    return () => {
      window.removeEventListener("scroll", updateHeader);
      window.removeEventListener("resize", updateHeader);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-[900] isolate flex flex-wrap items-center justify-between gap-4 border-b border-stone-800/80 px-6 py-3 transition-shadow duration-300 sm:px-0 ${
        isScrolled ? "shadow-[0_14px_30px_rgba(0,0,0,0.18)]" : ""
      }`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 -z-10 w-full transition-colors duration-300 ${
          isScrolled ? "bg-[#191712]" : "bg-transparent"
        }`}
      />
      <Link
        className="text-xl font-semibold tracking-tight text-stone-100 transition hover:text-amber-200"
        href="/"
      >
        panoramanu
      </Link>
      <Link
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-700/80 text-xs uppercase tracking-[0.18em] text-stone-400 transition hover:border-stone-500 hover:text-stone-100 sm:h-auto sm:w-auto sm:px-4 sm:py-2"
        href="/"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5 sm:hidden"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 5-7 7 7 7M5 12h14" />
        </svg>
        <span className="sr-only sm:not-sr-only">Back to gallery</span>
      </Link>
    </header>
  );
}
