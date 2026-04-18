"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { DeadlineTimeline } from "@/components/grants/DeadlineTimeline";
import { CardShell } from "@/components/ui/CardShell";
import {
  CATEGORY_PILL,
  getGrants,
  getUrgency,
  type DeadlineTimelineItem,
  type GrantRecord,
} from "@/lib/grants-data";

/* ─────────────────────────────────────────────
   localStorage helpers
───────────────────────────────────────────── */

const LS_KEY = "beacon_saved_grants";

function getSavedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeSavedIds(ids: string[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

/* ─────────────────────────────────────────────
   Static UI data
───────────────────────────────────────────── */

const ALERTS = [
  { text: "New CDBG program notice posted by HUD" },
  { text: "BEAD state portal opens — check your state broadband office" },
  { text: "BUILD grants cycle open — deadline approaching" },
];

const TABS = ["All Saved", "Closing Soon"] as const;
type Tab = (typeof TABS)[number];

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */

export default function MyGrantsPage() {
  const [activeTab, setActiveTab]     = useState<Tab>("All Saved");
  const [savedGrants, setSavedGrants] = useState<GrantRecord[]>([]);
  const [loading, setLoading]         = useState(true);

  // Load saved IDs from localStorage → fetch matching grants from Supabase
  useEffect(() => {
    const ids = getSavedIds();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    getGrants()
      .then((all) => setSavedGrants(all.filter((g) => ids.includes(g.id))))
      .finally(() => setLoading(false));
  }, []);

  function removeGrant(id: string) {
    setSavedGrants((prev) => {
      const next = prev.filter((g) => g.id !== id);
      writeSavedIds(next.map((g) => g.id));
      return next;
    });
  }

  const closingSoon    = savedGrants.filter((g) => g.daysUntilDeadline <= 30);
  const visibleGrants  = activeTab === "Closing Soon" ? closingSoon : savedGrants;

  // Derive deadline timeline items from live saved grants
  const upcomingDeadlines: DeadlineTimelineItem[] = savedGrants
    .filter((g) => g.daysUntilDeadline < 999)
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)
    .slice(0, 4)
    .map((g) => ({
      id: g.id,
      title: g.title,
      agencyShort: g.agencyShort,
      deadline: g.deadline,
      deadlineShort: g.deadlineShort,
      daysUntilDeadline: g.daysUntilDeadline,
    }));

  const statCards = [
    { value: String(savedGrants.length),  label: "Saved Grants" },
    { value: String(closingSoon.length),  label: "Closing This Month" },
    { value: "—",                         label: "Total Potential Funding" },
    { value: "—",                         label: "Applications In Progress" },
  ];

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-[1100px] mx-auto px-8 py-12">

        {/* ── Page header ── */}
        <div className="mb-8">
          <h1 className="font-display italic text-charcoal" style={{ fontSize: "36px", fontWeight: 400 }}>
            My Grants
          </h1>
          <p className="mt-1.5 text-charcoal/55" style={{ fontSize: "16px" }}>
            Track your saved opportunities and deadlines.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          {statCards.map((card) => (
            <CardShell key={card.label} className="px-6 py-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <p className="font-bold text-[#C4A35A]" style={{ fontSize: "28px" }}>{card.value}</p>
              <p className="mt-1 text-charcoal/50 font-medium" style={{ fontSize: "13px" }}>{card.label}</p>
            </CardShell>
          ))}
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex gap-8 items-start">

          {/* ── Left: tabs + grant list ── */}
          <div className="flex-1 min-w-0">

            {/* Tabs */}
            <div className="flex gap-0 border-b border-[#E8E0D0] mb-6">
              {TABS.map((tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 pb-3 pt-1 text-sm font-medium transition-colors relative ${
                      active ? "text-charcoal" : "text-charcoal/40 hover:text-charcoal/70"
                    }`}
                  >
                    {tab}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2D4A2D] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="flex items-center justify-center min-h-[240px]">
                <p className="text-sm text-charcoal/40">Loading saved grants…</p>
              </div>
            ) : visibleGrants.length === 0 ? (
              <EmptyState tab={activeTab} />
            ) : (
              <div className="flex flex-col gap-4">
                {visibleGrants.map((grant) => (
                  <SavedGrantCard key={grant.id} grant={grant} onRemove={() => removeGrant(grant.id)} />
                ))}
              </div>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <div className="w-[300px] shrink-0 flex flex-col gap-5">

            {/* Deadlines list */}
            <CardShell className="overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="px-5 pt-5 pb-3 border-b border-[#F0EBE3]">
                <h2 className="font-display italic text-charcoal" style={{ fontSize: "18px", fontWeight: 400 }}>
                  Deadlines
                </h2>
              </div>
              {upcomingDeadlines.length === 0 ? (
                <p className="px-5 py-4 text-sm text-charcoal/40">No saved grants with deadlines yet.</p>
              ) : (
                <div className="divide-y divide-[#F5F0E8]">
                  {upcomingDeadlines.map((item) => {
                    const urgency = getUrgency(item.daysUntilDeadline);
                    return (
                      <Link
                        key={item.id}
                        href={`/grants/${item.id}`}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FCF8F0] transition-colors"
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${urgency.dotClass}`} />
                        <span className="flex-1 min-w-0 text-sm text-charcoal/70 truncate">
                          {item.title}
                        </span>
                        <span className="text-sm font-semibold text-charcoal shrink-0">
                          {item.deadlineShort}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardShell>

            {/* Timeline widget */}
            {upcomingDeadlines.length > 0 && (
              <CardShell className="overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                <div className="px-5 pt-5 pb-3 border-b border-[#F0EBE3]">
                  <h2 className="font-display italic text-charcoal" style={{ fontSize: "18px", fontWeight: 400 }}>
                    Upcoming deadlines
                  </h2>
                  <p className="mt-1 text-xs text-charcoal/45">
                    Your next saved opportunities in deadline order.
                  </p>
                </div>
                <div className="px-5 py-4">
                  <DeadlineTimeline items={upcomingDeadlines} />
                </div>
              </CardShell>
            )}

            {/* Alerts widget */}
            <CardShell className="overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="px-5 pt-5 pb-3 border-b border-[#F0EBE3]">
                <h2 className="font-display italic text-charcoal" style={{ fontSize: "18px", fontWeight: 400 }}>
                  Alerts
                </h2>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {ALERTS.map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-3 py-3 rounded-lg bg-[#FDFAF5]"
                    style={{ borderLeft: "3px solid #C4A35A" }}
                  >
                    <span className="mt-0.5 shrink-0 text-[#C4A35A]"><BellIcon /></span>
                    <p className="text-sm text-charcoal/70 leading-snug">{alert.text}</p>
                  </div>
                ))}
              </div>
            </CardShell>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Saved grant card
───────────────────────────────────────────── */

function SavedGrantCard({ grant, onRemove }: { grant: GrantRecord; onRemove: () => void }) {
  const urgency   = getUrgency(grant.daysUntilDeadline);
  const pillStyle = CATEGORY_PILL[grant.category] ?? "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <CardShell className="p-5 hover:border-[#BEB4A8] transition-all duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="flex items-start gap-4">

        {/* Filled bookmark */}
        <div className="pt-0.5 shrink-0">
          <BookmarkFilledIcon />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">

            {/* Title + agency */}
            <div className="min-w-0">
              <Link href={`/grants/${grant.id}`}>
                <h3
                  className="font-display text-charcoal leading-snug hover:text-[#2D4A2D] transition-colors line-clamp-2"
                  style={{ fontSize: "17px", fontWeight: 400 }}
                >
                  {grant.title}
                </h3>
              </Link>
              <p className="mt-1 text-xs text-charcoal/40 font-medium">
                {grant.agency}
                <span className="mx-1.5 text-charcoal/20">·</span>
                CFDA {grant.cfda}
              </p>
            </div>

            {/* View + Remove */}
            <div className="flex flex-col items-end gap-2.5 shrink-0">
              <Link
                href={`/grants/${grant.id}`}
                className="flex items-center gap-1 text-sm font-semibold text-[#2D4A2D] hover:text-[#1e3320] transition-colors group whitespace-nowrap"
              >
                View Grant
                <ArrowRightIcon />
              </Link>
              <button
                onClick={onRemove}
                className="text-xs text-charcoal/35 hover:text-red-500 transition-colors whitespace-nowrap"
              >
                Remove
              </button>
            </div>
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${pillStyle}`}>
              {grant.category}
            </span>
            <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${urgency.dateClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${urgency.dotClass}`} />
              {urgency.label} · {grant.deadlineShort}
            </span>
            <span className="text-charcoal/20 text-xs">·</span>
            <span className="text-xs text-charcoal/55 font-medium">{grant.amount}</span>
            {grant.matchRequired && grant.matchNote && (
              <>
                <span className="text-charcoal/20 text-xs">·</span>
                <span className="text-xs text-charcoal/50">{grant.matchNote}</span>
              </>
            )}
            {!grant.matchRequired && (
              <>
                <span className="text-charcoal/20 text-xs">·</span>
                <span className="text-xs text-charcoal/35">No match required</span>
              </>
            )}
          </div>
        </div>
      </div>
    </CardShell>
  );
}

/* ─────────────────────────────────────────────
   Empty state
───────────────────────────────────────────── */

function EmptyState({ tab }: { tab: Tab }) {
  if (tab === "Closing Soon") {
    return (
      <div className="min-h-[320px] flex flex-col items-center justify-center text-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center text-[#C4B8A8]">
          <CalendarIcon />
        </div>
        <p className="font-display italic text-[22px] text-charcoal">No grants closing this month</p>
        <p className="text-[14px] text-[#888] leading-relaxed max-w-[280px]">
          Grants with deadlines in the next 30 days will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[320px] flex flex-col items-center justify-center text-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center text-[#C4B8A8]">
        <BookmarkEmptyIcon />
      </div>
      <p className="font-display italic text-[22px] text-charcoal">No saved grants yet</p>
      <p className="text-[14px] text-[#888] leading-relaxed max-w-[280px]">
        Save grants from the Discover page and they&apos;ll appear here.
      </p>
      <Link
        href="/discover"
        className="px-5 py-2.5 bg-[#2D4A2D] text-white text-sm font-semibold rounded-lg hover:bg-[#1e3320] transition-colors"
      >
        Browse grants
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Icons
───────────────────────────────────────────── */

function BookmarkFilledIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#C4A35A" stroke="#C4A35A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BookmarkEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12,5 19,12 12,19" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="8" y="10" width="32" height="30" rx="4" ry="4" />
      <line x1="32" y1="6" x2="32" y2="14" />
      <line x1="16" y1="6" x2="16" y2="14" />
      <line x1="8" y1="20" x2="40" y2="20" />
    </svg>
  );
}
