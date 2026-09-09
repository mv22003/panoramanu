import Link from "next/link";

export const metadata = {
  title: "About | panoramanu",
  description: "The photographer, camera, and film behind panoramanu.",
};

const equipment = [
  {
    label: "Camera",
    value: "Kodak Ektar H35",
    detail: "A compact half-frame 35mm film camera.",
    imagePath: "/about/camera.jpg",
  },
  {
    label: "Film",
    value: "Kodak UltraMax 400",
    detail: "A versatile 35mm color film rated at ISO 400.",
    imagePath: "/about/film.png",
  },
];

function GitHubIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.33 6.84 9.68.5.1.68-.22.68-.5 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.61.07-.61 1 .07 1.53 1.05 1.53 1.05.88 1.56 2.32 1.11 2.88.85.09-.66.34-1.11.62-1.37-2.22-.26-4.56-1.15-4.56-5.1 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.32.1-2.75 0 0 .84-.28 2.75 1.06A9.3 9.3 0 0 1 12 6.9c.85 0 1.71.12 2.51.35 1.91-1.34 2.75-1.06 2.75-1.06.55 1.43.2 2.49.1 2.75.64.72 1.03 1.64 1.03 2.77 0 3.96-2.35 4.83-4.58 5.08.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .28.18.61.69.5A10.23 10.23 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
      <rect height="14" rx="2" stroke="currentColor" strokeWidth="1.8" width="18" x="3" y="5" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
      <rect height="14" rx="4" stroke="currentColor" strokeWidth="1.8" width="14" x="5" y="5" />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.8" cy="7.6" fill="currentColor" r="1" />
    </svg>
  );
}

export default async function AboutPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#232019_0%,#15120f_48%,#0b0a08_100%)] px-5 py-8 text-stone-100 sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="flex items-center justify-between gap-4 border-b border-stone-800/80 pb-5">
          <Link
            className="text-xl font-semibold tracking-tight text-stone-100 transition hover:text-amber-200"
            href="/"
          >
            panoramanu
          </Link>
          <Link
            className="rounded-full border border-stone-700/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-stone-400 transition hover:border-stone-500 hover:text-stone-100"
            href="/"
          >
            Back to gallery
          </Link>
        </header>

        <section className="grid gap-8 rounded-[2rem] border border-stone-800/80 bg-[#171411]/92 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:items-center lg:p-14">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              About the photographer
            </p>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-stone-50 sm:text-6xl">
              The person behind the frames.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
              Hey, I'm Manuel Verduzco, a proud Mexican living in the UK. Photography is my
              hobby, and a way for me to pay closer attention to the places and
              moments around me.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
              I especially love taking photographs with people in them. Their
              presence makes every image feel unique.
            </p>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] border border-stone-800/80 bg-[#0f0d0a]">
            <img
              alt="The photographer behind panoramanu"
              className="aspect-[4/5] h-full w-full object-cover"
              src="/about/photographer.jpg"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-stone-800/80 bg-[#141210]/94">
          <div className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">The setup</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-50 sm:text-3xl">
              The simple tools behind the collection.
            </h2>
          </div>

          <div className="grid gap-px border-t border-stone-800/80 bg-stone-800/80 sm:grid-cols-2">
            {equipment.map((item) => (
              <article className="flex items-start gap-5 bg-[#141210] p-6 sm:p-8" key={item.label}>
                <div className="w-36 shrink-0 overflow-hidden rounded-[1.25rem] border border-stone-800/80 bg-[#0f0d0a] sm:w-44">
                  <img
                    alt={`${item.label} used by panoramanu`}
                    className="aspect-[4/3] h-full w-full object-cover"
                    src={item.imagePath}
                  />
                </div>
                <div className="min-w-0 pt-1">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{item.label}</p>
                  <h3 className="mt-3 text-lg font-semibold text-stone-100">{item.value}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-500">{item.detail}</p>
                  <span className="mt-4 inline-block text-xs uppercase tracking-[0.18em] text-stone-400">
                    View {item.label.toLowerCase()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] border border-stone-800/80 bg-[#171411]/92 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Contact</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-50">
              Say hello.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-stone-400 transition hover:border-stone-500 hover:text-stone-100"
              href="mailto:panoramanuu@gmail.com"
            >
              <MailIcon />
              panoramanuu@gmail.com
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-full border border-stone-700/80 px-4 py-2 text-xs uppercase tracking-[0.18em] text-stone-400 transition hover:border-stone-500 hover:text-stone-100"
              href="https://instagram.com/panoramanu_"
              rel="noreferrer"
              target="_blank"
            >
              <InstagramIcon />
              Instagram / @panoramanu_
            </a>
          </div>
        </section>

        <footer className="flex justify-center border-t border-stone-800/60 pt-6 text-xs uppercase tracking-[0.18em] text-stone-500">
          <a
            className="inline-flex items-center gap-2 transition hover:text-stone-300"
            href="https://github.com/mv22003/panoramanu"
            rel="noreferrer"
            target="_blank"
          >
            <GitHubIcon />
            GitHub
          </a>
        </footer>
      </div>
    </main>
  );
}
