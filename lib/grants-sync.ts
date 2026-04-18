import "server-only"

import { getSupabaseAdmin } from "@/lib/supabase-admin"

const GRANTS_GOV_SEARCH_URL = "https://api.grants.gov/v1/api/search2"
const GRANTS_GOV_DETAIL_URL = "https://api.grants.gov/v1/api/fetchOpportunity"

const TARGET_APPLICANT_KEYWORDS = [
  "state governments",
  "county governments",
  "city or township governments",
  "special district governments",
  "public and state controlled institutions of higher education",
  "native american tribal governments",
  "public housing authorities",
  "nonprofits",
  "independent school districts",
]

type SearchResponse = {
  data?: {
    hitCount?: number
    oppHits?: SearchHit[]
  }
  msg?: string
  errorcode?: number
}

type SearchHit = {
  id: string | number
  number?: string
  title?: string
  agencyName?: string
  closeDate?: string
  oppStatus?: string
}

type OpportunityDetailResponse = {
  data?: OpportunityDetail
  msg?: string
  errorcode?: number
}

type OpportunityDetail = {
  id: number
  opportunityNumber?: string
  opportunityTitle?: string
  synopsis?: {
    agencyName?: string
    synopsisDesc?: string
    awardCeiling?: string
    awardFloor?: string
    applicantTypes?: Array<{ id?: string; description?: string }>
    fundingActivityCategories?: Array<{ id?: string; description?: string }>
    postingDate?: string
    lastUpdatedDate?: string
    costSharing?: boolean
  }
  agencyDetails?: {
    agencyName?: string
  }
  alns?: Array<{ alnNumber?: string }>
  docType?: string
}

type GrantsSyncResult = {
  fetched: number
  imported: number
  deactivated: number
  skipped: number
}

type GrantUpsertRow = {
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
  official_url: string | null
  source: string
  source_opportunity_id: string
  source_opportunity_number: string | null
  source_status: string | null
  source_last_updated_at: string | null
  last_synced_at: string
  is_active: boolean
  raw_source: OpportunityDetail
}

function parseDateString(value?: string | null): string | null {
  if (!value) return null

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [month, day, year] = value.split("/")
    return `${year}-${month}-${day}`
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed.toISOString().slice(0, 10)
}

function parseMoney(value?: string | null): number | null {
  if (!value) return null
  const parsed = Number(value.replace(/[^0-9.-]/g, ""))
  return Number.isFinite(parsed) ? parsed : null
}

function formatAmountLabel(min: number | null, max: number | null): string | null {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })

  if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`
  if (max) return `Up to ${formatter.format(max)}`
  if (min) return `From ${formatter.format(min)}`

  return null
}

function computeDaysUntil(deadlineIso: string | null): number | null {
  if (!deadlineIso) return null

  const today = new Date()
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const deadline = new Date(`${deadlineIso}T00:00:00`)

  return Math.round((deadline.getTime() - startToday.getTime()) / (1000 * 60 * 60 * 24))
}

function mapCategory(categories: Array<{ id?: string; description?: string }> | undefined): string {
  const ids = new Set((categories ?? []).map((item) => item.id))

  if (ids.has("T")) return "Infrastructure"
  if (ids.has("HO") || ids.has("CD")) return "Housing"
  if (ids.has("BC") || ids.has("RD")) return "Economic Development"
  if (ids.has("ENV") || ids.has("DPR") || ids.has("EN")) return "Climate"
  if (ids.has("ED")) return "Education"
  if (ids.has("HL")) return "Public Health"
  if (ids.has("AR") || ids.has("HU")) return "Arts"
  if (ids.has("ST")) return "Research"
  if (ids.has("LJL") || ids.has("CP")) return "Public Safety"
  if (ids.has("ELT")) return "Workforce"
  if (ids.has("NR")) return "Parks"
  if (ids.has("ISS")) return "Public Health"

  return "Economic Development"
}

function normalizeEligibility(applicantTypes: Array<{ description?: string }> | undefined): string[] {
  return (applicantTypes ?? [])
    .map((item) => item.description?.trim())
    .filter((value): value is string => Boolean(value))
}

function isBeaconRelevant(applicantTypes: Array<{ description?: string }> | undefined): boolean {
  const values = normalizeEligibility(applicantTypes).map((item) => item.toLowerCase())
  if (values.length === 0) return true

  return values.some((item) =>
    TARGET_APPLICANT_KEYWORDS.some((keyword) => item.includes(keyword))
  )
}

function buildGuidance(title: string) {
  return {
    howToApply: [
      `Review the full Grants.gov opportunity for ${title} and confirm your entity type is eligible.`,
      "Verify your SAM.gov registration, UEI, and Grants.gov workspace access before you begin drafting.",
      "Download the NOFO and build a checklist for required attachments, forms, and internal approvals.",
      "Submit through Grants.gov before the official deadline and save the confirmation receipt.",
    ],
    allowableUses: [
      "Use the official NOFO to confirm eligible project costs and program priorities.",
      "Treat this Beacon record as a starting point, not the full compliance source.",
    ],
    keyRestrictions: [
      "Final eligibility, match rules, and submission requirements are controlled by the official agency notice.",
      "Do not rely on this summary alone for legal or compliance decisions.",
    ],
    documentsNeeded: [
      "SF-424 family forms",
      "Project narrative",
      "Budget and budget justification",
      "Letters of support or resolutions if required by the NOFO",
    ],
  }
}

function buildGrantRow(detail: OpportunityDetail, hit: SearchHit, syncedAt: string): GrantUpsertRow | null {
  const title = detail.opportunityTitle?.trim()
  const agency =
    detail.synopsis?.agencyName?.trim() ||
    detail.agencyDetails?.agencyName?.trim() ||
    "Unknown agency"

  if (!title) return null
  if (!isBeaconRelevant(detail.synopsis?.applicantTypes)) return null

  const summary =
    detail.synopsis?.synopsisDesc?.replace(/\s+/g, " ").trim() ||
    "See official opportunity notice for full program summary."
  const finalDeadline = parseDateString(hit.closeDate)
  const amountMin = parseMoney(detail.synopsis?.awardFloor)
  const amountMax = parseMoney(detail.synopsis?.awardCeiling)
  const amountLabel = formatAmountLabel(amountMin, amountMax)
  const eligibility = normalizeEligibility(detail.synopsis?.applicantTypes)
  const guidance = buildGuidance(title)
  const sourceStatus = hit.oppStatus ?? detail.docType ?? "posted"
  const sourceOpportunityId = String(detail.id)
  const daysUntilDeadline = computeDaysUntil(finalDeadline)
  const isActive =
    !["closed", "archived"].includes(sourceStatus.toLowerCase()) &&
    (daysUntilDeadline === null || daysUntilDeadline >= 0)

  return {
    id: `gg-${sourceOpportunityId}`,
    title,
    agency,
    cfda: detail.alns?.[0]?.alnNumber ?? null,
    category: mapCategory(detail.synopsis?.fundingActivityCategories),
    summary,
    amount_min: amountMin,
    amount_max: amountMax,
    amount_label: amountLabel,
    match_required: Boolean(detail.synopsis?.costSharing),
    match_amount: detail.synopsis?.costSharing ? "See NOFO for match details" : null,
    deadline: finalDeadline,
    days_until_deadline: daysUntilDeadline,
    eligibility,
    geography: "United States",
    status: isActive ? "open" : "closed",
    how_to_apply: guidance.howToApply,
    allowable_uses: guidance.allowableUses,
    key_restrictions: guidance.keyRestrictions,
    documents_needed: guidance.documentsNeeded,
    official_url: detail.opportunityNumber
      ? `https://www.grants.gov/search-results-detail/${detail.id}`
      : "https://www.grants.gov/search-grants",
    source: "grants_gov",
    source_opportunity_id: sourceOpportunityId,
    source_opportunity_number: detail.opportunityNumber ?? null,
    source_status: sourceStatus,
    source_last_updated_at: parseDateString(detail.synopsis?.lastUpdatedDate) ?? parseDateString(detail.synopsis?.postingDate),
    last_synced_at: syncedAt,
    is_active: isActive,
    raw_source: detail,
  }
}

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

async function fetchSearchHits(rows: number, startRecordNum: number): Promise<SearchHit[]> {
  const payload = {
    rows,
    startRecordNum,
    oppStatuses: "posted|forecasted",
    fundingInstruments: "G|CA",
    keyword: "",
  }

  const response = await postJson<SearchResponse>(GRANTS_GOV_SEARCH_URL, payload)

  if (response.errorcode && response.errorcode !== 0) {
    throw new Error(response.msg || "Grants.gov search failed")
  }

  return response.data?.oppHits ?? []
}

async function fetchOpportunityDetail(opportunityId: string | number): Promise<OpportunityDetail | null> {
  const response = await postJson<OpportunityDetailResponse>(GRANTS_GOV_DETAIL_URL, {
    opportunityId: Number(opportunityId),
  })

  if (response.errorcode && response.errorcode !== 0) {
    throw new Error(response.msg || `Failed to fetch opportunity ${opportunityId}`)
  }

  return response.data ?? null
}

export async function syncGrantsFromGrantsGov(): Promise<GrantsSyncResult> {
  const supabase = getSupabaseAdmin()
  const syncedAt = new Date().toISOString()
  const rowsPerPage = Number(process.env.GRANTS_SYNC_ROWS_PER_PAGE ?? 10)
  const maxRecords = Number(process.env.GRANTS_SYNC_MAX_RECORDS ?? 25)

  const records: GrantUpsertRow[] = []
  const seenIds = new Set<string>()

  for (let startRecordNum = 0; records.length < maxRecords; startRecordNum += rowsPerPage) {
    const hits = await fetchSearchHits(rowsPerPage, startRecordNum)
    if (hits.length === 0) break

    const details = await Promise.all(
      hits.map(async (hit) => ({
        hit,
        detail: await fetchOpportunityDetail(hit.id),
      }))
    )

    for (const { hit, detail } of details) {
      if (records.length >= maxRecords) break

      if (!detail) continue

      const row = buildGrantRow(detail, hit, syncedAt)
      if (!row) continue
      if (seenIds.has(row.source_opportunity_id)) continue

      records.push(row)
      seenIds.add(row.source_opportunity_id)
    }
  }

  if (records.length > 0) {
    const { error } = await supabase
      .from("grants")
      .upsert(records, {
        onConflict: "source_opportunity_id",
      })

    if (error) {
      throw new Error(`Supabase upsert failed: ${error.message}`)
    }
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("grants")
    .select("id, source_opportunity_id")
    .eq("source", "grants_gov")
    .eq("is_active", true)

  if (existingError) {
    throw new Error(`Failed to read existing Grants.gov rows: ${existingError.message}`)
  }

  const staleIds = (existingRows ?? [])
    .filter((row) => row.source_opportunity_id && !seenIds.has(String(row.source_opportunity_id)))
    .map((row) => row.id)

  if (staleIds.length > 0) {
    const { error } = await supabase
      .from("grants")
      .update({
        is_active: false,
        source_status: "inactive",
        last_synced_at: syncedAt,
      })
      .in("id", staleIds)

    if (error) {
      throw new Error(`Failed to deactivate stale rows: ${error.message}`)
    }
  }

  return {
    fetched: seenIds.size,
    imported: records.length,
    deactivated: staleIds.length,
    skipped: seenIds.size - records.length,
  }
}
