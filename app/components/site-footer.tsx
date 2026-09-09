function GitHubIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.33 6.84 9.68.5.1.68-.22.68-.5 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.61.07-.61 1 .07 1.53 1.05 1.53 1.05.88 1.56 2.32 1.11 2.88.85.09-.66.34-1.11.62-1.37-2.22-.26-4.56-1.15-4.56-5.1 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.32.1-2.75 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.9c.85 0 1.71.12 2.51.35 1.91-1.34 2.75-1.06 2.75-1.06.55 1.43.2 2.49.1 2.75.64.72 1.03 1.64 1.03 2.77 0 3.96-2.35 4.83-4.58 5.08.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .28.18.61.69.5A10.23 10.23 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle cx="8.5" cy="15.5" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m11 13 8-8m-2 2 2 2m-5 1 2 2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 20c.5-4 4.2-6.5 9-6.5s8.5 2.5 9 6.5H3Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function SiteFooter({ includeAbout = false }: { includeAbout?: boolean }) {
  return (
    <footer className="flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-stone-800/60 pt-6 text-xs uppercase tracking-[0.18em] text-stone-500">
      {includeAbout ? (
        <a className="inline-flex items-center gap-2 transition hover:text-stone-300" href="/about">
          <AboutIcon />
          About
        </a>
      ) : null}
      <a className="inline-flex items-center gap-2 transition hover:text-stone-300" href="https://github.com/mv22003/panoramanu" rel="noreferrer" target="_blank">
        <GitHubIcon />
        GitHub
      </a>
      <a className="inline-flex items-center gap-2 transition hover:text-stone-300" href="/login">
        <KeyIcon />
        Admin
      </a>
    </footer>
  );
}
