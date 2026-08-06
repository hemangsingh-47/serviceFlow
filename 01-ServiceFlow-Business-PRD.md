# ServiceFlow — Business PRD
**Document 1 of 5 — Business, Market, Users, Pricing, Roadmap**
**Category:** B2B SaaS for repair & service businesses (car/bike workshops, mobile/laptop repair, AC/appliance/electronics/TV repair)

---

## 1. Executive Summary

### 1.1 Problem Statement
Repair and service businesses — from single-technician mobile repair shops to multi-branch car workshops — run their entire operation on a patchwork of Excel sheets, WhatsApp threads, paper job cards, and verbal handoffs. This causes:
- Lost or duplicated job cards
- No single source of truth for repair status (customer calls to ask "is it ready?")
- Manual, error-prone invoicing and payment tracking
- No visibility into technician workload or inventory levels
- Zero historical data for repeat customers or recurring service patterns
- No way to text/notify a customer automatically when their device/vehicle is ready

### 1.2 Business Opportunity
Repair/service SMBs are a large, underserved vertical. Unlike retail (Shopify) or restaurants (Toast), there is no dominant "vertical OS" for repair shops. Existing tools are either generic field-service software (too broad, not workflow-specific) or expensive legacy shop-management desktop software (not cloud, not mobile-first, poor UX). This is a Shopify-for-repair-shops opportunity: a focused, beautiful, affordable vertical SaaS.

### 1.3 Vision
Every repair and service business in the world runs its day-to-day operations — customers, jobs, inventory, invoicing, and communication — on ServiceFlow.

### 1.4 Mission
Replace Excel, WhatsApp, and paper registers with one simple, powerful, beautiful platform that any shop owner can start using in under 10 minutes.

### 1.5 Success Metrics (North Star + Supporting)
- **North Star:** Number of Job Cards created per week across the platform (proxy for active usage/value delivered)
- Weekly Active Shops (WAS)
- Activation rate: % of signups that create ≥1 job card within 24 hours
- Time-to-first-job-card (target: under 5 minutes from signup)
- Monthly churn rate (target: <3% for paid plans)
- Net Revenue Retention (target: >100% via seat/branch expansion)
- Average Revenue Per Account (ARPA)
- Customer-reported time saved per week (via in-app survey)

### 1.6 Unique Selling Proposition
"The first shop-management platform built like a modern SaaS product — not a legacy desktop tool ported to the web. Set up your shop in minutes, track every job in real time, and let your customers get automatic status updates without you lifting a finger."

---

## 2. Market Research

### 2.1 Target Audience
Primary verticals at launch (chosen for workflow similarity — job intake → diagnosis → repair → parts → invoice → delivery):
- Car workshops / garages
- Bike workshops
- Mobile phone repair shops
- Laptop/computer repair shops
- AC repair & servicing
- Appliance repair (washing machines, refrigerators, etc.)
- Electronics repair (general)
- TV repair

Future expansion: any repair/maintenance business (watch repair, camera repair, musical instrument repair, HVAC, plumbing/electrical service calls).

### 2.2 Customer Persona

**Persona A — "Rakesh," Owner-Operator (Primary)**
- Runs a 2–5 person mobile/electronics repair shop
- Age 28–45, moderately tech-comfortable (uses WhatsApp Business, basic Excel)
- Currently tracks jobs on paper or a WhatsApp group with technicians
- Pain: forgets to call customers when ready, loses track of which parts are pending, can't tell which technician is overloaded
- Buying trigger: a lost job card or an angry customer call causes him to search "shop management app" or ask in a local business WhatsApp group

**Persona B — "Priya," Manager at Multi-Branch Workshop (Secondary)**
- Manages 2–4 branches of a car/bike workshop chain
- Needs cross-branch visibility, employee performance tracking, and consolidated reporting
- Buying trigger: owner asks for a report Priya can't produce from Excel

**Persona C — "Customer" (End User of Customer Portal)**
- Wants to know repair status without calling the shop
- Values SMS/WhatsApp notifications over app downloads

### 2.3 Business Size
- **Micro (1–3 employees):** single-location, owner does everything — largest segment by count
- **Small (4–15 employees):** single or dual location, has a manager/receptionist role
- **Growing/Multi-branch (15+ employees, 2+ locations):** needs role hierarchy, cross-branch reporting — smaller segment but higher ARPA

### 2.4 Pain Points (ranked by frequency in research)
1. No centralized job/status tracking — reliant on memory or paper
2. Manual, inconsistent invoicing (handwritten or ad hoc Excel/Word)
3. No automatic customer notifications — shop staff must call manually
4. Inventory/parts stock not tracked — shops over-order or run out mid-repair
5. No employee accountability — unclear who is responsible for a delayed job
6. No historical customer/device data — can't quickly reference "this is the 3rd time this AC has been serviced"
7. Payment tracking scattered across cash registers, UPI apps, and notebooks

### 2.5 Existing Solutions & Their Weaknesses

| Solution | Type | Weakness |
|---|---|---|
| Excel / Google Sheets | Generic | No workflow, no notifications, no multi-user real-time, error-prone |
| WhatsApp groups | Generic | No structure, no search, jobs get buried, no accountability |
| Paper job cards / registers | Manual | No backup, no analytics, easily lost |
| Legacy desktop shop software (e.g., regional ERP tools) | Vertical, legacy | Old UI, not cloud/mobile, expensive upfront licenses, poor support |
| Generic field-service software (Jobber, ServiceTitan) | Vertical, adjacent | Built for on-site trades (plumbers/electricians), not walk-in repair-shop workflows (job cards, parts-in-shop, device intake); expensive; overbuilt for a 2-person shop |
| Generic CRM/invoicing tools (Zoho, Vyapar) | Generic | Not built around the job-card/repair-status workflow; requires heavy customization |

### 2.6 Competitive Analysis Summary
No competitor combines: (a) repair-specific job card workflow, (b) modern/beautiful UI comparable to Linear/Stripe, (c) affordable per-branch SaaS pricing, and (d) built-in customer notification/portal. This is the market gap ServiceFlow fills.

### 2.7 Market Gap
A vertical-specific, mobile-first, beautifully designed, affordably priced SaaS that treats the **Job Card** as the core object (not a generic "ticket" or "invoice") — matching how repair shop owners already think about their work.

---

## 3. User Roles & Permissions

### 3.1 Roles
1. **Owner** — full access, billing, all branches, all settings
2. **Manager** — full operational access within assigned branch(es), no billing/plan changes
3. **Employee** — general staff access (front desk operations, limited reporting)
4. **Technician** — sees only assigned job cards, updates status/notes, logs parts used
5. **Receptionist** — creates customers/job cards, handles intake and delivery, processes payments, no inventory/employee management
6. **Accountant** — read access to invoices/payments/reports, no job card editing
7. **Customer (Portal)** — view-only access to their own job status, invoice, and history via a magic-link or OTP-based portal (no full account required)

### 3.2 Role Matrix

| Capability | Owner | Manager | Employee | Technician | Receptionist | Accountant | Customer |
|---|---|---|---|---|---|---|---|
| Manage billing/subscription | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage branches | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage employees/roles | ✅ | ✅ (own branch) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create/edit customers | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Create/edit job cards | ✅ | ✅ | ✅ | ❌ (own only) | ✅ | ❌ | ❌ |
| Update job status | ✅ | ✅ | ✅ | ✅ (assigned) | ✅ | ❌ | ❌ (view only) |
| Manage inventory | ✅ | ✅ | ❌ | ❌ (log usage only) | ❌ | ❌ | ❌ |
| Create/send invoices | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ (view) | ❌ (view own) |
| Record payments | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| View reports/analytics | ✅ | ✅ (branch) | ❌ | ❌ | ❌ | ✅ | ❌ |
| View audit logs | ✅ | ✅ (branch) | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Monetization

### 4.1 Plans

**Free (Starter Trial)**
- 1 branch, up to 2 users
- Up to 30 job cards/month
- Basic customer & job card management
- No automated notifications
- ServiceFlow branding on invoices

**Starter — for micro shops**
- Target: $12–15/mo per branch (or local equivalent, e.g., ₹999/mo)
- 1 branch, up to 5 users
- Unlimited job cards
- Manual + automated SMS/WhatsApp status notifications (metered)
- Basic inventory tracking
- Invoicing & payment tracking
- Standard reports

**Professional — for growing/multi-employee shops**
- Target: $35–45/mo per branch (e.g., ₹2,999/mo)
- Everything in Starter, plus:
- Up to 15 users per branch
- Multi-branch support (billed per branch)
- Advanced analytics & custom reports
- Customer portal with branded links
- Role-based permissions (Technician/Accountant roles unlocked)
- Priority support

**Enterprise — for chains**
- Custom pricing
- Unlimited branches & users
- Centralized cross-branch dashboard
- API access
- Dedicated onboarding & support
- SLA & custom integrations

### 4.2 Add-ons (all plans)
- SMS/WhatsApp notification credits (metered, pay-as-you-go beyond plan quota)
- Additional storage for documents/photos beyond plan limit

---

## 5. MVP Scope

### 5.1 Must-Have (MVP)
- Auth (email/password + OTP), single branch
- Owner/Manager/Employee/Technician roles
- Customer management (create, search, history)
- Job Card creation, status tracking (Received → Diagnosed → In Progress → Awaiting Parts → Ready → Delivered)
- Basic inventory (parts list, stock count, deduct on use)
- Invoice generation (from job card) + payment recording (cash/UPI/card, manual entry)
- Manual + automated customer notification on status change (SMS/WhatsApp)
- Basic dashboard (jobs in progress, revenue this month, overdue jobs)
- Search (customers, job cards)

### 5.2 Nice-to-Have (Post-MVP)
- Multi-branch support
- Customer self-service portal
- Advanced reports/analytics with charts
- Employee performance tracking
- Document/photo attachments per job card
- Audit logs
- Dark mode
- Command palette / keyboard shortcuts

### 5.3 Future
- AI-assisted repair estimation
- OCR for parts invoices
- Predictive inventory reordering
- Native mobile apps (iOS/Android)
- Public API / integrations marketplace
- Multi-language support

---

## 6. Roadmap

**Phase 1 (Months 1–3) — MVP Launch**
Single branch, core job card workflow, invoicing, manual notifications, 3 pilot shops onboarded.

**Phase 2 (Months 4–6) — Retention & Core Automation**
Automated status notifications, inventory alerts, basic reporting, customer portal (view-only), first paid conversions.

**Phase 3 (Months 7–9) — Multi-Branch & Team Features**
Multi-branch support, full role matrix (Technician/Accountant/Receptionist), employee performance dashboard, audit logs.

**Phase 4 (Months 10–12) — Scale & Polish**
Advanced analytics, dark mode, command palette, document attachments, referral program, plan upsell flows.

**Phase 5 (Year 2) — Platform Expansion**
Public API, integrations (accounting software, payment gateways), native mobile apps, AI features (smart estimation, OCR), expansion into adjacent verticals (HVAC, plumbing/electrical service calls).

---

## 7. Go-to-Market Notes
- Launch vertical-by-vertical: start with mobile/laptop repair and one of car/bike workshops, where job-card workflows are most similar
- Acquisition channels: local shop-owner WhatsApp/Facebook groups, trade associations, direct outreach/demos, referral incentives (1 free month per referral)
- Land with Free/Starter plan, expand via branch count and notification-credit upsells
