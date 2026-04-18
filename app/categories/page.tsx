import type { Metadata } from "next";
import Link from "next/link";
import {
  BROWSE_CATEGORIES,
  POPULAR_SEARCHES,
  TOTAL_BROWSE_CATEGORIES,
  TOTAL_TRACKED_GRANTS_MOCK,
  type BrowseCategory,
} from "@/lib/categories-data";

export const metadata: Metadata = {
  title: "Browse Categories — Beacon",
  description:
    "Explore federal and federal-pass-through funding by program area — housing, infrastructure, climate, workforce, and more.",
};

function discoverHref(cat: BrowseCategory) {
  return `/discover?category=${encodeURIComponent(cat.filterLabel)}`;
}

export default function CategoriesPage() {
  const featured = BROWSE_CATEGORIES.filter((c) => c.featured);

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        {/* Header */}
        <header className="mb-10 lg:mb-12 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2D4A2D] mb-3">
            Funding areas
          </p>
          <h1 className="font-display italic text-charcoal text-3xl sm:text-4xl lg:text-[40px] font-normal leading-tight">
            Browse Categories
          </h1>
          <p className="mt-3 text-base sm:text-lg text-charcoal/60 leading-relaxed">
            Explore opportunities by program area — from housing and broadband to climate and public safety. Pick a
            category to open Discover with that filter applied, or refine further with eligibility and deadlines.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-charcoal/50">
            <span>
              <span className="font-semibold text-[#2D4A2D] tabular-nums">{TOTAL_BROWSE_CATEGORIES}</span> funding
              areas
            </span>
            <span className="text-charcoal/25 hidden sm:inline">·</span>
            <span>
              <span className="font-semibold text-[#2D4A2D] tabular-nums">
                {TOTAL_TRACKED_GRANTS_MOCK.toLocaleString()}
              </span>{" "}
              active opportunities tracked (sample data)
            </span>
          </div>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {BROWSE_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              id={cat.id}
              href={discoverHref(cat)}
              className="group flex flex-col bg-white rounded-2xl border border-[#E8E0D0] border-t-[3px] border-t-[#2D4A2D] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-lg hover:shadow-charcoal/5 hover:-translate-y-0.5 hover:border-[#BEB4A8] transition-all duration-200 min-h-[220px]"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#2D4A2D]/8 flex items-center justify-center text-[#2D4A2D] group-hover:bg-[#2D4A2D] group-hover:text-white transition-colors duration-200">
                  <CategoryGlyph id={cat.id} size={22} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber/10 text-amber border border-amber/25 tabular-nums shrink-0">
                  {cat.grantCount.toLocaleString()} grants
                </span>
              </div>
              <h2 className="font-bold text-charcoal text-lg leading-snug mb-2">{cat.name}</h2>
              <p className="text-sm text-charcoal/60 leading-relaxed flex-1">{cat.oneLineDescription}</p>
              <p className="mt-4 text-sm font-semibold text-[#2D4A2D] flex items-center gap-1.5 group-hover:gap-2 transition-all">
                Explore grants
                <span aria-hidden="true" className="inline-block group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </p>
            </Link>
          ))}
        </div>

        {/* Supporting sections */}
        <div className="mt-14 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Featured strip */}
          <section className="lg:col-span-5 bg-white rounded-2xl border border-[#E8E0D0] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 sm:p-7">
            <h2 className="font-display text-xl text-charcoal mb-1">Featured entry points</h2>
            <p className="text-sm text-charcoal/50 mb-5">
              High-volume areas agencies open most often — jump in with one tap.
            </p>
            <ul className="space-y-3">
              {featured.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={discoverHref(cat)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#F0EBE3] bg-[#FDFAF5] px-4 py-3 text-sm font-medium text-charcoal hover:border-[#2D4A2D]/40 hover:bg-white transition-colors"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 w-9 h-9 rounded-lg bg-[#2D4A2D]/8 flex items-center justify-center text-[#2D4A2D]">
                        <CategoryGlyph id={cat.id} size={18} />
                      </span>
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="text-xs text-charcoal/40 tabular-nums shrink-0">{cat.grantCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* How we organize + popular searches */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-[#2D4A2D] rounded-2xl p-6 sm:p-7 text-white shadow-[0_8px_32px_rgba(45,74,45,0.25)]">
              <h2 className="font-display text-xl text-white mb-3">How Beacon organizes grants</h2>
              <p className="text-sm text-white/75 leading-relaxed">
                Categories group federal and pass-through opportunities by mission and program area — the same way
                grants coordinators think about portfolios. Filters on Discover layer in eligibility, match, and
                deadlines so you move from browsing to shortlisting without losing context.
              </p>
              <Link
                href="/discover"
                className="inline-flex mt-5 text-sm font-semibold text-amber hover:text-amber/90 transition-colors"
              >
                Open full Discover →
              </Link>
            </section>

            <section className="bg-white rounded-2xl border border-[#E8E0D0] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 sm:p-7">
              <h2 className="font-display text-xl text-charcoal mb-1">Popular searches</h2>
              <p className="text-sm text-charcoal/50 mb-4">Try these keywords in Discover — or start from a category above.</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((item) => (
                  <Link
                    key={item.label}
                    href={`/discover?q=${encodeURIComponent(item.q)}`}
                    className="text-xs font-medium px-3 py-2 rounded-full bg-[#F8F5F0] border border-[#E8E0D0] text-charcoal/70 hover:border-[#2D4A2D] hover:text-[#2D4A2D] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>

            <p className="text-xs text-charcoal/40 text-center lg:text-left">
              Recently updated: Housing, Climate, and Broadband clusters refreshed this week (sample).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Simple icons keyed by category id — matches homepage metaphors where possible */
function CategoryGlyph({ id, size = 20 }: { id: string; size?: number }) {
  const s = size;
  const common = { width: s, height: s, viewBox: "0 0 24 24", fill: "none" as const, stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };

  switch (id) {
    case "housing":
      return (
        <svg {...common}>
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      );
    case "broadband":
      return (
        <svg {...common}>
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" fill="currentColor" />
        </svg>
      );
    case "infrastructure":
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      );
    case "parks":
      return (
        <svg {...common}>
          <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case "workforce":
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "climate":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
        </svg>
      );
    case "education":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="8" y1="7" x2="16" y2="7" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      );
    case "public-health":
      return (
        <svg {...common}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case "arts":
      return (
        <svg {...common}>
          <circle cx="13.5" cy="6.5" r="2.5" />
          <path d="M4 20s2.5-4 9-4 9 4 9 4" />
        </svg>
      );
    case "research":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M8 7h6M8 11h4" strokeWidth="1.5" />
          <circle cx="16" cy="14" r="2" />
        </svg>
      );
    case "public-safety":
      return (
        <svg {...common} strokeWidth={1.75}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" strokeWidth="1.75" />
        </svg>
      );
    case "economic-development":
      return (
        <svg {...common}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
  }
}
