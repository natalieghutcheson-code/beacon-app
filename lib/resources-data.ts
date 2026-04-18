/**
 * Mock editorial resources for the /resources library.
 * Replace with CMS or API content when available.
 */

export type ResourceTabId = "guides" | "templates" | "compliance" | "webinars";

export interface FeaturedGuide {
  id: string;
  title: string;
  summary: string;
  topic: string;
  readTime: string;
  href: string;
}

export interface ResourceItem {
  id: string;
  tab: ResourceTabId;
  typeBadge: string;
  title: string;
  description: string;
  topic: string;
  cta: "Read" | "Download" | "Watch";
  href: string;
}

export const RESOURCE_TABS: { id: ResourceTabId; label: string; description: string }[] = [
  { id: "guides", label: "Guides", description: "Plain-language explainers on finding and applying for funding." },
  { id: "templates", label: "Templates", description: "Outlines and checklists you can adapt for internal packets." },
  { id: "compliance", label: "Compliance", description: "Federal rules, cost principles, and environmental hooks." },
  { id: "webinars", label: "Webinars", description: "Recorded sessions on workflows and cross-office coordination." },
];

export const FEATURED_GUIDE: FeaturedGuide = {
  id: "featured-city-county-grants",
  title: "How to Find the Right Grants for City and County Governments",
  summary:
    "A practical framework for aligning NOFOs with council priorities, MPO or regional plans, and your consolidated planning cycle — so your team invests time in opportunities you can actually win.",
  topic: "Strategy · Local government",
  readTime: "12 min read",
  href: "/discover?q=city%20county%20grants",
};

/** Header chips — link to Discover with a helpful default query */
export const TOPIC_CHIPS: { label: string; href: string }[] = [
  { label: "Eligibility basics", href: "/discover?q=eligible%20applicants" },
  { label: "Reading a NOFO", href: "/discover?q=NOFO" },
  { label: "Match & cost-share", href: "/discover?q=match" },
  { label: "Deadlines & SAM.gov", href: "/discover?q=SAM.gov" },
];

export const RESOURCE_ITEMS: ResourceItem[] = [
  // Guides
  {
    id: "g-read-nofo",
    tab: "guides",
    typeBadge: "Guide",
    title: "How to Read a NOFO Without Missing the Deal-Breakers",
    description:
      "Where to find eligibility, match, scoring criteria, and submission channel — and how to flag conflicts with your agency’s capacity.",
    topic: "Applications",
    cta: "Read",
    href: "/discover?q=NOFO",
  },
  {
    id: "g-match-local",
    tab: "guides",
    typeBadge: "Guide",
    title: "Common Grant Match Requirements for Local Governments",
    description:
      "Non-federal share, in-kind valuation, and when your council must formally commit funds before application.",
    topic: "Finance & match",
    cta: "Read",
    href: "/discover?q=match%20requirements",
  },
  {
    id: "g-docs-federal",
    tab: "guides",
    typeBadge: "Guide",
    title: "Documents Needed for Federal Grant Applications",
    description:
      "Typical SF-424 attachments, letters of commitment, indirect cost proofs, and environmental review placeholders.",
    topic: "Applications",
    cta: "Read",
    href: "/discover?q=application%20documents",
  },
  {
    id: "g-broadband-muni",
    tab: "guides",
    typeBadge: "Guide",
    title: "Broadband Funding Basics for Municipalities",
    description:
      "BEAD subgrant flows, challenge processes, labor standards, and how to coordinate with your state broadband office.",
    topic: "Broadband",
    cta: "Read",
    href: "/categories#broadband",
  },
  {
    id: "g-pop",
    tab: "guides",
    typeBadge: "Guide",
    title: "Understanding Period of Performance and Obligation Windows",
    description:
      "Obligation vs. expenditure timelines, extensions, and what finance and procurement need locked in early.",
    topic: "Post-award",
    cta: "Read",
    href: "/discover?q=period%20of%20performance",
  },
  // Templates
  {
    id: "t-narrative",
    tab: "templates",
    typeBadge: "Template",
    title: "Project Narrative Outline (Federal-Style)",
    description:
      "Section headings aligned to common USDOT, EPA, and HUD narrative prompts — drop in your facts and metrics.",
    topic: "Applications",
    cta: "Download",
    href: "/discover?q=project%20narrative",
  },
  {
    id: "t-internal-review",
    tab: "templates",
    typeBadge: "Checklist",
    title: "Internal NOFO Review Checklist for Grants Coordinators",
    description:
      "Cross-walk for legal, finance, equity, and IT sign-off before council or board authorization to apply.",
    topic: "Process",
    cta: "Download",
    href: "/discover?q=review%20checklist",
  },
  {
    id: "t-budget",
    tab: "templates",
    typeBadge: "Template",
    title: "Budget Narrative Shell with Match Tracking",
    description:
      "Line-item table with match source columns suitable for subrecipient monitoring conversations early on.",
    topic: "Finance & match",
    cta: "Download",
    href: "/discover?q=budget%20narrative",
  },
  // Compliance
  {
    id: "c-2cfr200",
    tab: "compliance",
    typeBadge: "Policy brief",
    title: "2 CFR 200 Essentials for Pass-Through Entities",
    description:
      "Subaward risk monitoring, allowable costs, and single audit touchpoints your finance office cares about.",
    topic: "Compliance",
    cta: "Read",
    href: "/discover?q=2%20CFR%20200",
  },
  {
    id: "c-env",
    tab: "compliance",
    typeBadge: "Guide",
    title: "NEPA / Environmental Review: What to Expect Before Obligation",
    description:
      "Categorical exclusions vs. EA/EIS paths, tribal consultation signals, and schedule risk for construction grants.",
    topic: "Compliance",
    cta: "Read",
    href: "/discover?q=NEPA",
  },
  {
    id: "c-davis-bacon",
    tab: "compliance",
    typeBadge: "Policy brief",
    title: "Davis-Bacon and Labor Standards on Federally Assisted Construction",
    description:
      "When prevailing wage applies, certified payroll expectations, and how to brief public works leadership.",
    topic: "Labor",
    cta: "Read",
    href: "/discover?q=Davis-Bacon",
  },
  // Webinars
  {
    id: "w-cross-office",
    tab: "webinars",
    typeBadge: "Webinar",
    title: "Coordinating Grants, Finance, and Legal on Tight Deadlines",
    description:
      "Recorded workflow from a mid-size county: routing, redlines, and executive summary packs for elected officials.",
    topic: "Process",
    cta: "Watch",
    href: "/discover",
  },
  {
    id: "w-equity-data",
    tab: "webinars",
    typeBadge: "Webinar",
    title: "Equity Narratives and Community Data for Competitive Programs",
    description:
      "How to pair quantitative need indicators with authentic engagement documentation reviewers expect to see.",
    topic: "Storytelling",
    cta: "Watch",
    href: "/discover?q=equity",
  },
  {
    id: "w-subrecipient",
    tab: "webinars",
    typeBadge: "Webinar",
    title: "Subrecipient Monitoring That Scales (Without Burning Out Staff)",
    description:
      "Risk tiers, sampling strategies, and templates for corrective action when pass-through requirements stack up.",
    topic: "Post-award",
    cta: "Watch",
    href: "/discover?q=subrecipient",
  },
];

/** Bottom “browse by topic” — aligns with core Beacon categories */
export const BROWSE_TOPIC_LINKS: { label: string; href: string }[] = [
  { label: "Housing", href: "/discover?category=Housing" },
  { label: "Broadband", href: "/discover?category=Broadband" },
  { label: "Infrastructure", href: "/discover?category=Infrastructure" },
  { label: "Parks", href: "/discover?category=Parks" },
  { label: "Workforce", href: "/discover?category=Workforce" },
  { label: "Climate", href: "/discover?category=Climate" },
  { label: "Education", href: "/discover?category=Education" },
  { label: "Public Health", href: "/discover?category=Public%20Health" },
];
