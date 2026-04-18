---
name: Beacon App — Project Overview
description: Core tech stack, design system, and page plan for the Beacon grant discovery platform
type: project
---

Grant discovery and intelligence platform for governments, nonprofits, and universities.

**Stack:** Next.js 14 (App Router) + TypeScript, Tailwind CSS, Supabase (not yet connected), Vercel (not yet deployed)

**Color palette:**
- Background: cream `#F5F0E8`
- Primary: forest green `#2D4A2D`
- Accent: amber `#D4821A`
- Card BG: white `#FFFFFF`
- Text: dark charcoal `#1A1A1A`

**Typography:** Inter (Google Fonts), large bold headings, italic amber on key headline words

**Pages planned:**
- `/` — Homepage (built)
- `/discover` — Search Results (pending)
- `/grants/[id]` — Grant Detail (pending)
- `/my-grants` — My Grants Dashboard (pending)
- `/categories` — Browse Categories (pending)
- `/resources` — Resources Library (pending)

**Shared nav:** Beacon logo + signal icon (left), Discover/My Grants/Categories/Resources links (center), search + bell + Sign In (right). Cream background, forest green active indicator.

**Why:** No real data connected yet — all placeholder. Supabase and Vercel integrations are future steps.

**How to apply:** When building remaining pages, follow the same color/type/component conventions. Navigation is already shared via `app/layout.tsx`.
