import Link from "next/link";
import { ArrowRight, BarChart3, Sparkles, WandSparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_55%,#ffffff_100%)] px-6 py-10 text-slate-900 md:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="flex items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/70 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">TopicMap.ai prototype</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Semantic content gaps, visualized.</h1>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Open demo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              GitHub Pages ready, backend optional
            </div>
            <div className="space-y-4">
              <h2 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl">
                Turn competitor pages into a map of opportunities.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                TopicMap.ai scrapes a site, embeds the pages, projects them into a 2D semantic map,
                and turns empty regions into article briefs. The prototype works as a static GitHub
                Pages app and can optionally connect to your backend for live analysis.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500"
              >
                Launch dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#prototype"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                See what&apos;s included
              </a>
            </div>
          </div>

          <div id="prototype" className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Semantic map",
                icon: BarChart3,
                text: "Interactive scatter plot with hover, click, and selection wiring.",
              },
              {
                title: "Gap briefs",
                icon: WandSparkles,
                text: "Background clicks generate concise article briefs and keyword clusters.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
                <item.icon className="h-5 w-5 text-cyan-600" />
                <h3 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
            <article className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Prototype mode</p>
              <p className="mt-3 text-base leading-7 text-slate-200">
                The app boots with demo data by default, so it is publishable on GitHub Pages without
                a backend. Add `NEXT_PUBLIC_API_BASE_URL` locally to switch the dashboard to live
                analysis.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
