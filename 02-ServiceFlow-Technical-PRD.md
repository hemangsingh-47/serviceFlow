# ServiceFlow — Technical PRD
**Document 2 of 5 — System Architecture, Database Design, API Requirements**

This document is the system-level technical spec. Backend implementation detail (endpoint-by-endpoint, folder structure) lives in Document 4 (Backend PRD). Frontend implementation detail lives in Document 5 (Frontend PRD).

---

## 1. System Overview

ServiceFlow is a multi-tenant B2B SaaS. Each customer signup creates an **Organization** (a shop or shop-chain), which owns one or more **Branches**, **Users**, **Customers**, **Job Cards**, **Inventory Items**, and **Invoices**. All data is scoped to an Organization; Branch is a secondary scoping dimension within an Organization.

### 1.1 High-Level Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Web Frontend    │      │   REST API        │      │   Database        │
│   React SPA       │◄────►│   Node.js/Express  │◄────►│   MongoDB          │
│   (Vite)           │ HTTPS│   (or NestJS)      │      │   (Atlas)          │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │  File Storage  │ │  SMS/WhatsApp  │ │  Payment       │
            │  (S3-compatible)│ │  Gateway       │ │  Gateway       │
            │  Cloudinary/S3  │ │  (Twilio/      │ │  (Stripe/      │
            │                 │ │   Gupshup)      │ │   Razorpay)     │
            └──────────────┘ └──────────────┘ └──────────────┘
```

### 1.2 Multi-Tenancy Model
- **Approach:** Shared database, shared schema, with `organizationId` on every tenant-scoped document/collection (row-level isolation, not separate DBs per tenant — appropriate at this scale and simplifies migrations/reporting).
- Every query MUST filter by `organizationId`; enforced at the data-access layer (middleware injects `organizationId` from the authenticated JWT into every query), not left to individual route handlers to remember.
- `branchId` is a secondary filter within an organization for multi-branch orgs.

### 1.3 Data Isolation & Security Boundary
- JWT payload contains `userId`, `organizationId`, `role`, and `branchIds[]` (branches the user has access to).
- All API middleware validates that the requested resource's `organizationId` matches the JWT's `organizationId` before returning data — a cross-tenant data leak is treated as a Sev-1 bug class.

---

## 2. Database Design

**Database:** MongoDB (Atlas). Document-oriented model fits the semi-structured, evolving nature of job cards (different fields per vertical — vehicle vs. device vs. appliance) better than rigid relational schemas, while still allowing structured queries/indexes.

### 2.1 Collections Overview
1. `organizations`
2. `branches`
3. `users`
4. `customers`
5. `assets` (vehicles/devices — polymorphic per vertical)
6. `jobCards`
7. `inventoryItems`
8. `inventoryTransactions`
9. `invoices`
10. `payments`
11. `notifications`
12. `auditLogs`

### 2.2 Schema Definitions

#### `organizations`
```
{
  _id: ObjectId,
  name: String,
  vertical: String,          // enum: car_workshop, bike_workshop, mobile_repair, laptop_repair,
                              //       ac_repair, appliance_repair, electronics_repair, tv_repair, other
  plan: String,               // free | starter | professional | enterprise
  planStatus: String,         // active | past_due | canceled | trialing
  billingCycleAnchor: Date,
  ownerId: ObjectId (ref: users),
  settings: {
    currency: String,
    timezone: String,
    invoicePrefix: String,
    jobCardPrefix: String,
    notificationChannels: [String]  // sms, whatsapp, email
  },
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ _id: 1 }` (default), `{ ownerId: 1 }`

#### `branches`
```
{
  _id: ObjectId,
  organizationId: ObjectId (ref: organizations),
  name: String,
  address: String,
  phone: String,
  isActive: Boolean,
  createdAt: Date
}
```
Indexes: `{ organizationId: 1 }`

#### `users`
```
{
  _id: ObjectId,
  organizationId: ObjectId,
  branchIds: [ObjectId],       // branches this user can access
  name: String,
  email: String (unique per org),
  phone: String,
  passwordHash: String,
  role: String,                 // owner | manager | employee | technician | receptionist | accountant
  isActive: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ organizationId: 1, email: 1 }` (unique compound), `{ organizationId: 1, role: 1 }`

#### `customers`
```
{
  _id: ObjectId,
  organizationId: ObjectId,
  branchId: ObjectId,
  name: String,
  phone: String,                // primary identifier for lookups/notifications
  email: String,
  address: String,
  notes: String,
  tags: [String],
  totalJobsCount: Number,        // denormalized for quick display
  totalSpend: Number,             // denormalized
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ organizationId: 1, phone: 1 }`, `{ organizationId: 1, name: "text" }` (search)

#### `assets` (vehicle/device — polymorphic)
```
{
  _id: ObjectId,
  organizationId: ObjectId,
  customerId: ObjectId (ref: customers),
  type: String,                  // vehicle | device | appliance
  category: String,              // car, bike, mobile, laptop, ac, fridge, tv, etc.
  attributes: {                  // flexible per-category fields
    make: String,
    model: String,
    year: Number,
    registrationNumber: String,  // vehicles
    imeiOrSerialNumber: String,  // devices/appliances
    color: String
  },
  createdAt: Date
}
```
Indexes: `{ organizationId: 1, customerId: 1 }`

#### `jobCards` (core object)
```
{
  _id: ObjectId,
  organizationId: ObjectId,
  branchId: ObjectId,
  jobCardNumber: String,          // human-readable, sequential per org (e.g., JC-2026-0001)
  customerId: ObjectId,
  assetId: ObjectId,
  assignedTechnicianId: ObjectId,
  status: String,                  // received | diagnosed | in_progress | awaiting_parts | ready | delivered | cancelled
  priority: String,                // low | normal | urgent
  problemDescription: String,
  diagnosisNotes: String,
  estimatedCost: Number,
  estimatedCompletionDate: Date,
  partsUsed: [{
    inventoryItemId: ObjectId,
    quantity: Number,
    unitCost: Number
  }],
  laborCharges: [{
    description: String,
    amount: Number
  }],
  attachments: [{
    url: String,
    type: String,                  // image | document
    uploadedBy: ObjectId,
    uploadedAt: Date
  }],
  statusHistory: [{
    status: String,
    changedBy: ObjectId,
    changedAt: Date,
    note: String
  }],
  invoiceId: ObjectId,             // set once invoiced
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  deliveredAt: Date
}
```
Indexes: `{ organizationId: 1, branchId: 1, status: 1 }`, `{ organizationId: 1, jobCardNumber: 1 }` (unique compound), `{ organizationId: 1, customerId: 1 }`, `{ organizationId: 1, assignedTechnicianId: 1, status: 1 }`

#### `inventoryItems`
```
{
  _id: ObjectId,
  organizationId: ObjectId,
  branchId: ObjectId,
  name: String,
  sku: String,
  category: String,
  unitCost: Number,
  sellingPrice: Number,
  quantityInStock: Number,
  reorderThreshold: Number,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ organizationId: 1, branchId: 1, sku: 1 }`, `{ organizationId: 1, quantityInStock: 1 }` (for low-stock queries)

#### `inventoryTransactions`
```
{
  _id: ObjectId,
  organizationId: ObjectId,
  inventoryItemId: ObjectId,
  jobCardId: ObjectId,             // null if manual adjustment/restock
  type: String,                     // usage | restock | adjustment
  quantity: Number,                 // negative for usage
  performedBy: ObjectId,
  createdAt: Date
}
```
Indexes: `{ organizationId: 1, inventoryItemId: 1, createdAt: -1 }`

#### `invoices`
```
{
  _id: ObjectId,
  organizationId: ObjectId,
  branchId: ObjectId,
  invoiceNumber: String,
  jobCardId: ObjectId,
  customerId: ObjectId,
  lineItems: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: Number,
  taxAmount: Number,
  discountAmount: Number,
  totalAmount: Number,
  amountPaid: Number,
  status: String,                    // draft | sent | partially_paid | paid | void
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```
Indexes: `{ organizationId: 1, invoiceNumber: 1 }` (unique compound), `{ organizationId: 1, customerId: 1 }`, `{ organizationId: 1, status: 1 }`

#### `payments`
```
{
  _id: ObjectId,
  organizationId: ObjectId,
  invoiceId: ObjectId,
  amount: Number,
  method: String,                     // cash | card | upi | bank_transfer | online
  reference: String,
  recordedBy: ObjectId,
  paidAt: Date,
  createdAt: Date
}
```
Indexes: `{ organizationId: 1, invoiceId: 1 }`

#### `notifications`
```
{
  _id: ObjectId,
  organizationId: ObjectId,
  jobCardId: ObjectId,
  customerId: ObjectId,
  channel: String,                     // sms | whatsapp | email
  event: String,                        // status_changed | job_ready | invoice_sent | payment_received
  status: String,                       // queued | sent | delivered | failed
  content: String,
  sentAt: Date,
  createdAt: Date
}
```
Indexes: `{ organizationId: 1, jobCardId: 1 }`, `{ status: 1, createdAt: 1 }` (for retry queue)

#### `auditLogs`
```
{
  _id: ObjectId,
  organizationId: ObjectId,
  userId: ObjectId,
  action: String,                       // e.g., "jobCard.statusChanged", "invoice.created"
  entityType: String,
  entityId: ObjectId,
  metadata: Object,
  createdAt: Date
}
```
Indexes: `{ organizationId: 1, createdAt: -1 }`, `{ organizationId: 1, entityType: 1, entityId: 1 }`

### 2.3 Relationships Summary
- Organization 1—N Branches
- Organization 1—N Users
- Branch 1—N Customers, Job Cards, Inventory Items
- Customer 1—N Assets, 1—N Job Cards
- Job Card N—1 Customer, N—1 Asset, N—1 Technician (User), 1—1 Invoice (optional)
- Invoice 1—N Payments
- Inventory Item 1—N Inventory Transactions

### 2.4 Data Validation Rules (Schema Level)
- `jobCardNumber` and `invoiceNumber` generated atomically per-org via a counters collection (`{ organizationId, sequenceName }`) to avoid collisions under concurrent writes.
- `status` transitions on `jobCards` are validated against an allowed state-transition map (see Document 4, Business Rules) — invalid transitions rejected at the API layer, not just the UI.
- Monetary fields stored as integers in minor currency units (e.g., paise/cents) to avoid floating-point rounding errors.

### 2.5 Future Scalability Considerations
- Collections like `jobCards`, `notifications`, and `auditLogs` will grow fastest — plan for time-based archival (e.g., move job cards older than 3 years to a cold-storage collection) once volume justifies it.
- If a single organization's data grows very large (e.g., an enterprise chain), consider moving to per-tenant sharding on `organizationId` in MongoDB Atlas at that scale — not needed at MVP.
- Read-heavy reporting queries should eventually move to a read replica or a periodic aggregation/materialized-view collection (e.g., `dailyBranchStats`) rather than computing analytics live from `jobCards` at scale.

---

## 3. API Requirements (System-Level)

Detailed endpoint list lives in Document 4 (Backend PRD). At the system level:

- **Style:** REST, JSON, versioned under `/api/v1/`
- **Auth:** JWT bearer tokens (access + refresh token pattern)
- **Tenant scoping:** every authenticated request resolves `organizationId` from the JWT; never accepted as a client-supplied parameter for data access
- **Pagination:** cursor-based for high-volume lists (job cards, notifications, audit logs); offset-based acceptable for small/bounded lists (branches, inventory categories)
- **Idempotency:** POST endpoints that create financial records (invoices, payments) accept an `Idempotency-Key` header to prevent duplicate submissions on retry

---

## 4. Technical Stack

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | React (Vite), TypeScript | Fast dev server, strong ecosystem, matches MERN skillset |
| State Management | React Query (server state) + Zustand (UI state) | Avoids over-engineering with Redux for this scope |
| Backend | Node.js + Express (or NestJS for stronger structure) | Matches MERN skillset; NestJS worth it if team grows |
| Database | MongoDB Atlas | Flexible schema fits polymorphic assets/job cards; managed hosting |
| File Storage | AWS S3 or Cloudinary | Job card photo/document attachments |
| Notifications | Twilio (SMS) + WhatsApp Cloud API or Gupshup | Automated status notifications |
| Payments | Stripe (global) / Razorpay (India) | Subscription billing for SaaS plans |
| Deployment | Backend: Render/Railway/AWS ECS; Frontend: Vercel/Netlify | Fast iteration for MVP, scalable later |
| Monitoring | Sentry (errors) + basic uptime monitoring | Early-stage observability |
| Analytics (product) | PostHog or Mixpanel | Track activation/engagement metrics from Doc 1 |

---

## 5. Non-Functional Requirements
- **Availability target:** 99.5% (MVP), 99.9% post-Phase 3
- **Response time:** p95 API response <400ms for standard CRUD; job card list/search <800ms at 10K+ records per org
- **Data retention:** indefinite for financial records (invoices/payments) per typical accounting compliance; job cards retained indefinitely unless org requests deletion
- **Backup:** automated daily MongoDB Atlas backups, 30-day retention minimum
- **Scalability target:** system should comfortably support 5,000 organizations / 50,000 users / 1M job cards without architecture changes beyond adding read replicas and indexes
