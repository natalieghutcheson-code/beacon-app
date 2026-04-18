import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CATEGORY_PILL,
  PROGRAM_STATUS_PILL,
  getBeaconTakeaway,
  getGrantById,
  getGoodFitForGrant,
  getUrgency,
} from "@/lib/grants-data";
import { GrantSaveButton } from "@/components/grants/GrantSaveButton";
import { CardShell } from "@/components/ui/CardShell";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const grant = await getGrantById(params.id);
  if (!grant) return { title: "Grant Detail — Beacon" };
  return {
    title: `${grant.title} — Beacon`,
    description: grant.summary,
  };
}

function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <CardShell className="p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <h2 className="font-display text-xl sm:text-[22px] text-charcoal mb-4 leading-snug">{title}</h2>
      {children}
    </CardShell>
  );
}

function BulletList({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  const itemClass = ordered ? "list-decimal" : "list-disc";
  return (
    <Tag className={`space-y-2.5 text-sm text-charcoal/75 leading-relaxed pl-5 ${itemClass} marker:text-[#C4A35A]`}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </Tag>
  );
}

function BackToDiscover() {
  return (
    <Link
      href="/discover"
      className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/50 hover:text-[#2D4A2D] transition-colors group"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="group-hover:-translate-x-0.5 transition-transform"
        aria-hidden="true"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12,19 5,12 12,5" />
      </svg>
      Back to Discover
    </Link>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function SummaryBlock({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "bg-[#F0F5F0] border-[#D6E5D6]"
      : tone === "warning"
        ? "bg-[#FDF8EE] border-[#E8D8A8]"
        : "bg-[#FAF8F4] border-[#E8E0D0]";

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-charcoal/45">{label}</p>
      <p className="mt-2 text-sm font-semibold text-charcoal leading-snug">{value}</p>
    </div>
  );
}

const HOW_TO_APPLY_STEPS = [
  {
    title: "Confirm eligibility",
    description:
      "Check your entity type against the NOFO. Verify your SAM.gov registration is active and not expired.",
  },
  {
    title: "Register or verify SAM.gov",
    description:
      "All federal applicants must have an active SAM.gov registration. Allow 7–10 business days if registering new.",
  },
  {
    title: "Download the full NOFO",
    description:
      "Read the Notice of Funding Opportunity in full. Flag match requirements, page limits, and attachments.",
  },
  {
    title: "Prepare required documents",
    description:
      "Typical requirements: project narrative, budget detail, letters of support, environmental review status, and SF-424.",
  },
  {
    title: "Submit via Grants.gov",
    description:
      "Applications must be submitted through Grants.gov before the listed deadline. Allow 24–48 hours for processing.",
  },
];

function ApplyStepCard({
  stepNumber,
  title,
  description,
}: {
  stepNumber: number;
  title: string;
  description: string;
}) {
  return (
    <CardShell className="rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex gap-4 sm:gap-5">
        <div className="shrink-0 font-display text-[32px] leading-none text-[#C4A35A]">
          {stepNumber}
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="text-[15px] font-semibold text-charcoal">{title}</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-charcoal/60">{description}</p>
        </div>
      </div>
    </CardShell>
  );
}

export default async function GrantDetailPage({ params }: Props) {
  const grant = await getGrantById(params.id);
  if (!grant) notFound();

  const urgency = getUrgency(grant.daysUntilDeadline);
  const categoryPill = CATEGORY_PILL[grant.category] ?? "bg-slate-50 text-slate-700 border-slate-200";
  const statusPill = PROGRAM_STATUS_PILL[grant.programStatus];
  const takeaway = getBeaconTakeaway(grant);
  const goodFitFor = getGoodFitForGrant(grant);

  const showAlertCard = grant.daysUntilDeadline < 60 || grant.matchRequired;

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="mb-6 lg:mb-8">
          <BackToDiscover />
        </div>

        {/* Page header */}
        <header className="mb-8 lg:mb-10 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${categoryPill}`}>
              {grant.category}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusPill}`}>
              {grant.programStatus}
            </span>
            <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${urgency.dateClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${urgency.dotClass}`} />
              {urgency.label} · {grant.deadlineShort}
            </span>
          </div>
          <h1 className="font-display text-charcoal text-2xl sm:text-3xl lg:text-[34px] leading-tight mb-3">
            {grant.title}
          </h1>
          <p className="text-sm text-charcoal/45 font-medium mb-3">
            {grant.agency}
            <span className="mx-2 text-charcoal/25">·</span>
            CFDA {grant.cfda}
          </p>
          <p className="text-base text-charcoal/65 leading-relaxed">{grant.summary}</p>
        </header>

        <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
          {/* Main column */}
          <div className="lg:col-span-8 space-y-6 mb-10 lg:mb-0">
            <CardShell className="border-[#E3D4B4] bg-[#FCF7ED] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#C4A35A]/15 text-[#8A6B2D]">
                  <TakeawayIcon />
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-charcoal/45">
                    Beacon Takeaway
                  </p>
                  <p className="text-sm text-charcoal/55">
                    Fast read before you commit time to a full application review.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryBlock label="Best for" value={takeaway.bestFor} tone="success" />
                <SummaryBlock label="Watch-outs" value={takeaway.watchOuts} tone="warning" />
                <SummaryBlock label="Bottom line" value={takeaway.bottomLine} />
              </div>
            </CardShell>

            <ContentSection title="Overview">
              <p className="text-sm text-charcoal/75 leading-relaxed">{grant.overview}</p>
            </ContentSection>

            <ContentSection title="Eligibility & Match">
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryBlock
                  label="Match requirement"
                  value={grant.matchRequired ? grant.matchNote ?? "Match required" : "No match required"}
                  tone={grant.matchRequired ? "warning" : "success"}
                />
                <SummaryBlock
                  label="Who can apply"
                  value={grant.eligibilitySummary}
                />
              </div>
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-charcoal/45 mb-3">
                  Eligible applicant types
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {grant.eligibleApplicants.map((a) => (
                    <span
                      key={a}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F4EFE6] border border-[#DDD1BE] text-charcoal/85"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </ContentSection>

            <ContentSection title="How to Apply">
              <div className="space-y-3">
                {HOW_TO_APPLY_STEPS.map((step, index) => (
                  <ApplyStepCard
                    key={step.title}
                    stepNumber={index + 1}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </div>

              <div className="mt-4 border-l-4 border-[#C4A35A] bg-[#FCF8F0] px-4 py-3">
                <p className="text-[13px] italic leading-relaxed text-charcoal/60">
                  ⚠ Always verify details at the official source. Beacon summarizes publicly available NOFO data
                  but is not a substitute for reading the full notice.
                </p>
              </div>
            </ContentSection>

            <ContentSection title="Good fit for">
              <p className="text-sm text-charcoal/55 leading-relaxed mb-4">
                A quick Beacon read on the kinds of applicants most likely to be competitive here.
              </p>
              <BulletList items={goodFitFor} />
            </ContentSection>

            <ContentSection title="Allowable Uses">
              <BulletList items={grant.allowableUses} />
            </ContentSection>

            <ContentSection title="Key Restrictions">
              <BulletList items={grant.keyRestrictions} />
            </ContentSection>

            <ContentSection title="Documents Needed">
              <BulletList items={grant.documentsNeeded} />
            </ContentSection>

            <ContentSection title="Important Dates">
              <dl className="divide-y divide-[#F0EBE3] border-t border-[#F0EBE3]">
                {grant.importantDates.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 py-3.5"
                  >
                    <dt className="text-sm font-semibold text-charcoal shrink-0">{row.label}</dt>
                    <dd className="text-sm text-charcoal/65 text-left sm:text-right">{row.date}</dd>
                  </div>
                ))}
              </dl>
            </ContentSection>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="space-y-5 sticky top-6 self-start max-h-[calc(100vh-24px)] overflow-y-auto">
            <CardShell className="p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-charcoal/45 mb-4">Quick reference</p>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-medium text-charcoal/45">Application deadline</dt>
                  <dd className="text-sm font-semibold text-charcoal mt-0.5">{grant.deadline}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal/45">Funding range</dt>
                  <dd className="text-sm font-semibold text-charcoal mt-0.5">{grant.amount}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal/45">Match</dt>
                  <dd className="mt-1.5">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        grant.matchRequired
                          ? "bg-[#FDF8EE] text-[#7A6230] border border-[#E8D8A8]"
                          : "bg-[#F0F5F0] text-[#2D4A2D] border border-[#BDD4BD]"
                      }`}
                    >
                      {grant.matchRequired ? grant.matchNote ?? "Match required" : "No match required"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal/45">Eligibility</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {grant.eligibleApplicants.map((applicant) => (
                      <span
                        key={applicant}
                        className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold bg-[#F8F5F0] text-charcoal/75 border border-[#E8E0D0]"
                      >
                        {applicant}
                      </span>
                    ))}
                  </dd>
                  <dd className="text-sm text-charcoal/65 mt-2 leading-snug">{grant.eligibilitySummary}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal/45">Period of performance</dt>
                  <dd className="text-sm text-charcoal/75 mt-0.5 leading-snug">{grant.periodOfPerformance}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal/45">Agency</dt>
                  <dd className="text-sm text-charcoal/75 mt-0.5">{grant.agencyShort} — {grant.agency}</dd>
                </div>
              </dl>

              <div className="mt-6 pt-6 border-t border-[#F0EBE3] space-y-3">
                <a
                  href="https://grants.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D4A2D] px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1e3320] transition-colors"
                >
                  Visit Official Source / Apply
                  <ExternalLinkIcon />
                </a>
                <GrantSaveButton grantId={grant.id} />
              </div>
            </CardShell>

            {showAlertCard && (
              <div
                className={`rounded-2xl border p-4 ${
                  grant.daysUntilDeadline < 21
                    ? "bg-red-50/80 border-red-200"
                    : "bg-[#FDF8EE] border-[#E8D8A8]"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/50 mb-2">Heads up</p>
                {grant.daysUntilDeadline < 21 && (
                  <p className="text-sm text-charcoal/80 leading-snug">
                    <span className="font-semibold text-red-700">Closing soon:</span> {grant.daysUntilDeadline} days
                    until the listed deadline — confirm time zone and submission channel with the agency.
                  </p>
                )}
                {grant.daysUntilDeadline >= 21 && grant.daysUntilDeadline < 60 && (
                  <p className="text-sm text-charcoal/80 leading-snug">
                    <span className="font-semibold text-[#A07830]">Deadline approaching</span> — line up internal
                    reviews, match documentation, and SAM.gov registration early.
                  </p>
                )}
                {grant.matchRequired && (
                  <p
                    className={`text-sm text-charcoal/80 leading-snug ${
                      grant.daysUntilDeadline < 60 ? "mt-3 pt-3 border-t border-[#E8E0D0]" : ""
                    }`}
                  >
                    <span className="font-semibold text-[#2D4A2D]">Match required:</span>{" "}
                    {grant.matchNote ?? "Verify cost-share sources and timing in the official notice."}
                  </p>
                )}
              </div>
            )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TakeawayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 3.85L18 8.1l-3 2.92.7 4.13L12 13.7l-3.7 1.95.7-4.13-3-2.92 4.1-1.25L12 3z" />
    </svg>
  );
}
