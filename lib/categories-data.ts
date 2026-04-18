/**
 * Browse-by-category metadata for the Categories page and Discover filter labels.
 * `filterLabel` must match grant `category` values when present in mock data.
 */

export interface BrowseCategory {
  /** URL slug / hash id, e.g. housing */
  id: string;
  /** Display name */
  name: string;
  /** Value used in Discover filters and grant records */
  filterLabel: string;
  oneLineDescription: string;
  /** Mock count for UI */
  grantCount: number;
  /** Highlight in “Featured” strip */
  featured?: boolean;
}

/** All categories shown in Discover checkboxes — single source of truth */
export const DISCOVER_CATEGORY_FILTERS: string[] = [
  "Housing",
  "Broadband",
  "Infrastructure",
  "Parks",
  "Workforce",
  "Climate",
  "Education",
  "Public Health",
  "Arts",
  "Research",
  "Public Safety",
  "Economic Development",
];

export const BROWSE_CATEGORIES: BrowseCategory[] = [
  {
    id: "housing",
    name: "Housing",
    filterLabel: "Housing",
    oneLineDescription:
      "Affordable housing, CDBG, HOME, and community development aligned with local housing plans.",
    grantCount: 142,
    featured: true,
  },
  {
    id: "broadband",
    name: "Broadband",
    filterLabel: "Broadband",
    oneLineDescription:
      "Digital equity, middle- and last-mile infrastructure, and adoption programs for unserved areas.",
    grantCount: 89,
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    filterLabel: "Infrastructure",
    oneLineDescription:
      "Surface transportation, water and wastewater, transit, and intermodal projects with regional impact.",
    grantCount: 217,
    featured: true,
  },
  {
    id: "parks",
    name: "Parks",
    filterLabel: "Parks",
    oneLineDescription:
      "Outdoor recreation, trails, urban forestry, and conservation tied to public access and resilience.",
    grantCount: 63,
  },
  {
    id: "workforce",
    name: "Workforce",
    filterLabel: "Workforce",
    oneLineDescription:
      "Job training, apprenticeships, sector partnerships, and programs that connect residents to quality jobs.",
    grantCount: 108,
  },
  {
    id: "climate",
    name: "Climate",
    filterLabel: "Climate",
    oneLineDescription:
      "Clean energy, emissions reduction, resilience planning, and hazard mitigation investments.",
    grantCount: 95,
    featured: true,
  },
  {
    id: "education",
    name: "Education",
    filterLabel: "Education",
    oneLineDescription:
      "K–12 formula and competitive funds, literacy, after-school, and facilities supporting high-need students.",
    grantCount: 176,
  },
  {
    id: "public-health",
    name: "Public Health",
    filterLabel: "Public Health",
    oneLineDescription:
      "Preventive care, behavioral health, epidemiology capacity, and community health infrastructure.",
    grantCount: 124,
  },
  {
    id: "arts",
    name: "Arts",
    filterLabel: "Arts",
    oneLineDescription:
      "Public arts access, cultural preservation, creative workforce development, and community engagement.",
    grantCount: 71,
  },
  {
    id: "research",
    name: "Research",
    filterLabel: "Research",
    oneLineDescription:
      "University and institutional R&D, technology transfer, and partnerships with public-sector priorities.",
    grantCount: 98,
  },
  {
    id: "public-safety",
    name: "Public Safety",
    filterLabel: "Public Safety",
    oneLineDescription:
      "Law enforcement support, emergency communications, courts, and justice-related community programs.",
    grantCount: 154,
  },
  {
    id: "economic-development",
    name: "Economic Development",
    filterLabel: "Economic Development",
    oneLineDescription:
      "Small business support, innovation districts, revitalization, and regional competitiveness initiatives.",
    grantCount: 131,
  },
];

export const TOTAL_BROWSE_CATEGORIES = BROWSE_CATEGORIES.length;

export const TOTAL_TRACKED_GRANTS_MOCK = BROWSE_CATEGORIES.reduce((sum, c) => sum + c.grantCount, 0);

/** Quick links for secondary section */
export const POPULAR_SEARCHES = [
  { label: "CDBG", q: "CDBG" },
  { label: "Broadband BEAD", q: "BEAD" },
  { label: "RAISE grants", q: "RAISE" },
  { label: "Climate resilience", q: "climate" },
  { label: "Title I", q: "Title I" },
];
