"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { DISCOVER_CATEGORY_FILTERS } from "@/lib/categories-data";
import { CATEGORY_PILL, getGrants, getUrgency, type GrantRecord } from "@/lib/grants-data";

/* ─────────────────────────────────────────────
   Filter option constants
───────────────────────────────────────────── */

const APPLICANT_OPTIONS = [
  "Municipality", "County", "State Agency", "Nonprofit",
  "University", "Tribal Government", "School District",
];

const AMOUNT_OPTIONS = [
  { value: "any", label: "Any amount" },
  { value: "under500k", label: "Under $500K" },
  { value: "500k-2m", label: "$500K – $2M" },
  { value: "2m-10m", label: "$2M – $10M" },
  { value: "10m+", label: "$10M+" },
];

const DEADLINE_OPTIONS = [
  { value: "any", label: "Any deadline" },
  { value: "this-month", label: "Closing this month" },
  { value: "90-days", label: "Next 90 days" },
];

const CATEGORY_PARAM_ALIASES: Record<string, string> = {
  "Digital Equity": "Broadband",
  "Rural Housing": "Housing",
};

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */

function DiscoverPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const qParam = searchParams.get("q");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedApplicants, setSelectedApplicants]  = useState<string[]>([]);
  const [amountFilter, setAmountFilter]               = useState("any");
  const [noMatchOnly, setNoMatchOnly]                 = useState(false);
  const [deadlineFilter, setDeadlineFilter]           = useState("any");
  const [bookmarked, setBookmarked]                   = useState<string[]>([]);
  const [sortBy, setSortBy]                           = useState("deadline");
  const [searchQuery, setSearchQuery]                 = useState("");
  const [grants, setGrants]                           = useState<GrantRecord[]>([]);
  const [loading, setLoading]                         = useState(true);

  useEffect(() => {
    getGrants().then(setGrants).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!categoryParam) {
      setSelectedCategories([]);
      return;
    }

    const rawLabel = decodeURIComponent(categoryParam);
    const label = CATEGORY_PARAM_ALIASES[rawLabel] ?? rawLabel;

    if (DISCOVER_CATEGORY_FILTERS.includes(label)) {
      setSelectedCategories([label]);
    }
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(qParam ? decodeURIComponent(qParam) : "");
  }, [qParam]);

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedApplicants.length > 0 ||
    amountFilter !== "any" ||
    noMatchOnly ||
    deadlineFilter !== "any";

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedApplicants([]);
    setAmountFilter("any");
    setNoMatchOnly(false);
    setDeadlineFilter("any");
  }

  function toggleArr<T>(arr: T[], val: T, set: (v: T[]) => void) {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }

  function toggleBookmark(id: string) {
    setBookmarked((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  // Basic client-side filter (visual / functional)
  const filteredGrants = grants.filter((g) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(g.category)) return false;
    if (selectedApplicants.length > 0 && !g.eligibleApplicants.some((a) => selectedApplicants.includes(a))) return false;
    if (noMatchOnly && g.matchRequired) return false;
    if (deadlineFilter === "this-month" && g.daysUntilDeadline > 30) return false;
    if (deadlineFilter === "90-days" && g.daysUntilDeadline > 90) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!g.title.toLowerCase().includes(q) && !g.agency.toLowerCase().includes(q) && !g.category.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Sort
  const sortedGrants = [...filteredGrants].sort((a, b) => {
    if (sortBy === "deadline") return a.daysUntilDeadline - b.daysUntilDeadline;
    return 0;
  });

  return (
    <div className="bg-cream min-h-[calc(100vh-4rem)]">
      {/* Same horizontal inset as Navigation (max-w-7xl + page padding) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        {/* ── LEFT FILTER PANEL ── */}
        <aside className="w-full shrink-0 lg:w-[280px] flex flex-col bg-white border-b border-[#E5E0D8] lg:border-b-0 lg:border-r lg:border-[#E5E0D8] lg:h-full lg:min-h-0 lg:overflow-y-auto">

        {/* Search inside panel */}
        <div className="px-5 sm:px-6 pt-6 pb-5 border-b border-[#F0EBE3]">
          <div className="flex items-center gap-2.5 bg-[#F8F5F0] rounded-xl px-3 py-2.5 border border-[#E8E0D0] focus-within:border-[#2D4A2D] transition-colors">
            <PanelSearchIcon />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search grants..."
              className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-charcoal/35 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-charcoal/30 hover:text-charcoal/60 transition-colors">
                <ClearXIcon />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable filter body */}
        <div className="flex-1 overflow-y-auto">

          {/* Category */}
          <FilterSection title="Category">
            {DISCOVER_CATEGORY_FILTERS.map((cat) => (
              <CheckboxRow
                key={cat}
                label={cat}
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleArr(selectedCategories, cat, setSelectedCategories)}
              />
            ))}
          </FilterSection>

          {/* Eligible Applicant */}
          <FilterSection title="Eligible Applicant">
            {APPLICANT_OPTIONS.map((app) => (
              <CheckboxRow
                key={app}
                label={app}
                checked={selectedApplicants.includes(app)}
                onChange={() => toggleArr(selectedApplicants, app, setSelectedApplicants)}
              />
            ))}
          </FilterSection>

          {/* Funding Amount */}
          <FilterSection title="Funding Amount">
            {AMOUNT_OPTIONS.map((opt) => (
              <RadioRow
                key={opt.value}
                label={opt.label}
                checked={amountFilter === opt.value}
                onChange={() => setAmountFilter(opt.value)}
              />
            ))}
          </FilterSection>

          {/* Match Required */}
          <FilterSection title="Match Required">
            <label className="flex items-center justify-between cursor-pointer py-1 group">
              <span className="text-sm text-charcoal/75 group-hover:text-charcoal transition-colors">
                No-match grants only
              </span>
              <button
                role="switch"
                aria-checked={noMatchOnly}
                onClick={() => setNoMatchOnly(!noMatchOnly)}
                className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${
                  noMatchOnly ? "bg-[#2D4A2D]" : "bg-[#D8D0C8]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    noMatchOnly ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          </FilterSection>

          {/* Deadline */}
          <FilterSection title="Deadline">
            {DEADLINE_OPTIONS.map((opt) => (
              <RadioRow
                key={opt.value}
                label={opt.label}
                checked={deadlineFilter === opt.value}
                onChange={() => setDeadlineFilter(opt.value)}
              />
            ))}
          </FilterSection>

        </div>

        {/* Clear all */}
        <div className="px-5 sm:px-6 py-5 border-t border-[#F0EBE3]">
          <button
            onClick={clearFilters}
            className={`text-sm transition-colors ${
              hasActiveFilters
                ? "text-[#2D4A2D] font-semibold hover:text-[#1e3320]"
                : "text-charcoal/35 cursor-default"
            }`}
            disabled={!hasActiveFilters}
          >
            {hasActiveFilters ? `Clear all filters` : "No active filters"}
          </button>
        </div>
        </aside>

        {/* ── RIGHT RESULTS AREA ── */}
        <main className="flex-1 min-w-0 min-h-0 flex flex-col bg-cream lg:overflow-y-auto">
          {/* Results toolbar — single row, vertically centered */}
          <div className="sticky top-0 z-10 shrink-0 border-b border-[#E5E0D8] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <div className="px-4 sm:px-6 lg:px-8 py-3.5 lg:pt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                {searchQuery.trim() ? (
                  <span className="text-sm font-semibold text-charcoal">
                    Results for &quot;{searchQuery.trim()}&quot;
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-charcoal tabular-nums">
                    {sortedGrants.length} grant{sortedGrants.length !== 1 ? "s" : ""} found
                  </span>
                )}
                {hasActiveFilters && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#2D4A2D]/10 text-[#2D4A2D]">
                    Filtered
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <label htmlFor="discover-sort" className="text-sm text-charcoal/50 font-medium whitespace-nowrap">
                  Sort by
                </label>
                <select
                  id="discover-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-medium text-charcoal bg-white border border-[#E8E0D0] rounded-lg pl-3 pr-8 py-2 outline-none focus:border-[#2D4A2D] focus:ring-2 focus:ring-[#2D4A2D]/15 cursor-pointer hover:border-[#C8BCA8] transition-colors min-h-[40px]"
                >
                  <option value="deadline">Deadline</option>
                  <option value="amount">Amount</option>
                  <option value="relevance">Relevance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grant cards or empty state — left-aligned column with a readable max width */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex-1">
            {loading ? (
              <div className="flex items-center justify-center min-h-[320px]">
                <p className="text-sm text-charcoal/40">Loading grants…</p>
              </div>
            ) : sortedGrants.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <div className="w-full max-w-5xl flex flex-col gap-8">
                {sortedGrants.map((grant) => (
                  <GrantCard
                    key={grant.id}
                    grant={grant}
                    isBookmarked={bookmarked.includes(grant.id)}
                    onBookmark={() => toggleBookmark(grant.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-cream min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-sm text-charcoal/50">Loading Discover…</p>
        </div>
      }
    >
      <DiscoverPageContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────
   Filter sub-components
───────────────────────────────────────────── */

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 sm:px-6 py-5 border-b border-[#F0EBE3]">
      <p className="uppercase font-semibold mb-3 text-[11px] tracking-[0.08em] text-charcoal/50">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <span
        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
          checked
            ? "bg-[#2D4A2D] border-[#2D4A2D]"
            : "border-[#C8C0B4] group-hover:border-[#2D4A2D]"
        }`}
        onClick={onChange}
      >
        {checked && <CheckmarkIcon />}
      </span>
      <span
        className={`text-sm transition-colors ${
          checked ? "text-charcoal font-medium" : "text-charcoal/65 group-hover:text-charcoal"
        }`}
        onClick={onChange}
      >
        {label}
      </span>
    </label>
  );
}

function RadioRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
          checked ? "border-[#2D4A2D]" : "border-[#C8C0B4] group-hover:border-[#2D4A2D]"
        }`}
        onClick={onChange}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-[#2D4A2D]" />}
      </span>
      <span
        className={`text-sm transition-colors ${
          checked ? "text-charcoal font-medium" : "text-charcoal/65 group-hover:text-charcoal"
        }`}
        onClick={onChange}
      >
        {label}
      </span>
    </label>
  );
}

/* ─────────────────────────────────────────────
   Grant card
───────────────────────────────────────────── */

function GrantCard({
  grant,
  isBookmarked,
  onBookmark,
}: {
  grant: GrantRecord;
  isBookmarked: boolean;
  onBookmark: () => void;
}) {
  const urgency   = getUrgency(grant.daysUntilDeadline);
  const pillStyle = CATEGORY_PILL[grant.category] ?? "bg-slate-50 text-slate-700 border-slate-200";

  const displayApplicants =
    grant.eligibleApplicants.slice(0, 2).join(", ") +
    (grant.eligibleApplicants.length > 2 ? ` +${grant.eligibleApplicants.length - 2} more` : "");

  return (
    <div
      className="bg-white rounded-2xl border border-[#E8E0D0] shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-[#BEB4A8] hover:shadow-lg hover:shadow-charcoal/5 transition-all duration-200 overflow-hidden"
    >
      <div className="p-6">
        {/* Top row: category pill + urgency badge */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/discover?category=${encodeURIComponent(grant.category)}`}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${pillStyle}`}
          >
            {grant.category}
          </Link>
          <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${urgency.dateClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${urgency.dotClass}`} />
            {urgency.label} · {grant.deadlineShort}
          </div>
        </div>

        {/* Title */}
        <Link href={`/grants/${grant.id}`}>
          <h3 className="font-display text-[18px] leading-snug text-charcoal mb-1 hover:text-[#2D4A2D] transition-colors line-clamp-2">
            {grant.title}
          </h3>
        </Link>

        {/* Agency + CFDA */}
        <p className="text-xs text-charcoal/40 font-medium mb-3">
          {grant.agency}
          <span className="mx-1.5 text-charcoal/20">·</span>
          CFDA {grant.cfda}
        </p>

        {/* Summary */}
        <p className="text-sm text-charcoal/60 leading-relaxed line-clamp-2 mb-5">
          {grant.summary}
        </p>

        <div className="border-y border-[#F0EBE0] py-3 mb-5 flex items-start gap-2.5">
          <span className="text-[#C4A35A] text-[13px] leading-[1.2] shrink-0" aria-hidden="true">
            ✦
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.06em] uppercase text-[#2D4A2D]">
              Beacon Read
            </p>
            <p className="mt-1 text-[13px] italic leading-relaxed text-[#6B6B6B]">
              {grant.beaconRead}
            </p>
          </div>
        </div>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-4 border-b border-[#F0EBE3]">
          <MetaItem icon={<DollarIcon />} label={grant.amount} />
          <MetaItem
            icon={<MatchIcon />}
            label={grant.matchRequired ? grant.matchNote ?? "Match required" : "No match required"}
            muted={!grant.matchRequired}
          />
          <MetaItem icon={<UsersIcon />} label={displayApplicants} />
        </div>

        {/* Bottom row: bookmark + view */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={onBookmark}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isBookmarked ? "text-[#2D4A2D]" : "text-charcoal/35 hover:text-[#2D4A2D]"
            }`}
          >
            <BookmarkIcon filled={isBookmarked} />
            {isBookmarked ? "Saved" : "Save grant"}
          </button>
          <Link
            href={`/grants/${grant.id}`}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#2D4A2D] hover:text-[#1e3320] transition-colors group"
          >
            View Grant
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon, label, muted = false }: { icon: React.ReactNode; label: string; muted?: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs ${muted ? "text-charcoal/35" : "text-charcoal/55"}`}>
      <span className="shrink-0 text-charcoal/35">{icon}</span>
      <span className={muted ? "" : "font-medium"}>{label}</span>
    </span>
  );
}

/* ─────────────────────────────────────────────
   Empty state
───────────────────────────────────────────── */

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="min-h-[320px] flex flex-col items-center justify-center text-center max-w-sm mx-auto gap-4">
      <div className="flex h-12 w-12 items-center justify-center text-[#C4B8A8]">
        <EmptySearchIcon />
      </div>
      <h3 className="font-display italic text-[22px] text-charcoal">No grants match your filters</h3>
      <p className="text-[14px] text-[#888] leading-relaxed">
        Try removing a filter or broadening your search.
      </p>
      <button
        onClick={onClear}
        className="px-5 py-2.5 border border-[#2D4A2D] text-[#2D4A2D] text-sm font-semibold rounded-lg hover:bg-[#2D4A2D]/5 transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Icons
───────────────────────────────────────────── */

function PanelSearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/35 shrink-0" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClearXIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="2,6 5,9 10,3" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function MatchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#2D4A2D" : "none"} stroke={filled ? "#2D4A2D" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12,5 19,12 12,19" />
    </svg>
  );
}

function EmptySearchIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="24" cy="24" r="18" />
      <line x1="14" y1="34" x2="34" y2="14" />
    </svg>
  );
}
