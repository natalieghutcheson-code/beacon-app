import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beacon — Your signal to the right funding",
};

const trendingTags = ["Infrastructure", "Digital Equity", "Rural Housing", "Workforce"];
const trendingTagHref: Record<string, string> = {
  Infrastructure: "/discover?category=Infrastructure",
  "Digital Equity": "/discover?category=Digital%20Equity",
  "Rural Housing": "/discover?category=Rural%20Housing",
  Workforce: "/discover?category=Workforce",
};

const categories = [
  {
    id: "housing",
    label: "Housing",
    description: "Affordable housing, HUD programs & community development",
    count: 142,
    icon: HousingIcon,
    featured: true,
  },
  {
    id: "broadband",
    label: "Broadband",
    description: "Internet access, digital infrastructure & connectivity",
    count: 89,
    icon: BroadbandIcon,
    featured: false,
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    description: "Roads, bridges, transit & public works funding",
    count: 217,
    icon: InfrastructureIcon,
    featured: false,
  },
  {
    id: "parks",
    label: "Parks",
    description: "Green spaces, recreation & environmental conservation",
    count: 63,
    icon: ParksIcon,
    featured: false,
  },
  {
    id: "workforce",
    label: "Workforce",
    description: "Job training, employment programs & economic mobility",
    count: 108,
    icon: WorkforceIcon,
    featured: false,
  },
  {
    id: "climate",
    label: "Climate",
    description: "Clean energy, resilience & environmental programs",
    count: 95,
    icon: ClimateIcon,
    featured: false,
  },
];

const stats = [
  { value: "$12B+", label: "Tracked Funding" },
  { value: "840", label: "Active Agencies" },
  { value: "15k", label: "Cities Served" },
  { value: "24h", label: "Data Latency" },
];

const footerLinks = [
  { label: "Discover", href: "/discover" },
  { label: "My Grants", href: "/my-grants" },
  { label: "Categories", href: "/categories" },
  { label: "Resources", href: "/resources" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

const grainTextureStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat" as const,
  backgroundSize: "180px 180px",
};

export default function HomePage() {
  return (
    <div className="bg-cream min-h-screen">
      <section className="relative overflow-hidden bg-cream">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            ...grainTextureStyle,
            opacity: 0.04,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 text-center">
          <h1 className="font-display font-normal text-charcoal leading-tight text-5xl sm:text-[72px]">
            Your signal to the
            <br />
            <em className="italic text-amber">right funding.</em>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-charcoal/60 max-w-2xl mx-auto">
            Beacon helps governments, nonprofits, and universities find and win the right grants.
          </p>

          <p className="mt-2 font-medium text-[#2D4A2D] tracking-wide" style={{ fontSize: "17px" }}>
            Built for grants coordinators at city, county, and regional agencies.
          </p>

          <div className="mt-8 max-w-2xl mx-auto">
            <form action="/discover" className="flex flex-col sm:flex-row gap-2 bg-white rounded-2xl p-2 border-2 border-[#C8BCA8] min-h-[56px] items-center" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}>
              <div className="flex items-center flex-1 gap-3 px-4 w-full">
                <SearchIcon className="text-charcoal/35 shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search grants by topic, agency, or keyword..."
                  className="flex-1 bg-transparent text-charcoal placeholder:text-charcoal/35 text-sm sm:text-base outline-none py-3 font-medium"
                />
              </div>
              <button type="submit" className="bg-forest text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-xl hover:bg-[#1e3320] active:scale-[0.98] transition-all whitespace-nowrap shadow-sm">
                Find Grants
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <span className="text-xs text-charcoal/45">
                <span className="font-bold text-[#2D4A2D]">$12B+</span> tracked funding
              </span>
              <span className="text-charcoal/20 text-xs">·</span>
              <span className="text-xs text-charcoal/45">
                <span className="font-bold text-[#2D4A2D]">840</span> active agencies
              </span>
              <span className="text-charcoal/20 text-xs">·</span>
              <span className="text-xs text-charcoal/45">Updated daily</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-charcoal/35 font-medium uppercase tracking-widest">Trending:</span>
              {trendingTags.map((tag) => (
                <Link
                  key={tag}
                  href={trendingTagHref[tag]}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/80 border border-[#D8CFC0] text-charcoal/65 hover:border-forest hover:text-forest transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-[#EAE4DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14">
          <div className="mb-8">
            <h2 className="font-display italic text-4xl sm:text-5xl font-normal text-charcoal">Explore by Category</h2>
            <p className="mt-2 italic text-charcoal/55 text-base sm:text-lg">
              Browse curated grant collections across the topics that matter most to your mission.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => {
              const Icon = cat.icon;

              if (cat.featured) {
                return (
                  <Link
                    key={cat.id}
                    href={`/discover?category=${encodeURIComponent(cat.label)}`}
                    className="group relative bg-forest rounded-2xl p-7 border border-forest hover:shadow-2xl hover:shadow-forest/20 hover:-translate-y-1 transition-all duration-200 overflow-hidden"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 pointer-events-none rounded-2xl"
                      style={{
                        ...grainTextureStyle,
                        opacity: 0.06,
                      }}
                    />
                    <div className="relative flex items-start justify-between mb-5">
                      <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center text-white">
                        <Icon size={26} />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber/20 text-amber border border-amber/30">
                        {cat.count} grants
                      </span>
                    </div>
                    <h3 className="relative font-bold text-white mb-1" style={{ fontSize: "20px" }}>{cat.label}</h3>
                    <p className="relative text-sm text-white/65 leading-relaxed">{cat.description}</p>
                    <p className="relative mt-5 text-xs font-semibold text-amber/80 uppercase tracking-widest">
                      Most active category →
                    </p>
                  </Link>
                );
              }

              return (
                <Link
                  key={cat.id}
                  href={`/discover?category=${encodeURIComponent(cat.label)}`}
                  className="group bg-[#FDFAF5] rounded-2xl p-6 border border-[#E8E0D0] border-t-[3px] border-t-forest hover:shadow-lg hover:shadow-forest/8 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-xl bg-[#2D4A2D]/8 flex items-center justify-center text-[#2D4A2D] group-hover:bg-forest group-hover:text-white transition-colors duration-200">
                      <Icon size={24} />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber/10 text-amber border border-amber/20">
                      {cat.count} grants
                    </span>
                  </div>
                  <h3 className="font-bold text-charcoal mb-1" style={{ fontSize: "20px" }}>{cat.label}</h3>
                  <p className="text-sm text-charcoal/60 leading-relaxed">{cat.description}</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-charcoal/45 mb-3">Not sure where to start?</p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1 px-5 py-2.5 border border-forest text-forest text-sm font-semibold rounded-lg hover:bg-forest hover:text-white transition-colors duration-200"
            >
              Browse all categories →
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-forest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-center text-xs font-semibold text-amber uppercase tracking-widest mb-8">
            Trusted across the country
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl sm:text-5xl font-normal text-white">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-white/50 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-charcoal text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <FooterSignalIcon />
              <span className="text-white font-bold text-xl tracking-tight">Beacon</span>
            </div>
            <nav className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-xs text-white/30">
            © {new Date().getFullYear()} Beacon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HousingIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function BroadbandIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

function InfrastructureIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

function ParksIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function WorkforceIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ClimateIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function FooterSignalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" fill="white" />
      <path d="M7 12a5 5 0 0 1 5-5M17 12a5 5 0 0 1-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
      <path d="M4 12a8 8 0 0 1 8-8M20 12a8 8 0 0 1-8 8" stroke="#C4A35A" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
