# ServiceFlow — Backend PRD
**Document 4 of 5 — Folder Structure, Endpoints, Security, Infrastructure Concerns**

Stack assumed: Node.js + Express (TypeScript), MongoDB via Mongoose. (See Document 2 for rationale; swap to NestJS folder conventions if the build tool prefers stronger structure — the module boundaries below stay the same either way.)

---

## 1. Folder Structure

```
serviceflow-backend/
├── src/
│   ├── config/
│   │   ├── db.ts                  # MongoDB connection
│   │   ├── env.ts                 # env var validation (zod schema)
│   │   └── constants.ts           # role enums, status enums, plan limits
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.validation.ts
│   │   ├── organizations/
│   │   ├── branches/
│   │   ├── users/
│   │   ├── customers/
│   │   ├── assets/
│   │   ├── jobCards/
│   │   │   ├── jobCards.controller.ts
│   │   │   ├── jobCards.service.ts
│   │   │   ├── jobCards.routes.ts
│   │   │   ├── jobCards.validation.ts
│   │   │   └── jobCards.stateMachine.ts   # status transition rules
│   │   ├── inventory/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── notifications/
│   │   ├── reports/
│   │   └── auditLogs/
│   ├── middleware/
│   │   ├── authenticate.ts        # JWT verification
│   │   ├── authorize.ts           # role/permission checks
│   │   ├── tenantScope.ts         # injects organizationId filter
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── requestLogger.ts
│   ├── models/                    # Mongoose schemas (one per collection, see Doc 2)
│   ├── services/
│   │   ├── notification/
│   │   │   ├── sms.provider.ts
│   │   │   ├── whatsapp.provider.ts
│   │   │   └── notification.dispatcher.ts
│   │   ├── storage/
│   │   │   └── s3.service.ts
│   │   └── billing/
│   │       └── stripe.service.ts  # or razorpay.service.ts
│   ├── utils/
│   │   ├── pagination.ts
│   │   ├── idGenerator.ts         # sequential jobCardNumber/invoiceNumber
│   │   └── logger.ts
│   ├── jobs/                      # background/queued jobs
│   │   ├── notificationRetry.job.ts
│   │   └── lowStockAlert.job.ts
│   ├── app.ts                     # Express app setup, middleware wiring
│   └── server.ts                  # entry point
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
└── tsconfig.json
```

**Module pattern:** every domain module (jobCards, invoices, etc.) is self-contained: routes → controller → service → model. Controllers only handle req/res and validation; all business logic lives in services so it's independently testable and reusable (e.g., invoice creation logic is called both from an HTTP route and from a background job).

---

## 2. Authentication & Authorization

### 2.1 Authentication Flow
1. `POST /api/v1/auth/register` — creates Organization + Owner user in one transaction
2. `POST /api/v1/auth/login` — email + password → returns access token (15 min expiry) + refresh token (7 day expiry, httpOnly cookie)
3. `POST /api/v1/auth/refresh` — exchanges valid refresh token for new access token
4. `POST /api/v1/auth/logout` — invalidates refresh token (stored/blacklisted server-side)
5. Passwords hashed with bcrypt (cost factor 12)

### 2.2 JWT Payload
```json
{
  "userId": "...",
  "organizationId": "...",
  "role": "manager",
  "branchIds": ["..."],
  "iat": ...,
  "exp": ...
}
```

### 2.3 RBAC Implementation
- `authorize(...allowedRoles)` middleware checks `req.user.role` against an allowlist per route
- For resource-level checks beyond role (e.g., Technician can only update job cards assigned to them), an additional service-layer check compares `req.user.userId` against the resource's `assignedTechnicianId` before allowing writes
- Permission matrix from Document 1 (Section 3.2) is implemented as a single source-of-truth config object (`permissions.config.ts`) consumed by both `authorize` middleware and frontend route guards (via a shared types package or duplicated constant, kept in sync manually at MVP stage)

### 2.4 Tenant Scoping Middleware
`tenantScope.ts` runs after `authenticate` on every protected route: extracts `organizationId` from the JWT and attaches it to `req.tenantFilter = { organizationId }`. All service-layer database queries must spread `req.tenantFilter` into their Mongoose query — enforced via code review checklist and, ideally, a lint rule/test that flags any direct model query missing an `organizationId` filter.

---

## 3. Core API Endpoints

Base path: `/api/v1`. All routes below (except `/auth/*`) require a valid access token.

### 3.1 Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### 3.2 Organizations & Branches
- `GET /organizations/me` — current org details + plan
- `PATCH /organizations/me` — update settings (Owner only)
- `GET /branches` — list branches
- `POST /branches` — create branch (Owner only)
- `PATCH /branches/:id`
- `DELETE /branches/:id`

### 3.3 Users
- `GET /users` — list (filter by role, branch)
- `POST /users` — invite/create user (Owner/Manager)
- `GET /users/:id`
- `PATCH /users/:id` — update role/branches
- `DELETE /users/:id` — deactivate (soft delete, never hard delete for audit integrity)

### 3.4 Customers
- `GET /customers` — paginated, searchable (`?search=`, `?sort=`, `?page=`)
- `POST /customers`
- `GET /customers/:id` — includes asset history and job card history (aggregated)
- `PATCH /customers/:id`
- `DELETE /customers/:id` — soft delete

### 3.5 Assets
- `GET /customers/:customerId/assets`
- `POST /customers/:customerId/assets`
- `PATCH /assets/:id`
- `DELETE /assets/:id`

### 3.6 Job Cards (core module)
- `GET /job-cards` — paginated, filterable (`?status=`, `?technicianId=`, `?branchId=`, `?priority=`, `?dateFrom=&dateTo=`)
- `POST /job-cards` — create (auto-generates `jobCardNumber`)
- `GET /job-cards/:id` — full detail incl. status history, parts used, attachments
- `PATCH /job-cards/:id` — general field updates
- `PATCH /job-cards/:id/status` — status transition (validated against state machine; triggers notification dispatch)
- `POST /job-cards/:id/parts` — add part usage (decrements inventory, creates inventoryTransaction)
- `POST /job-cards/:id/attachments` — upload photo/document
- `DELETE /job-cards/:id` — cancel (soft delete/status=cancelled, not hard delete)

### 3.7 Inventory
- `GET /inventory` — paginated, filterable, `?lowStock=true`
- `POST /inventory`
- `PATCH /inventory/:id`
- `POST /inventory/:id/restock` — creates inventoryTransaction type=restock
- `GET /inventory/:id/transactions` — history

### 3.8 Invoices
- `GET /invoices` — paginated, filterable (`?status=`, `?customerId=`)
- `POST /invoices` — generate from job card
- `GET /invoices/:id`
- `PATCH /invoices/:id` — edit line items (draft only)
- `POST /invoices/:id/send` — marks sent, triggers customer notification
- `POST /invoices/:id/void`

### 3.9 Payments
- `POST /invoices/:id/payments` — record a payment (requires `Idempotency-Key` header)
- `GET /invoices/:id/payments`

### 3.10 Reports
- `GET /reports/revenue?period=` 
- `GET /reports/job-status-breakdown`
- `GET /reports/technician-performance`
- `GET /reports/inventory-usage`

### 3.11 Notifications
- `GET /notifications` — sent/queued log (for admin visibility/debugging)
- `POST /notifications/test` — send a test notification (Owner/Manager, for setup verification)

### 3.12 Audit Logs
- `GET /audit-logs` — paginated, filterable (`?entityType=`, `?userId=`, `?dateFrom=&dateTo=`) — Owner/Manager only

### 3.13 Search
- `GET /search?q=` — global search across customers (name/phone) and job cards (number/customer name), returns grouped/typed results for the command palette

---

## 4. Business Rules — Job Card State Machine

Allowed transitions (enforced in `jobCards.stateMachine.ts`, rejected with `409 Conflict` if violated):

```
received        → diagnosed, cancelled
diagnosed       → in_progress, awaiting_parts, cancelled
in_progress     → awaiting_parts, ready, cancelled
awaiting_parts  → in_progress, cancelled
ready           → delivered, in_progress (reopened)
delivered       → (terminal — no further transitions)
cancelled       → (terminal)
```

Each transition automatically:
1. Appends an entry to `statusHistory`
2. Writes an `auditLogs` entry
3. Triggers a notification dispatch if the new status is customer-facing (`ready`, `delivered`) or if notifications are configured for all status changes (plan-dependent)

---

## 5. Error Handling

Standard error response shape:
```json
{
  "error": {
    "code": "JOB_CARD_INVALID_TRANSITION",
    "message": "Cannot move a job card from 'delivered' to 'in_progress'.",
    "details": {}
  }
}
```
- HTTP status codes used conventionally: 400 (validation), 401 (unauthenticated), 403 (unauthorized/wrong role or tenant), 404 (not found or cross-tenant — same response for both, to avoid leaking existence of other tenants' data), 409 (conflict/invalid state transition), 422 (semantic validation failure), 429 (rate limited), 500 (unhandled)
- All errors pass through a central `errorHandler` middleware; unhandled exceptions are logged with Sentry and return a generic 500 body (no stack traces to the client in production)

---

## 6. Pagination, Filtering, Sorting, Searching
- **Pagination:** `?page=1&limit=25` (offset-based, MVP) with response envelope `{ data: [...], meta: { total, page, limit, totalPages } }`; migrate high-volume endpoints (`job-cards`, `notifications`, `audit-logs`) to cursor-based (`?cursor=...`) post-MVP as data volume grows
- **Filtering:** query params map directly to indexed fields (see Document 2 index list) — never allow arbitrary unindexed filters on large collections without review
- **Sorting:** `?sortBy=createdAt&sortOrder=desc` (default), whitelisted sortable fields per endpoint
- **Searching:** text search via MongoDB text indexes (`customers.name`, `jobCards.jobCardNumber`) for MVP; consider a dedicated search service (e.g., Meilisearch/Algolia) if search relevance/performance becomes a bottleneck at scale

---

## 7. File Upload
- Client uploads directly to S3-compatible storage via a pre-signed URL (`POST /uploads/presign` returns a signed PUT URL) — avoids routing large files through the API server
- Accepted types: images (jpg/png/webp, max 10MB), documents (pdf, max 15MB)
- Uploaded file metadata (URL, type, uploader, timestamp) saved to the relevant `jobCards.attachments` array only after the client confirms successful upload

---

## 8. Notifications & Webhooks
- `notification.dispatcher.ts` is the single entry point for all outbound notifications; it selects the channel (SMS/WhatsApp/email) based on org settings and customer preference, and writes a `notifications` record before and after send attempt
- Delivery status webhooks from Twilio/WhatsApp provider hit `POST /webhooks/notifications/:provider` to update `notifications.status` (sent → delivered/failed)
- Payment gateway webhooks (`POST /webhooks/billing/:provider`) update `organizations.planStatus` on subscription events (payment succeeded/failed, subscription canceled)
- All webhook endpoints verify provider signatures before processing (reject unsigned/invalid requests with 401)

---

## 9. Rate Limiting & Caching
- Rate limiting: per-IP for `/auth/*` (5 requests/min on login to slow brute force), per-organization token bucket for general API usage (plan-dependent limits, e.g., higher ceiling for Enterprise)
- Caching: short-TTL (30–60s) in-memory or Redis cache for expensive read-heavy endpoints (dashboard KPIs, reports) to avoid recomputing on every page load; job card writes invalidate the relevant org's cached dashboard data

---

## 10. Logging & Monitoring
- Structured JSON request logging (method, path, status, duration, userId, organizationId) via a request-logging middleware, shipped to a log aggregator (or stdout captured by hosting platform at MVP stage)
- Sentry for exception tracking with `organizationId`/`userId` tags for faster debugging of tenant-specific issues
- Background jobs (`notificationRetry`, `lowStockAlert`) log start/completion/failure explicitly, since they run outside the request/response cycle

---

## 11. Security Checklist (OWASP-aligned)
- All secrets in environment variables, validated at boot via a zod schema (`config/env.ts`) — fail fast if misconfigured, never fall back to defaults for secrets
- Input validation on every endpoint (Zod or Joi schemas in `*.validation.ts` files) — reject before hitting the service layer
- Mongoose query construction only via the ODM's query builder (never raw string interpolation) to prevent NoSQL injection
- HTTPS enforced at the load balancer/CDN level; HSTS header set
- Password reset tokens: single-use, short expiry (30 min), hashed at rest
- CORS restricted to known frontend origins (no wildcard `*` in production)
- Helmet.js (or equivalent) for standard security headers
- Dependency vulnerability scanning (`npm audit` / Dependabot) in CI

---

## 12. Data Backup & GDPR/Compliance Readiness
- Daily automated MongoDB Atlas backups, 30-day point-in-time recovery minimum
- `DELETE` operations on customer/user data are soft-deletes with a scheduled hard-delete job (respecting a configurable retention window) to support "right to be forgotten" requests without breaking historical invoice/audit referential integrity
- Data export endpoint (`GET /organizations/me/export`) for an org to download all their data (customers, job cards, invoices) as JSON/CSV — supports both compliance and reduces lock-in anxiety for prospective customers

---

## 13. Future Microservices Consideration
At MVP and through Phase 3 (Document 1 roadmap), a monolith is correct — it minimizes operational overhead for a solo/small team. Split candidates if/when scale demands it:
- **Notification service** (SMS/WhatsApp dispatch + retry logic) — natural first extraction, since it has different scaling/reliability characteristics (queue-driven) than the core CRUD API
- **Reporting/analytics service** — if live aggregation queries start impacting core API performance, move to a separate service reading from a replica or materialized views
- **Billing service** — isolate Stripe/Razorpay webhook handling and subscription logic if Enterprise-tier custom billing logic grows complex
