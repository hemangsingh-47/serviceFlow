# ServiceFlow — UI/UX PRD
**Document 3 of 5 — Complete Design System**

Design direction: minimal, premium, clean, modern SaaS. Inspired by the *feel* of Stripe Dashboard, Linear, Notion, Vercel, Raycast, and Clerk — not copied. ServiceFlow's own identity should read as "calm, fast, trustworthy" — appropriate for a tool a shop owner checks 20+ times a day under time pressure.

---

## 1. Design Principles
1. **One click less** — every frequent action (create job card, mark ready, record payment) should be reachable in ≤2 clicks from the dashboard.
2. **Speed over decoration** — no unnecessary animation delays; the UI should feel instantaneous, especially on mobile in a noisy workshop environment.
3. **Legible under bad conditions** — shop staff use this on cracked phone screens in bright sunlight or dim garages. High contrast, large tap targets, no thin low-contrast gray-on-white text.
4. **Progressive disclosure** — a solo shop owner sees a simple interface; a multi-branch manager sees more, but nothing is hidden that a growing shop will need.

---

## 2. Design Tokens

### 2.1 Color System

**Primary (Brand)**
- `--color-primary-600: #4F46E5` (indigo — trust, technology, calm)
- `--color-primary-500: #6366F1`
- `--color-primary-100: #E0E7FF` (light backgrounds/badges)

**Secondary (Neutral base)**
- `--color-neutral-900: #0F1115` (near-black, primary text dark mode / darkest surface)
- `--color-neutral-700: #374151` (body text, light mode)
- `--color-neutral-500: #6B7280` (secondary text)
- `--color-neutral-200: #E5E7EB` (borders, light mode)
- `--color-neutral-50: #F9FAFB` (app background, light mode)
- `--color-white: #FFFFFF`

**Accent (Status/Semantic — mapped to Job Card statuses)**
- `--color-status-received: #6B7280` (neutral gray)
- `--color-status-diagnosed: #3B82F6` (blue)
- `--color-status-in-progress: #F59E0B` (amber)
- `--color-status-awaiting-parts: #EF4444` (red — needs attention)
- `--color-status-ready: #10B981` (green)
- `--color-status-delivered: #8B5CF6` (violet — completed/archived)
- `--color-success: #10B981`
- `--color-warning: #F59E0B`
- `--color-danger: #EF4444`
- `--color-info: #3B82F6`

### 2.2 Typography
- **Font family:** Inter (UI text), fallback: system-ui, -apple-system, sans-serif
- **Numeric/tabular data (invoices, reports):** Inter with `font-variant-numeric: tabular-nums` for aligned columns
- **Scale:**
  - `--text-xs: 12px / 16px`
  - `--text-sm: 14px / 20px` (default body/table text)
  - `--text-base: 16px / 24px` (default form/input text)
  - `--text-lg: 18px / 28px` (section headers)
  - `--text-xl: 22px / 30px` (page titles)
  - `--text-2xl: 28px / 36px` (dashboard KPI numbers)
  - `--text-3xl: 36px / 44px` (rare — empty state/marketing headlines)
- **Weights:** 400 (body), 500 (labels/emphasis), 600 (headings), 700 (KPI numbers only)

### 2.3 Spacing Scale (4px base unit)
`--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-5: 20px`, `--space-6: 24px`, `--space-8: 32px`, `--space-10: 40px`, `--space-12: 48px`, `--space-16: 64px`

### 2.4 Border Radius
- `--radius-sm: 6px` (badges, small buttons)
- `--radius-md: 8px` (inputs, cards, buttons — default)
- `--radius-lg: 12px` (modals, large cards)
- `--radius-full: 9999px` (avatars, status pills)

### 2.5 Elevation / Shadows
- `--shadow-xs: 0 1px 2px rgba(0,0,0,0.04)` — subtle card resting state
- `--shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` — hover state, dropdowns
- `--shadow-md: 0 4px 12px rgba(0,0,0,0.10)` — modals, popovers
- `--shadow-lg: 0 10px 30px rgba(0,0,0,0.15)` — command palette, critical dialogs
- Dark mode shadows use higher opacity black + a subtle 1px border instead of relying on shadow alone (shadows read poorly on dark backgrounds)

---

## 3. Core Components

### 3.1 Buttons
- **Primary:** solid `--color-primary-600`, white text, `--radius-md`, height 40px (default) / 36px (compact/table rows) / 44px (mobile touch targets)
- **Secondary:** white/neutral-50 background, 1px neutral-200 border, neutral-700 text
- **Destructive:** solid `--color-danger`, used only for irreversible actions (delete job card, void invoice)
- **Ghost/Tertiary:** transparent, used for inline table actions
- States: default, hover (+4% darken), active (+8% darken), disabled (50% opacity, no pointer), loading (spinner replaces label, button stays same width to avoid layout shift)

### 3.2 Cards
- White (light) / `--color-neutral-900` with 1px `--color-neutral-700`-ish border (dark) background
- `--radius-lg`, `--shadow-xs` at rest, `--shadow-sm` on hover if interactive
- Padding: `--space-6` standard, `--space-4` for dense/dashboard widget cards

### 3.3 Tables
- Row height: 48px (desktop), 56px (touch-friendly for tablet use at front desk)
- Header row: `--text-xs`, weight 500, uppercase, neutral-500, sticky on scroll
- Zebra striping: none by default (cleaner, Linear-style); use a subtle hover-row background (`--color-neutral-50`) instead
- Status column always rendered as a colored pill (see 3.5), never plain text
- Row click opens detail view; explicit action icons (view/edit/more) right-aligned in a fixed-width column

### 3.4 Inputs & Forms
- Height 40px, `--radius-md`, 1px `--color-neutral-200` border, focus state: 2px `--color-primary-500` ring + border color shift
- Label above input (not placeholder-as-label — placeholders are reserved for format hints, e.g., "e.g., +91 98765 43210")
- Inline validation on blur, not on every keystroke; error state: red border + `--text-xs` red helper text below field
- Required fields marked with a subtle asterisk, not color alone (accessibility)

### 3.5 Status Pills (Job Card status — critical, high-visibility component)
- Pill shape (`--radius-full`), `--text-xs`, weight 500, colored background at 12% opacity of the status color + full-opacity text/dot of that color
- Always paired with a small dot indicator, not color alone, for colorblind accessibility
- Example: "In Progress" → amber dot + amber-tinted background + amber-900 text

### 3.6 Charts (Reports/Analytics)
- Library: Recharts
- Color sequence pulled from the accent palette, in a fixed consistent order across all charts (predictability > variety)
- Always show empty state with a helpful message ("No revenue data yet — complete your first job to see trends") rather than a blank chart
- Tooltips: dark background regardless of light/dark mode (for contrast/legibility), rounded, `--shadow-md`

### 3.7 Navigation

**Sidebar (desktop, ≥1024px)**
- Fixed left, 240px wide, collapsible to 64px (icon-only)
- Sections: Dashboard, Job Cards, Customers, Inventory, Invoices, Reports, Employees (role-gated), Settings
- Active item: `--color-primary-100` background (light mode) / primary-600 at 15% opacity (dark), left accent bar in primary-600
- Branch switcher pinned at top of sidebar for multi-branch orgs

**Topbar**
- 56px height, contains: global search trigger, notification bell, user avatar/menu
- Breadcrumb-style page title on the left when sidebar is collapsed

**Mobile (<768px)**
- Sidebar becomes a bottom tab bar (Dashboard, Job Cards, Customers, More) — the 4 most frequent destinations get bottom-tab priority
- "More" reveals Inventory, Invoices, Reports, Settings in a slide-up sheet

**Command Palette**
- Triggered by `Cmd/Ctrl+K`
- Fuzzy search across customers, job cards (by number or customer name), and quick actions ("Create Job Card", "New Customer", "Go to Inventory")
- `--shadow-lg`, centered modal, max-width 560px

### 3.8 Empty States
- Icon or simple illustration (not stock photography), one-line explanation, one primary CTA button
- Example (Job Cards, first-time): "No job cards yet — create your first one to start tracking repairs." + [Create Job Card] button

### 3.9 Loading Skeletons
- Used for all list/table/dashboard loads >200ms; never a blank white screen or spinner-only for primary content areas
- Skeleton shapes mirror the actual layout (table rows, card grids) to avoid layout shift on load

### 3.10 Micro-animations & Transitions
- Duration: 120–180ms for micro-interactions (button press, pill state change), 200–250ms for panel/modal open, ease-out curve
- Status change on a job card animates the pill color transition (not an abrupt swap) to reinforce that an action succeeded
- No animation exceeds 300ms — this is a workflow tool, not a marketing site; speed perception matters more than delight

---

## 4. Theming

### 4.1 Light Theme (default)
Background `--color-neutral-50`, surface/card `--color-white`, primary text `--color-neutral-900`, secondary text `--color-neutral-500`, borders `--color-neutral-200`.

### 4.2 Dark Theme
Background `#0B0D10`, surface/card `--color-neutral-900` (#0F1115), primary text `#F3F4F6`, secondary text `#9CA3AF`, borders `#262A31`. Primary color stays the same indigo but slightly brightened (`#818CF8`) for sufficient contrast on dark backgrounds.

---

## 5. Responsive Breakpoints
- `sm: 640px` (large phone)
- `md: 768px` (tablet — front-desk kiosk use case)
- `lg: 1024px` (small laptop — sidebar becomes persistent)
- `xl: 1280px` (desktop — default dashboard multi-column layouts)
- `2xl: 1536px` (wide desktop — reports get extra chart columns)

Mobile-first CSS; tablet (768–1024px) is a first-class target since front-desk/reception often uses a tablet for intake.

---

## 6. Accessibility
- Minimum contrast ratio 4.5:1 for body text, 3:1 for large text/UI components (WCAG AA)
- All interactive elements reachable via keyboard (Tab order follows visual order); command palette fully keyboard-operable
- Status conveyed via icon/shape + color, never color alone
- Form errors announced via `aria-live` regions for screen readers
- Minimum tap target size 40x40px on touch interfaces

---

## 7. Dashboard Designs

### 7.1 Owner Dashboard
- Top row KPI cards: Revenue (This Month), Jobs Completed, Jobs In Progress, Overdue Jobs (red accent if >0)
- Revenue trend chart (last 30 days, line chart)
- Job status breakdown (donut chart using status colors from 2.1)
- "Needs Attention" widget: job cards awaiting parts >3 days, unpaid invoices >7 days overdue
- Branch performance table (multi-branch orgs only)

### 7.2 Manager Dashboard
- Same as Owner but scoped to their branch(es); no billing/subscription widget; employee workload widget added (job cards per technician, this week)

### 7.3 Employee Dashboard
- Simplified: "Today's Job Cards" list (created or updated today), quick "Create Job Card" and "New Customer" buttons, no financial KPIs

### 7.4 Technician Dashboard
- "My Assigned Jobs" — Kanban-style board by status (Received → Diagnosed → In Progress → Awaiting Parts → Ready), drag-and-drop or tap-to-advance status
- No access to revenue, other technicians' jobs, or reports

---

## 8. Component Library Notes for Implementation
- Build on a headless/unstyled primitive library (Radix UI) + Tailwind CSS utility classes mapped to the design tokens above, rather than a pre-styled component kit — this is how the Linear/Vercel-adjacent aesthetic is achieved (no default component "look" to override)
- Centralize all tokens (colors, spacing, radius) in a single Tailwind config / CSS variables file so theme changes (light/dark, future white-labeling for Enterprise plan) are a config change, not a component-by-component edit
