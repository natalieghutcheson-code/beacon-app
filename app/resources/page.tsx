import type { Metadata } from "next";
import Link from "next/link";
import { ResourceTabsClient } from "@/components/resources/ResourceTabsClient";
import {
  BROWSE_TOPIC_LINKS,
  FEATURED_GUIDE,
  TOPIC_CHIPS,
} from "@/lib/resources-data";

export const metadata: Metadata = {
  title: "Grant Guides & Resources — Beacon",
  description:
    "Guides, templates, and compliance notes for city, county, and regional teams — how to read NOFOs, meet match rules, prepare federal applications, and navigate public funding programs with confidence.",
  openGraph: {
    title: "Grant Guides & Resources — Beacon",
    description:
      "Practical guides on grant eligibility, NOFOs, match requirements, and application documents for local governments and nonprofits.",
  },
};

export default function ResourcesPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        {/* 1. Header */}
        <header className="mb-10 lg:mb-12 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2D4A2D] mb-3">Library</p>
          <h1 className="font-display italic text-charcoal text-3xl sm:text-4xl lg:text-[40px] font-normal leading-tight">
            Grant Guides & Resources
          </h1>
          <p className="mt-3 text-base sm:text-lg text-charcoal/60 leading-relaxed">
            Beacon helps you <strong className="font-semibold text-charcoal/75">find</strong>,{" "}
            <strong className="font-semibold text-charcoal/75">evaluate</strong>, and{" "}
            <strong className="font-semibold text-charcoal/75">apply</strong> for funding with clearer NOFO reading,
            realistic internal reviews, and compliance awareness — so public dollars go further with less thrash.
          </p>
          <p className="mt-3 text-sm text-charcoal/50">
            Looking for live opportunities? Start with{" "}
            <Link href="/discover" className="font-semibold text-[#2D4A2D] hover:underline">
              Discover
            </Link>{" "}
            or browse by{" "}
            <Link href="/categories" className="font-semibold text-[#2D4A2D] hover:underline">
              category
            </Link>
            .
          </p>

          <div className="mt-6 flex flex-wrap gap-2" aria-label="Popular resource topics">
            {TOPIC_CHIPS.map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className="text-xs font-medium px-3 py-2 rounded-full bg-white border border-[#E8E0D0] text-charcoal/70 hover:border-[#2D4A2D] hover:text-[#2D4A2D] transition-colors shadow-sm"
              >
                {chip.label}
              </Link>
            ))}
          </div>

          <form action="/discover" method="get" className="mt-6 max-w-md">
            <label htmlFor="resource-search" className="sr-only">
              Search grants (Discover)
            </label>
            <div className="flex rounded-xl border border-[#E8E0D0] bg-white shadow-sm overflow-hidden focus-within:border-[#2D4A2D] focus-within:ring-2 focus-within:ring-[#2D4A2D]/15 transition-colors">
              <input
                id="resource-search"
                type="search"
                name="q"
                placeholder="Try “match requirements” or “NOFO”…"
                className="flex-1 min-w-0 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/35 outline-none bg-transparent"
              />
              <button
                type="submit"
                className="shrink-0 px-4 py-3 bg-[#2D4A2D] text-white text-sm font-semibold hover:bg-[#1e3320] transition-colors"
              >
                Search
              </button>
            </div>
            <p className="mt-2 text-xs text-charcoal/40">
              Sends your query to Discover to match grant listings (sample data).
            </p>
          </form>
        </header>

        {/* 2. Featured guide */}
        <section className="mb-12 lg:mb-14" aria-labelledby="featured-guide-title">
          <article className="relative overflow-hidden rounded-2xl border border-[#2D4A2D] bg-[#2D4A2D] text-white shadow-[0_12px_40px_rgba(45,74,45,0.35)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                backgroundSize: "180px 180px",
              }}
            />
            <div className="relative p-8 sm:p-10 lg:p-12 max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber/90 mb-3">Featured guide</p>
              <h2
                id="featured-guide-title"
                className="font-display text-2xl sm:text-3xl lg:text-[34px] leading-tight text-white mb-4"
              >
                {FEATURED_GUIDE.title}
              </h2>
              <p className="text-base sm:text-lg text-white/75 leading-relaxed mb-6">{FEATURED_GUIDE.summary}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/55 mb-8">
                <span>{FEATURED_GUIDE.topic}</span>
                <span className="text-white/30" aria-hidden="true">
                  ·
                </span>
                <span>{FEATURED_GUIDE.readTime}</span>
              </div>
              <Link
                href={FEATURED_GUIDE.href}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#2D4A2D] hover:bg-[#FDFAF5] transition-colors shadow-sm"
              >
                Read the guide
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        </section>

        {/* 3–4. Tabbed resource library */}
        <section className="mb-14 lg:mb-16" aria-labelledby="library-heading">
          <div className="mb-8">
            <h2 id="library-heading" className="font-display text-2xl sm:text-3xl text-charcoal">
              Guides, templates, and more
            </h2>
            <p className="mt-2 text-sm text-charcoal/50 max-w-2xl">
              Practical material for grants coordinators, budget analysts, and program leads — organized by how you use
              it in the real workflow.
            </p>
          </div>
          <ResourceTabsClient />
        </section>

        {/* 5. Browse by topic */}
        <section id="topics" className="border-t border-[#E8E0D0] pt-12" aria-labelledby="topics-heading">
          <h2 id="topics-heading" className="font-display text-2xl text-charcoal mb-2">
            Browse resources by funding topic
          </h2>
          <p className="text-sm text-charcoal/55 mb-6 max-w-2xl">
            Jump to Discover with a topic filter, then layer eligibility and deadlines. For the full taxonomy, see{" "}
            <Link href="/categories" className="font-semibold text-[#2D4A2D] hover:underline">
              Categories
            </Link>
            .
          </p>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 list-none p-0 m-0">
            {BROWSE_TOPIC_LINKS.map((row) => (
              <li key={row.label}>
                <Link
                  href={row.href}
                  className="flex items-center justify-center rounded-xl border border-[#E8E0D0] bg-white px-4 py-3.5 text-sm font-semibold text-charcoal shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-[#2D4A2D] hover:text-[#2D4A2D] hover:shadow-md transition-all text-center"
                >
                  {row.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
