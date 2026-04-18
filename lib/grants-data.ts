/**
 * Grant data layer for Beacon.
 * Fetches from Supabase; falls back to empty array on error.
 * Non-data helpers (getUrgency, CATEGORY_PILL, etc.) remain below.
 */

import { supabase } from './supabase'

const MS_PER_DAY = 1000 * 60 * 60 * 24
const LIVE_GRANTS_SOURCE = 'live_grants'

function parseGrantDate(value: string | null): Date | null {
  if (!value) return null

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
  const parsed = new Date(normalized)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getDaysUntilDeadline(deadline: string | null): number | null {
  const parsed = parseGrantDate(deadline)
  if (!parsed) return null

  const today = startOfDay(new Date())
  const deadlineDay = startOfDay(parsed)
  return Math.round((deadlineDay.getTime() - today.getTime()) / MS_PER_DAY)
}

function formatDeadlineLabel(deadline: string | null, fallback = "TBD"): string {
  const parsed = parseGrantDate(deadline)
  if (!parsed) return fallback

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatDeadlineShort(deadline: string | null): string {
  const parsed = parseGrantDate(deadline)
  if (!parsed) return "TBD"

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

// ── Supabase row type (snake_case from DB) ──────────────────────────────────

export interface GrantRow {
  id: string
  title: string
  agency: string
  cfda: string | null
  category: string
  summary: string
  amount_min: number | null
  amount_max: number | null
  amount_label: string | null
  match_required: boolean
  match_amount: string | null
  deadline: string | null
  days_until_deadline: number | null
  eligibility: string[]
  geography: string | null
  status: string
  how_to_apply: string[]
  allowable_uses: string[]
  key_restrictions: string[]
  documents_needed: string[]
  beacon_read: string | null
  good_fit_for: string[]
  official_url: string | null
  source?: string | null
  source_opportunity_id?: string | null
  source_opportunity_number?: string | null
  source_status?: string | null
  source_last_updated_at?: string | null
  last_synced_at?: string | null
  is_active?: boolean | null
}

// ── Row → UI mapper ─────────────────────────────────────────────────────────

function rowToRecord(row: GrantRow): GrantRecord {
  const deadlineShort = formatDeadlineShort(row.deadline)
  const deadlineLabel = formatDeadlineLabel(row.deadline, "See NOFO")

  // Map DB status → ProgramStatus
  const programStatusMap: Record<string, ProgramStatus> = {
    open: "Open",
    closing: "Competitive",
    closed: "Competitive",
  }
  const programStatus: ProgramStatus = programStatusMap[row.status] ?? "Open"

  // Derive a short agency abbreviation from capital letters
  const agencyShort = row.agency
    .replace(/^U\.S\.\s+/i, "")
    .split(" ")
    .filter((w) => w.length > 2 && /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join("")
    .toUpperCase() || row.agency.split(" ").map((w) => w[0]).join("").toUpperCase()

  const daysUntilDeadline = getDaysUntilDeadline(row.deadline) ?? row.days_until_deadline ?? 999

  return {
    id: row.id,
    title: row.title,
    agency: row.agency,
    agencyShort,
    category: row.category,
    summary: row.summary,
    beaconRead: row.beacon_read ?? "",
    amount: row.amount_label ?? "See NOFO",
    matchRequired: row.match_required,
    matchNote: row.match_amount,
    eligibleApplicants: row.eligibility ?? [],
    deadline: deadlineLabel,
    deadlineShort,
    daysUntilDeadline,
    cfda: row.cfda ?? "—",
    programStatus,
    overview: row.summary,
    allowableUses: row.allowable_uses ?? [],
    keyRestrictions: row.key_restrictions ?? [],
    howToApply: row.how_to_apply ?? [],
    documentsNeeded: row.documents_needed ?? [],
    importantDates: row.deadline
      ? [{ label: "Application deadline", date: deadlineLabel }]
      : [],
    periodOfPerformance: "Varies — see official NOFO for details.",
    eligibilitySummary: (row.eligibility ?? []).slice(0, 2).join("; "),
    officialSourceUrl: row.official_url ?? "https://grants.gov",
  }
}

// ── Data fetching functions ─────────────────────────────────────────────────

/**
 * Fetch all grants from Supabase, ordered by deadline (nulls last).
 * Returns mapped GrantRecord[] so callers need no field translation.
 */
export async function getGrants(): Promise<GrantRecord[]> {
  const { data, error } = await supabase
    .from(LIVE_GRANTS_SOURCE)
    .select('*')
    .order('deadline', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('[Beacon] getGrants error:', error.message)
    return []
  }

  return (data ?? [])
    .map(rowToRecord)
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)
}

/**
 * Fetch a single grant by its string id column.
 * Returns a mapped GrantRecord so callers need no field translation.
 */
export async function getGrantById(id: string): Promise<GrantRecord | null> {
  const { data, error } = await supabase
    .from(LIVE_GRANTS_SOURCE)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`[Beacon] getGrantById(${id}) error:`, error.message)
    return null
  }
  if (!data) return null

  return rowToRecord(data)
}

export type ProgramStatus = "Open" | "Competitive" | "Formula";

export interface GrantRecord {
  id: string;
  title: string;
  agency: string;
  agencyShort: string;
  category: string;
  summary: string;
  beaconRead: string;
  amount: string;
  matchRequired: boolean;
  matchNote: string | null;
  eligibleApplicants: string[];
  deadline: string;
  deadlineShort: string;
  daysUntilDeadline: number;
  cfda: string;
  programStatus: ProgramStatus;
  /** Longer narrative for detail page */
  overview: string;
  allowableUses: string[];
  keyRestrictions: string[];
  howToApply: string[];
  documentsNeeded: string[];
  importantDates: { label: string; date: string }[];
  periodOfPerformance: string;
  /** Short line for sidebar quick reference */
  eligibilitySummary: string;
  officialSourceUrl: string;
}

export interface DeadlineTimelineItem {
  id: string;
  title: string;
  agencyShort: string;
  deadline: string;
  deadlineShort: string;
  daysUntilDeadline: number;
}

export interface BeaconTakeaway {
  bestFor: string;
  watchOuts: string;
  bottomLine: string;
}

export const GRANTS: GrantRecord[] = [
  {
    id: "raise-2026",
    title: "Rebuilding American Infrastructure with Sustainability and Equity (RAISE) Grants",
    agency: "U.S. Department of Transportation",
    agencyShort: "USDOT",
    category: "Infrastructure",
    summary:
      "Capital investments in surface transportation with significant local or regional impact on safety, mobility, economic competitiveness, and sustainability.",
    beaconRead:
      "Best for agencies with shovel-ready transportation projects and a credible match source.",
    amount: "$1M – $25M",
    matchRequired: true,
    matchNote: "20% non-federal match",
    eligibleApplicants: ["Municipality", "County", "State Agency"],
    deadline: "May 2, 2026",
    deadlineShort: "May 2",
    daysUntilDeadline: 15,
    cfda: "20.933",
    programStatus: "Competitive",
    overview:
      "RAISE supports surface transportation projects that demonstrate substantial local or regional impact. Awards emphasize safety, sustainability, equity in project delivery, and partnerships between state, local, and regional entities. USDOT expects applicants to clearly tie investments to measurable outcomes and to document readiness to obligate funds within the award timeline.",
    allowableUses: [
      "Highway, bridge, and multimodal corridor improvements with documented safety or congestion benefits",
      "Transit asset improvements and station access projects aligned with regional plans",
      "Planning activities that directly support an eligible capital project",
      "Active transportation networks where tied to regional connectivity goals",
    ],
    keyRestrictions: [
      "Federal share typically capped; non-federal match must be documented at application and tracked in grant administration",
      "Projects must be on the federal-aid highway system or otherwise eligible under program guidance",
      "Environmental reviews and right-of-way status must be credible for the proposed obligation schedule",
      "Duplicative requests for the same project scope across USDOT programs may be rejected",
    ],
    howToApply: [
      "Confirm eligibility with your MPO/State DOT partner and register in SAM.gov with an active UEI.",
      "Complete the USDOT application template for RAISE, including benefit-cost documentation and equity narrative.",
      "Submit letters of commitment for match sources and intergovernmental agreements where applicable.",
      "Upload technical appendices (maps, traffic counts, design milestones) as required by the NOFO.",
    ],
    documentsNeeded: [
      "SF-424 family forms",
      "Project narrative and location map",
      "Benefit-cost summary and safety performance discussion",
      "Financial plan for non-federal match",
      "NEPA strategy and schedule (as applicable)",
      "Resolutions or council actions authorizing application (if required locally)",
    ],
    importantDates: [
      { label: "Application deadline", date: "May 2, 2026 — 11:59 p.m. ET" },
      { label: "Anticipated selection notifications", date: "August 2026" },
      { label: "Earliest obligation milestone (typical)", date: "Per award letter; often within 12 months" },
      { label: "Post-award reporting cadence", date: "Quarterly financial + annual progress" },
    ],
    periodOfPerformance: "Typically up to 5 years from obligation; extensions per USDOT approval.",
    eligibilitySummary: "States, local governments, and regional transportation authorities per NOFO.",
    officialSourceUrl: "https://www.transportation.gov/grants/raise",
  },
  {
    id: "epa-cprg",
    title: "Climate Pollution Reduction Grants (CPRG) — Implementation",
    agency: "U.S. Environmental Protection Agency",
    agencyShort: "EPA",
    category: "Climate",
    summary:
      "Implementation grants for comprehensive, economy-wide GHG reduction measures spanning transportation, electricity, buildings, industry, agriculture, and waste sectors.",
    beaconRead:
      "No match required — strong fit for state agencies with cross-sector GHG reduction plans.",
    amount: "$2M – $500M",
    matchRequired: false,
    matchNote: null,
    eligibleApplicants: ["State Agency", "Municipality", "Tribal Government", "Nonprofit"],
    deadline: "May 8, 2026",
    deadlineShort: "May 8",
    daysUntilDeadline: 21,
    cfda: "66.046",
    programStatus: "Competitive",
    overview:
      "CPRG Implementation funds priority measures identified in eligible climate action plans. Applicants should demonstrate cross-sector coordination, quantified GHG benefits, and alignment with community priorities including disadvantaged community engagement. EPA prioritizes shovel-ready portfolios with credible implementation pathways.",
    allowableUses: [
      "Deploying clean energy, energy efficiency, and building retrofit programs",
      "Transportation measures that reduce VMT or accelerate fleet electrification",
      "Methane and waste-sector interventions tied to quantified reductions",
      "Workforce and contractor capacity tied to implementation activities",
    ],
    keyRestrictions: [
      "Must align with an eligible climate plan framework where required by program guidance",
      "Cost principles under 2 CFR 200 apply; subaward monitoring responsibilities must be described",
      "Matching funds may be required for certain project types even when not universal—verify the NOFO",
      "Lobbying and impermissible activities under federal assistance rules are prohibited",
    ],
    howToApply: [
      "Coordinate with your air agency and MPO on inventory baselines and measure selection.",
      "Prepare a ranked project list with GHG quantification methodology references.",
      "Complete Grants.gov workspace submission including EPA supplemental forms.",
      "Include environmental compliance strategy and community engagement documentation.",
    ],
    documentsNeeded: [
      "EPA application forms and project summary table",
      "GHG quantification workbook or equivalent methodology appendix",
      "Equity and community engagement plan",
      "Budget and narrative justification by project",
      "SAM.gov active registration proof",
    ],
    importantDates: [
      { label: "Application deadline", date: "May 8, 2026 — 11:59 p.m. local time" },
      { label: "Expected award start", date: "Fall 2026" },
      { label: "Interim performance report (typical)", date: "Annual" },
    ],
    periodOfPerformance: "Generally 3–5 years depending on project scope and award terms.",
    eligibilitySummary: "Eligible applicants as listed in the implementation NOFO; consortia allowed where permitted.",
    officialSourceUrl: "https://www.epa.gov/inflation-reduction-act/climate-pollution-reduction-grants",
  },
  {
    id: "cdbg-entitlement",
    title: "Community Development Block Grant (CDBG) — Entitlement Communities",
    agency: "U.S. Dept. of Housing and Urban Development",
    agencyShort: "HUD",
    category: "Housing",
    summary:
      "Flexible funding for neighborhood revitalization, economic development, and improved community facilities primarily serving low- and moderate-income persons.",
    beaconRead:
      "Formula-based — check your entitlement status before applying; competitive track separate.",
    amount: "$200K – $5M",
    matchRequired: false,
    matchNote: null,
    eligibleApplicants: ["Municipality", "County"],
    deadline: "June 6, 2026",
    deadlineShort: "Jun 6",
    daysUntilDeadline: 50,
    cfda: "14.218",
    programStatus: "Formula",
    overview:
      "CDBG entitlement funds help cities and urban counties carry out housing, public improvements, and economic development activities that principally benefit low- and moderate-income persons. Funds are flexible but must meet national objectives and local consolidated planning requirements.",
    allowableUses: [
      "Public infrastructure and facilities serving LMI areas",
      "Housing rehabilitation and code enforcement tied to LMI benefit",
      "Microenterprise assistance and economic development with documented job outcomes",
      "Public services capped per regulation when consolidated plan allows",
    ],
    keyRestrictions: [
      "At least 70% of CDBG spending over a defined period must benefit LMI persons where applicable per activity type",
      "Slum/blight and urgent need activities require additional justification",
      "Environmental review under 24 CFR Part 58 must be completed before obligation",
      "Duplication of benefits checks required for disaster-related uses",
    ],
    howToApply: [
      "Adopt or amend the consolidated plan and annual action plan through your governing body.",
      "Publish citizen participation notices consistent with HUD timelines.",
      "Package environmental review determinations and contract-ready scopes.",
      "Execute subrecipient agreements with monitoring clauses and performance metrics.",
    ],
    documentsNeeded: [
      "Consolidated plan / action plan excerpts",
      "Environmental review record",
      "Income survey or area benefit documentation",
      "Budget detail and Davis-Bacon compliance plan (if construction)",
    ],
    importantDates: [
      { label: "Program year application window closes", date: "June 6, 2026" },
      { label: "Citizen comment period minimums", date: "Per local process; typically 15–30 days" },
      { label: "IDIS reporting updates", date: "Ongoing; quarterly common practice" },
    ],
    periodOfPerformance: "Linked to program year funding availability; multi-year projects require milestone schedules.",
    eligibilitySummary: "HUD entitlement cities and urban counties; verify entitlement status annually.",
    officialSourceUrl: "https://www.hud.gov/program_offices/comm_planning/communitydevelopment/programs",
  },
  {
    id: "title1-parta",
    title: "Title I, Part A — Improving Basic Programs for Local Educational Agencies",
    agency: "U.S. Department of Education",
    agencyShort: "ED",
    category: "Education",
    summary:
      "Formula grants to improve teaching and learning in high-poverty schools and help all children meet challenging state academic content and performance standards.",
    beaconRead:
      "Formula grant — eligibility automatic for qualifying districts, no application needed.",
    amount: "Formula-based",
    matchRequired: false,
    matchNote: null,
    eligibleApplicants: ["School District"],
    deadline: "June 20, 2026",
    deadlineShort: "Jun 20",
    daysUntilDeadline: 64,
    cfda: "84.010",
    programStatus: "Formula",
    overview:
      "Title I, Part A provides financial assistance to LEAs with high numbers or concentrations of children from low-income families. Funds support instructional supports, parent and family engagement, and evidence-based school improvement strategies in schools above poverty thresholds.",
    allowableUses: [
      "Additional teachers, paraprofessionals, and instructional coaches in Title I schools",
      "Extended learning time and summer learning with academic alignment",
      "Professional development aligned to identified school needs",
      "Parent and family engagement activities required under Section 1116",
    ],
    keyRestrictions: [
      "Comparability and supplement-not-supplant requirements must be met",
      "Set-asides for school improvement and transportation for homeless students may apply",
      "Carryover limits and waiver rules apply by fiscal year",
      "Equipment and indirect costs must follow ED and state rules",
    ],
    howToApply: [
      "Work through your state education agency’s Title I allocation and application process.",
      "Complete local plans for parent and family engagement and schoolwide programs where applicable.",
      "Coordinate with federal programs offices for consolidated budgeting where used.",
    ],
    documentsNeeded: [
      "LEA Title I plan and campus-level plans",
      "Poverty data documentation and allocation worksheets (as required by SEA)",
      "Evidence summaries for selected interventions (where applicable)",
    ],
    importantDates: [
      { label: "SEA submission deadlines to ED", date: "Varies; confirm with your SEA" },
      { label: "Local plan adoption / board approval", date: "Typically spring/summer before school year" },
      { label: "Annual Federal Programs reporting", date: "Per state calendar" },
    ],
    periodOfPerformance: "Annual allocation cycle; obligations follow federal fiscal rules and SEA timelines.",
    eligibilitySummary: "Local educational agencies via state formula; schools must meet poverty thresholds for schoolwide eligibility.",
    officialSourceUrl: "https://oese.ed.gov/offices/office-of-formula-grants-and-congressional-direction/office-of-elementary-and-secondary-education-programs/",
  },
  {
    id: "nea-gap",
    title: "NEA Grants for Arts Projects",
    agency: "National Endowment for the Arts",
    agencyShort: "NEA",
    category: "Arts",
    summary:
      "Support for projects that extend the reach of the arts to underserved populations, foster learning in the arts, and celebrate America's artistic and cultural heritage.",
    beaconRead:
      "Strongest for applicants with a clear public-facing arts project and a documented cost-share plan.",
    amount: "$10K – $100K",
    matchRequired: true,
    matchNote: "1:1 cost share",
    eligibleApplicants: ["Nonprofit", "Municipality", "Tribal Government", "University"],
    deadline: "July 11, 2026",
    deadlineShort: "Jul 11",
    daysUntilDeadline: 85,
    cfda: "45.024",
    programStatus: "Competitive",
    overview:
      "Grants for Arts Projects support arts projects of national, regional, or local significance with strong public engagement. Applicants should articulate artistic excellence, potential impact, and organizational capacity. Cost sharing is required and must be documented.",
    allowableUses: [
      "Performances, exhibitions, and public art with documented public benefit",
      "Arts education partnerships with schools or community organizations",
      "Festivals and commissions that emphasize access and inclusion",
      "Capacity-building activities directly tied to project delivery",
    ],
    keyRestrictions: [
      "1:1 match required; in-kind must meet NEA standards for allowable contributions",
      "Construction is generally not supported",
      "Fundraising events and lobbying are not allowable",
      "Indirect costs limited to negotiated rate or de minimis per 2 CFR 200",
    ],
    howToApply: [
      "Create/update NEA applicant profile and verify SAM.gov registration.",
      "Submit through Grants.gov using the NEA narrative template and work samples guidance.",
      "Prepare itemized budget and match documentation schedule.",
    ],
    documentsNeeded: [
      "Project description and public benefit statement",
      "Resumes for key artistic and managerial personnel",
      "Work samples or marketing materials as specified in guidelines",
      "Board list and audited financials for larger requests where required",
    ],
    importantDates: [
      { label: "Application deadline", date: "July 11, 2026" },
      { label: "Panel review window", date: "Late summer" },
      { label: "Earliest project start", date: "Typically FY award year start" },
    ],
    periodOfPerformance: "Generally 12–24 months; extensions by amendment.",
    eligibilitySummary: "501(c)(3) nonprofits, units of government, and eligible federally recognized tribes.",
    officialSourceUrl: "https://www.arts.gov/grants-organizations/grants-for-arts-projects",
  },
  {
    id: "bric-2026",
    title: "Building Resilient Infrastructure and Communities (BRIC)",
    agency: "Federal Emergency Management Agency",
    agencyShort: "FEMA",
    category: "Climate",
    summary:
      "Pre-disaster mitigation funding that supports states, local communities, tribes, and territories in reducing risks from natural hazards and the effects of climate change.",
    beaconRead:
      "Highly competitive nationally; strongest for projects with community resilience co-benefits.",
    amount: "$500K – $50M",
    matchRequired: true,
    matchNote: "25% non-federal match",
    eligibleApplicants: ["State Agency", "Municipality", "County", "Tribal Government"],
    deadline: "September 18, 2026",
    deadlineShort: "Sep 18",
    daysUntilDeadline: 154,
    cfda: "97.047",
    programStatus: "Competitive",
    overview:
      "BRIC supports capability- and capacity-building and large infrastructure projects that reduce natural hazard risks. Subapplications typically flow through states or territories (or federally recognized tribal governments where eligible). Strong benefit-cost ratios and alignment with adopted hazard mitigation plans are critical.",
    allowableUses: [
      "Retrofits and acquisitions that reduce flood, wind, or wildfire risk",
      "Utility and infrastructure hardening tied to mitigation outcomes",
      "Management costs within caps and mitigation planning support where allowed",
    ],
    keyRestrictions: [
      "Must align with local or tribal hazard mitigation plan updates",
      "Environmental and historic preservation reviews required before award",
      "Match must be committed and allowable under federal cost-share rules",
      "Maintenance responsibilities post-construction must be addressed",
    ],
    howToApply: [
      "Coordinate with your state mitigation officer or tribal applicant pathway.",
      "Develop FEMA Benefit-Cost Analysis consistent with current BCA toolkit guidance.",
      "Submit through FEMA Grants Outcomes with required engineering and planning attachments.",
    ],
    documentsNeeded: [
      "Hazard mitigation plan adoption evidence",
      "Scope of work and cost estimates",
      "Environmental planning checklist and consultations",
      "Maintenance agreement or O&M plan",
    ],
    importantDates: [
      { label: "Subapplication deadline to state/tribe", date: "Varies; often before federal deadline" },
      { label: "Federal BRIC deadline", date: "September 18, 2026" },
      { label: "Award obligation target", date: "Multi-year; per FEMA timelines" },
    ],
    periodOfPerformance: "Varies by project; construction timelines often 3–5+ years.",
    eligibilitySummary: "States, territories, tribes, and local governments through eligible BRIC pathways.",
    officialSourceUrl: "https://www.fema.gov/grants/mitigation/building-resilient-infrastructure-communities",
  },
  {
    id: "bead-2026",
    title: "Broadband Equity, Access, and Deployment (BEAD) Program",
    agency: "National Telecommunications and Information Administration",
    agencyShort: "NTIA",
    category: "Broadband",
    summary:
      "Deployment of broadband infrastructure in unserved and underserved locations, with priority for high-cost areas, tribal lands, and low-income communities.",
    beaconRead:
      "Flows through state offices — contact your state broadband office before pursuing directly.",
    amount: "$25M+",
    matchRequired: true,
    matchNote: "25% non-federal match",
    eligibleApplicants: ["State Agency", "Nonprofit", "Municipality"],
    deadline: "August 28, 2026",
    deadlineShort: "Aug 28",
    daysUntilDeadline: 133,
    cfda: "11.750",
    programStatus: "Competitive",
    overview:
      "BEAD prioritizes reliable, affordable high-speed internet through state-led programs. Subgrantees pursue fiber and alternative technologies where fiber is impractical. Labor standards, climate resilience, and fair labor practices are emphasized in implementation.",
    allowableUses: [
      "Last-mile and middle-mile infrastructure in eligible locations",
      "Network planning, engineering, and permitting tied to deployment",
      "Subscriber affordability programs where permitted by state policies",
    ],
    keyRestrictions: [
      "Must comply with Buy America and labor standards as specified in guidance",
      "Overbuild restrictions and prioritization rules apply by location class",
      "Matching contributions must be documented and timely",
      "Reporting on deployment milestones and affordability metrics is required",
    ],
    howToApply: [
      "Engage with your state broadband office on challenge process and subgrant timelines.",
      "Prepare detailed engineering designs, financial pro forma, and workforce plans.",
      "Submit through the state’s designated application portal when released.",
    ],
    documentsNeeded: [
      "Coverage maps and FCC data references",
      "Financial statements and letters of credit or bonding (as required)",
      "Environmental and pole attachment strategies",
      "Affordability and digital equity commitments",
    ],
    importantDates: [
      { label: "State challenge process", date: "Varies by state" },
      { label: "Typical subgrant application windows", date: "Posted by state broadband offices" },
      { label: "Reporting milestones", date: "Quarterly during construction" },
    ],
    periodOfPerformance: "Construction-heavy; often multi-year with extensions tied to network completion.",
    eligibilitySummary: "Eligible subgrantees per state plan; often includes ISPs, co-ops, and local partners.",
    officialSourceUrl: "https://broadbandusa.ntia.doc.gov/funding-programs/internet-all-programs",
  },
  {
    id: "usda-cf",
    title: "USDA Community Facilities Direct Loan & Grant Program",
    agency: "U.S. Department of Agriculture — Rural Development",
    agencyShort: "USDA RD",
    category: "Infrastructure",
    summary:
      "Essential community facilities in rural areas under 20,000 population — healthcare, public safety, education, and public service facilities.",
    beaconRead:
      "Best suited to rural communities with a clearly defined facility need and local support already in place.",
    amount: "$50K – $10M",
    matchRequired: false,
    matchNote: null,
    eligibleApplicants: ["Municipality", "County", "Nonprofit", "Tribal Government"],
    deadline: "October 3, 2026",
    deadlineShort: "Oct 3",
    daysUntilDeadline: 169,
    cfda: "10.766",
    programStatus: "Open",
    overview:
      "Community Facilities helps rural communities finance essential public facilities that improve quality of life and support economic stability. Funding can be grants, direct loans, or combinations depending on eligibility, community size, and project type.",
    allowableUses: [
      "Hospitals, clinics, and EMS facilities",
      "Schools, childcare centers, and libraries",
      "Courthouses, fire stations, and public safety buildings",
      "Community centers when serving an essential public purpose",
    ],
    keyRestrictions: [
      "Community must meet rural population thresholds",
      "Feasibility and sustainability of O&M must be demonstrated",
      "National Environmental Policy Act review required before obligation",
      "Grant scoring favors high-need communities and smaller populations",
    ],
    howToApply: [
      "Contact your USDA Rural Development state office for preapplication guidance.",
      "Complete forms RD 400-1, RD 400-4, and engineering feasibility package.",
      "Demonstrate local support via resolutions and financial commitments.",
    ],
    documentsNeeded: [
      "Organizational chart and financial statements",
      "Project budget and construction cost estimates",
      "Environmental assessment or categorical exclusion documentation",
      "Evidence of legal authority to borrow/own facility",
    ],
    importantDates: [
      { label: "Application intake", date: "Rolling; confirm state office capacity" },
      { label: "Environmental clearance target", date: "Before obligation" },
      { label: "Construction start", date: "Per loan/grant agreement milestones" },
    ],
    periodOfPerformance: "Construction schedules vary; loan terms up to 40 years for eligible borrowers.",
    eligibilitySummary: "Rural cities/towns, counties, tribes, and nonprofits serving eligible areas.",
    officialSourceUrl: "https://www.rd.usda.gov/programs-services/community-facilities/community-facilities-direct-loan-grant-program",
  },
];

/** Synchronous lookup against the local mock GRANTS array — used only by legacy helpers below. */
function _getGrantByIdSync(id: string): GrantRecord | undefined {
  if (id === "1") {
    return GRANTS[0];
  }
  return GRANTS.find((g) => g.id === id);
}

export function getUrgency(days: number): { label: string; dateClass: string; dotClass: string } {
  if (days < 21) {
    return {
      label: "Closing soon",
      dateClass: "bg-red-50 text-red-600 border border-red-200",
      dotClass: "bg-red-500",
    };
  }
  if (days <= 60) {
    return {
      label: "Deadline approaching",
      dateClass: "bg-[#FDF8EE] text-[#A07830] border border-[#E8D8A8]",
      dotClass: "bg-[#C4A35A]",
    };
  }
  return {
    label: "Open",
    dateClass: "bg-[#F0F5F0] text-[#3D6B3D] border border-[#BDD4BD]",
    dotClass: "bg-[#5A9A5A]",
  };
}

export const CATEGORY_PILL: Record<string, string> = {
  Infrastructure: "bg-blue-50 text-blue-700 border-blue-200",
  Broadband: "bg-violet-50 text-violet-700 border-violet-200",
  Housing: "bg-orange-50 text-orange-700 border-orange-200",
  Climate: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Arts: "bg-rose-50 text-rose-700 border-rose-200",
  Education: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Parks: "bg-teal-50 text-teal-700 border-teal-200",
  Workforce: "bg-amber-50 text-amber-700 border-amber-200",
  "Public Health": "bg-red-50 text-red-700 border-red-200",
  Research: "bg-slate-50 text-slate-700 border-slate-200",
  "Public Safety": "bg-sky-50 text-sky-800 border-sky-200",
  "Economic Development": "bg-lime-50 text-lime-900 border-lime-200",
};

export const PROGRAM_STATUS_PILL: Record<ProgramStatus, string> = {
  Open: "bg-[#F0F5F0] text-[#2D4A2D] border-[#BDD4BD]",
  Competitive: "bg-[#FDF8EE] text-[#7A6230] border-[#E8D8A8]",
  Formula: "bg-slate-50 text-slate-700 border-slate-200",
};

/** Mock “saved” list for My Grants — merge with GRANTS by id */
export type SavedGrantStatus = "Researching" | "Applying" | "Submitted";

export const SAVED_GRANT_META: { id: string; dateSaved: string; status: SavedGrantStatus }[] = [
  { id: "raise-2026", dateSaved: "Saved Apr 3", status: "Applying" },
  { id: "epa-cprg", dateSaved: "Saved Mar 28", status: "Researching" },
  { id: "cdbg-entitlement", dateSaved: "Saved Apr 10", status: "Applying" },
  { id: "bead-2026", dateSaved: "Saved Apr 1", status: "Researching" },
  { id: "bric-2026", dateSaved: "Saved Apr 14", status: "Submitted" },
];

const GOOD_FIT_BY_GRANT_ID: Record<string, string[]> = {
  "raise-2026": [
    "Agencies with shovel-ready transportation or safety projects",
    "Regional transportation partnerships coordinating across jurisdictions",
    "Municipalities with matching funds already identified",
    "Teams that can document measurable mobility or equity outcomes",
  ],
  "epa-cprg": [
    "State or local teams with an adopted climate action framework",
    "Applicants assembling multi-sector implementation portfolios",
    "Organizations able to quantify greenhouse gas reductions clearly",
    "Communities with strong equity and public engagement plans",
  ],
  "cdbg-entitlement": [
    "Entitlement communities managing annual action plan cycles",
    "Local governments with ready-to-scope housing or public facility needs",
    "Teams that can document low- and moderate-income benefit",
    "Applicants prepared for environmental review and subrecipient oversight",
  ],
  "title1-parta": [
    "School districts serving high-poverty campuses",
    "LEAs aligning interventions to evidence-based academic supports",
    "Teams coordinating campus plans and family engagement requirements",
  ],
  "nea-gap": [
    "Organizations with a clearly defined public-facing arts project",
    "Applicants able to secure and document a one-to-one cost share",
    "Teams with strong artistic work samples and delivery capacity",
  ],
  "bric-2026": [
    "Communities with adopted hazard mitigation plans already in place",
    "Infrastructure teams with strong benefit-cost documentation",
    "Applicants that can commit local match before submission",
    "Projects with clear resilience outcomes and long-term maintenance plans",
  ],
  "bead-2026": [
    "State-led partnerships targeting unserved or underserved areas",
    "Applicants with deployment-ready engineering and permitting work",
    "Teams able to document matching funds and affordability commitments",
    "Projects aligned with state broadband office priorities",
  ],
  "usda-cf": [
    "Rural communities advancing essential public facilities",
    "Applicants with board or council support already in hand",
    "Projects that can demonstrate long-term operating sustainability",
    "Teams prepared to work through USDA preapplication guidance",
  ],
};

const BEACON_TAKEAWAY_BY_GRANT_ID: Record<string, BeaconTakeaway> = {
  "raise-2026": {
    bestFor: "Cities, counties, and regional partners with transportation projects that are already scoped and can show strong public benefit.",
    watchOuts: "The 20% match and readiness expectations can become deal-breakers if local approvals, environmental review, or partner commitments are still loose.",
    bottomLine: "Pursue this if your project is near-ready and you can pair a strong narrative with credible match and delivery timing.",
  },
  "epa-cprg": {
    bestFor: "Applicants with a credible climate implementation pipeline and clear greenhouse gas reduction methodology.",
    watchOuts: "Projects can stall if the climate plan link, quantification approach, or cross-agency coordination is underdeveloped.",
    bottomLine: "Strong fit for teams ready to move from planning into implementation with measurable emissions outcomes.",
  },
  "cdbg-entitlement": {
    bestFor: "Entitlement communities with recurring housing, public facility, or neighborhood revitalization priorities.",
    watchOuts: "National objective documentation and environmental review can slow progress if files are not organized early.",
    bottomLine: "A practical fit for local governments that already manage HUD planning and compliance workflows.",
  },
  "title1-parta": {
    bestFor: "School districts aligning formula dollars to clear academic support strategies for high-poverty campuses.",
    watchOuts: "Comparability, set-asides, and supplement-not-supplant rules can limit flexibility if budgets are not coordinated closely.",
    bottomLine: "Best used when the district already has a disciplined federal programs planning process in place.",
  },
  "nea-gap": {
    bestFor: "Organizations with a clearly defined arts project, strong public-facing outcomes, and documented cost share.",
    watchOuts: "Weak work samples or uncertain match contributions can quickly undercut an otherwise compelling proposal.",
    bottomLine: "Worth pursuing if the artistic concept is polished and the matching funds are realistic, not aspirational.",
  },
  "bric-2026": {
    bestFor: "Communities with adopted mitigation plans, resilient infrastructure priorities, and solid benefit-cost groundwork.",
    watchOuts: "The local match, technical documentation, and state coordination path can be heavy lifts for less-prepared teams.",
    bottomLine: "High-upside opportunity, but best for applicants that already have planning, engineering, and match strategy lined up.",
  },
  "bead-2026": {
    bestFor: "Deployment teams that can respond to state broadband priorities with ready engineering and financing support.",
    watchOuts: "Matching funds, labor standards, and state-specific application rules create a high bar for underprepared applicants.",
    bottomLine: "A strong target when the project is deployment-ready and aligned with the state broadband office process.",
  },
  "usda-cf": {
    bestFor: "Rural communities advancing essential facilities with clear public benefit and strong local backing.",
    watchOuts: "Projects can bog down if feasibility, operating sustainability, or environmental documentation is not ready early.",
    bottomLine: "Good fit for smaller communities that need flexible capital support and can show long-term operating strength.",
  },
};

export function getGoodFitForGrant(grant: GrantRecord): string[] {
  return (
    GOOD_FIT_BY_GRANT_ID[grant.id] ?? [
      `Organizations eligible as ${grant.eligibleApplicants.slice(0, 2).join(" and ").toLowerCase()}`,
      "Applicants with a clearly scoped project and internal sponsor",
      grant.matchRequired
        ? "Teams that can verify matching funds early in the process"
        : "Teams prioritizing grants with lower upfront funding barriers",
    ]
  );
}

export function getBeaconTakeaway(grant: GrantRecord): BeaconTakeaway {
  return (
    BEACON_TAKEAWAY_BY_GRANT_ID[grant.id] ?? {
      bestFor: `Applicants that fit the ${grant.eligibleApplicants.slice(0, 2).join(" and ").toLowerCase()} profile and already have a defined project scope.`,
      watchOuts: grant.matchRequired
        ? "Matching funds and readiness requirements should be confirmed early before investing too much drafting time."
        : "Eligibility interpretation and required attachments should be confirmed early so the team avoids late surprises.",
      bottomLine: "Worth prioritizing if your organization is eligible, the project is clearly scoped, and the compliance lift feels manageable.",
    }
  );
}

export function getUpcomingGrantDeadlines(limit = 4): DeadlineTimelineItem[] {
  return [...GRANTS]
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)
    .slice(0, limit)
    .map((grant) => ({
      id: grant.id,
      title: grant.title,
      agencyShort: grant.agencyShort,
      deadline: grant.deadline,
      deadlineShort: grant.deadlineShort,
      daysUntilDeadline: grant.daysUntilDeadline,
    }));
}

export function getUpcomingSavedGrantDeadlines(limit = 4): DeadlineTimelineItem[] {
  return SAVED_GRANT_META.map((meta) => _getGrantByIdSync(meta.id))
    .filter((grant): grant is GrantRecord => Boolean(grant))
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)
    .slice(0, limit)
    .map((grant) => ({
      id: grant.id,
      title: grant.title,
      agencyShort: grant.agencyShort,
      deadline: grant.deadline,
      deadlineShort: grant.deadlineShort,
      daysUntilDeadline: grant.daysUntilDeadline,
    }));
}
