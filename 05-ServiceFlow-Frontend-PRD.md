# ServiceFlow — Frontend PRD
**Document 5 of 5 — React Architecture, Pages, Components, User Flows**

Stack assumed: React 18+ (Vite), TypeScript, React Router, React Query (server state), Zustand (UI/local state), Tailwind CSS, Radix UI primitives (per Document 3's component approach).

---

## 1. Project Structure

```
serviceflow-frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx                # route config + protected route wrapping
│   │   └── providers.tsx             # React Query, Theme, Auth context providers
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx      # renders role-specific dashboard variant
│   │   ├── job-cards/
│   │   │   ├── JobCardListPage.tsx
│   │   │   ├── JobCardDetailPage.tsx
│   │   │   └── JobCardCreatePage.tsx
│   │   ├── customers/
│   │   │   ├── CustomerListPage.tsx
│   │   │   └── CustomerDetailPage.tsx
│   │   ├── inventory/
│   │   │   └── InventoryListPage.tsx
│   │   ├── invoices/
│   │   │   ├── InvoiceListPage.tsx
│   │   │   └── InvoiceDetailPage.tsx
│   │   ├── reports/
│   │   │   └── ReportsPage.tsx
│   │   ├── employees/
│   │   │   └── EmployeeListPage.tsx
│   │   ├── settings/
│   │   │   ├── OrganizationSettingsPage.tsx
│   │   │   ├── BranchSettingsPage.tsx
│   │   │   └── BillingSettingsPage.tsx
│   │   └── portal/                    # customer-facing portal (separate auth flow)
│   │       └── JobStatusPage.tsx
│   ├── components/
│   │   ├── ui/                        # generic primitives: Button, Input, Card, Table, Pill, Modal
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── MobileTabBar.tsx
│   │   │   └── CommandPalette.tsx
│   │   ├── job-cards/
│   │   │   ├── JobCardCard.tsx
│   │   │   ├── JobCardStatusPill.tsx
│   │   │   ├── JobCardForm.tsx
│   │   │   ├── JobCardTimeline.tsx    # status history display
│   │   │   └── JobCardBoard.tsx       # Kanban view for Technician dashboard
│   │   ├── customers/
│   │   │   ├── CustomerForm.tsx
│   │   │   └── CustomerHistoryList.tsx
│   │   ├── invoices/
│   │   │   ├── InvoiceForm.tsx
│   │   │   └── InvoicePreview.tsx
│   │   ├── dashboard/
│   │   │   ├── KpiCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── StatusBreakdownChart.tsx
│   │   │   └── NeedsAttentionWidget.tsx
│   │   └── shared/
│   │       ├── EmptyState.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       ├── SearchInput.tsx
│   │       └── ConfirmDialog.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useJobCards.ts             # React Query hooks per domain
│   │   ├── useCustomers.ts
│   │   ├── useInventory.ts
│   │   ├── useInvoices.ts
│   │   └── usePermissions.ts          # role-based UI gating, mirrors backend permissions.config
│   ├── stores/
│   │   ├── uiStore.ts                 # sidebar collapsed state, theme, command palette open/closed
│   │   └── authStore.ts               # current user/org, token refresh state
│   ├── lib/
│   │   ├── apiClient.ts               # axios/fetch wrapper, attaches auth token, handles 401 refresh
│   │   ├── permissions.config.ts      # shared role matrix (kept in sync with backend)
│   │   └── formatters.ts              # currency, date, phone formatting
│   ├── types/
│   │   └── *.types.ts                 # shared TS interfaces per domain (mirrors backend schemas)
│   └── styles/
│       └── tokens.css                 # design tokens from Document 3 as CSS variables
```

---

## 2. Routing & Protected Routes

- `/login`, `/register`, `/forgot-password` — public
- `/portal/:token` — customer portal, separate lightweight auth (magic link/OTP, not the main JWT flow)
- All other routes wrapped in `<ProtectedRoute>`, which checks `authStore` for a valid session and redirects to `/login` if absent
- Role-gated routes (e.g., `/employees`, `/settings/billing`) additionally wrapped in `<RequireRole roles={['owner','manager']}>`, which renders a 403/"not authorized" state rather than redirecting, so a demoted-mid-session user gets clear feedback

### Route Map
```
/dashboard
/job-cards                    (list)
/job-cards/new                (create)
/job-cards/:id                (detail)
/customers                    (list)
/customers/:id                (detail — includes assets + job history)
/inventory                    (list)
/invoices                     (list)
/invoices/:id                 (detail/preview)
/reports
/employees                    (role-gated: owner, manager)
/settings/organization        (role-gated: owner)
/settings/branches             (role-gated: owner)
/settings/billing              (role-gated: owner)
```

---

## 3. State Management Strategy

- **Server state (data from API):** React Query exclusively — no manually-managed `useEffect` + `useState` data fetching. Each domain has a hooks file (`useJobCards.ts`, etc.) exposing `useJobCardsList()`, `useJobCard(id)`, `useCreateJobCard()`, `useUpdateJobCardStatus()`, etc., each wrapping `useQuery`/`useMutation`.
- **Optimistic updates:** job card status changes update the cache optimistically (instant pill color change) before the server confirms, with rollback on error — this matters a lot for perceived speed on a shop floor.
- **UI/local state:** Zustand for cross-component UI state that isn't server data (sidebar collapse, theme, command palette visibility, active branch filter).
- **Form state:** React Hook Form for all forms (job card, customer, invoice), paired with Zod schemas shared conceptually with backend validation (not literally shared code across FE/BE at MVP, but same rules).

---

## 4. Key User Flows

### 4.1 Login → Dashboard
1. User lands on `/login`, enters email/password
2. On success, token stored (access token in memory/Zustand, refresh token httpOnly cookie), redirect to `/dashboard`
3. Dashboard renders based on `user.role` (Owner/Manager/Employee/Technician variant per Document 3 Section 7)

### 4.2 Create Job Card (core flow — must be fast)
1. From Dashboard or Job Cards list, click "New Job Card" (also reachable via Command Palette)
2. Step 1: Search/select existing customer by phone number (autocomplete) OR "+ New Customer" inline (name + phone only required to keep this fast — other fields optional)
3. Step 2: Select or create Asset (vehicle/device) linked to that customer
4. Step 3: Problem description, priority, assign technician (optional at creation)
5. Submit → job card created with status `received`, `jobCardNumber` auto-generated, redirected to `JobCardDetailPage`
6. Entire flow targeted at <60 seconds for a returning customer (autocomplete short-circuits steps 2–3 if asset already exists)

### 4.3 Update Job Card Status (highest-frequency action)
1. From `JobCardDetailPage` or `JobCardBoard` (Technician Kanban view), click/tap the current status pill
2. A dropdown/sheet shows only the valid next statuses (per backend state machine — frontend must not show invalid transitions as options)
3. Optional note field for the status change
4. Confirm → optimistic UI update, API call, notification auto-triggered if status is customer-facing (`ready`/`delivered`) — a small toast confirms "Customer notified via WhatsApp" when applicable

### 4.4 Generate & Send Invoice
1. From `JobCardDetailPage`, once status is `ready` or `delivered`, "Generate Invoice" button appears
2. Pre-fills line items from `laborCharges` and `partsUsed` on the job card
3. User can add/edit line items, apply discount, review totals
4. "Send to Customer" → marks invoice `sent`, triggers notification with a link/summary (and PDF if configured)
5. Record Payment button available inline once invoice is sent — supports partial payments (updates `amountPaid`, status auto-transitions `sent` → `partially_paid` → `paid`)

### 4.5 Customer Portal Flow (separate, lightweight)
1. Customer receives SMS/WhatsApp with a magic link (`/portal/:token`)
2. Portal shows: job status (visual timeline matching internal status but with customer-friendly labels), estimated completion, invoice/payment summary if applicable
3. No login required beyond the token; token expires after a configurable window (e.g., 30 days) or job delivery + 7 days

---

## 5. Component Behavior Details

### 5.1 Loading States
- List pages: skeleton rows matching table layout (Document 3, 3.9) while `useQuery` is loading
- Detail pages: skeleton card layout, not a spinner, for the main content area
- Mutations (status update, create): button shows inline spinner + disabled state, no full-page loading overlay for small actions

### 5.2 Empty States
- Every list page has a distinct empty state per Document 3 Section 3.8, with a CTA relevant to that page ("Create your first job card", "Add your first customer")
- Filtered-to-empty (e.g., search with no results) shows a different message than true-empty ("No job cards match 'xyz'" + a "Clear filters" action, not the onboarding CTA)

### 5.3 Error States
- Form-level errors: inline field errors from Zod/React Hook Form validation, plus a summary banner for server-side validation errors (e.g., "This phone number is already registered")
- Page-level errors (failed fetch): a retry-capable error card, not a blank page or uncaught crash — wrapped in a React Error Boundary per major route section
- Network/offline detection: a persistent top banner ("You're offline — changes will sync when reconnected") given the shop-floor Wi-Fi reality; mutations queue and retry via React Query's built-in retry/offline handling where feasible for MVP scope

### 5.4 Accessibility & Responsive Behavior
- All interactive components built on Radix primitives inherit keyboard nav and ARIA roles by default (Dialog, DropdownMenu, Tabs, etc.)
- Table views collapse to card-per-row layout below `md` breakpoint (Document 3, Section 5) rather than horizontal-scrolling tables, since front-desk tablet/phone use is a primary use case, not an edge case
- Command palette (`Cmd/Ctrl+K` desktop) exposed as a persistent search icon in the mobile topbar instead, since mobile has no keyboard shortcut equivalent

---

## 6. Reusable Component Contracts (Key Examples)

**`<JobCardStatusPill status="in_progress" size="sm" />`**
- Pure presentational, maps `status` to color/label from a single shared enum (`lib/formatters.ts` + `styles/tokens.css`), used consistently across list, detail, board, and dashboard views — one place to change status visuals platform-wide.

**`<KpiCard label="Revenue This Month" value={formatCurrency(x)} trend={+12.4} icon={<RevenueIcon />} />`**
- Generic enough to cover all Dashboard KPI cards (Document 3, Section 7) without per-metric one-off components.

**`<JobCardForm mode="create" | "edit" initialValues?={} onSubmit={} />`**
- Single form component handles both creation and editing to avoid duplicated validation/layout logic; `mode` controls which fields are editable (e.g., `jobCardNumber` never editable).

---

## 7. Performance Considerations
- Route-based code splitting (`React.lazy` + `Suspense`) per top-level page so initial load only ships the Dashboard + auth bundle
- Virtualized lists (e.g., `@tanstack/react-virtual`) for Job Cards / Customers lists once an org exceeds ~500 records, to keep table rendering smooth
- Image attachments (job card photos) lazy-loaded and served at a thumbnail size in list/detail views, full resolution only on explicit "view full image" action

---

## 8. Testing Approach (Frontend)
- Component/unit tests: React Testing Library for form validation, status pill rendering logic, permission-gated UI rendering
- Integration tests: critical flows from Section 4 (create job card, status update, invoice generation) tested against a mocked API layer (MSW — Mock Service Worker)
- No E2E requirement at MVP stage beyond manual QA; Playwright suite recommended once Phase 3 (multi-branch) ships, covering the core flows across roles
