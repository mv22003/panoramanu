import AboutHeader from "@/app/components/about-header";
import SiteFooter from "@/app/components/site-footer";

export const metadata = {
  title: "Privacy & Cookies | panoramanu",
  description: "How panoramanu uses cookies, analytics, and affiliate links.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#232019_0%,#15120f_48%,#0b0a08_100%)] px-5 py-8 text-stone-100 sm:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <AboutHeader />

        <header className="rounded-[2rem] border border-stone-800/80 bg-[#171411]/92 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Site information</p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-stone-50 sm:text-6xl">
            Privacy &amp; cookies
          </h1>
          <p className="mt-5 text-sm leading-7 text-stone-400">Last updated: 10 September 2026</p>
        </header>

        <section className="space-y-8 rounded-[2rem] border border-stone-800/80 bg-[#171411]/92 p-6 text-sm leading-7 text-stone-300 shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-10">
          <div>
            <h2 className="text-xl font-semibold text-stone-50">Cookies and analytics</h2>
            <p className="mt-3">
              panoramanu uses one strictly functional cookie to remember your cookie choice. If you accept, the site loads Vercel Analytics to provide aggregate information about site usage. Analytics is not loaded unless you accept, and you can decline without losing access to the site.
            </p>
            <p className="mt-3">
              To change your choice, delete the <code className="text-stone-200">panoramanu_cookie_consent</code> cookie in your browser and revisit the site.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-50">Contact</h2>
            <p className="mt-3">
              If you email panoramanu, your email address and message will be used only to respond to your enquiry. Email is handled by your email provider and is not submitted through a form on this site.
            </p>
            <p className="mt-3">Contact: <a className="text-amber-200 hover:text-amber-100" href="mailto:panoramanuu@gmail.com">panoramanuu@gmail.com</a></p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-50">Affiliate links</h2>
            <p className="mt-3">
              Some equipment links on the About page are Amazon affiliate links. If you buy through one of those links, panoramanu may earn a commission at no additional cost to you. panoramanu is an Amazon Associate and earns from qualifying purchases.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-stone-50">Questions</h2>
            <p className="mt-3">For privacy questions, please use the contact address above.</p>
          </div>
        </section>

        <SiteFooter includeAbout includePrivacy={false} />
      </div>
    </main>
  );
}
