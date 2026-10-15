# Mrittika — Build Plan

Single source of truth for what was built and what is left. **All build tasks are done.**

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Stack | Next.js 14 (App Router) + TypeScript + Tailwind, already in place | Keep the existing scaffold |
| Backend | Next.js route handlers (`app/api/*`), **only** where data must persist or be trusted: auth, consent, orders, addresses, wishlist, vendor applications, products managed by vendors, admin | Static content and filtering stay client-side |
| Database | SQLite via Node's built-in `node:sqlite` (file at `data/mrittika.db`, gitignored) | Zero new dependencies; real SQL schema to show in the viva. Requires **Node 22.13+** |
| Passwords | `crypto.scrypt` with per-user salt | Built into Node; no dependency |
| Sessions | Random token in an HTTP-only, SameSite=Lax cookie; only its SHA-256 hash is stored server-side | Revocable sessions, token useless if the DB leaks |
| Payment | **Mocked.** No gateway, no server verification. The modal is labelled as a simulation in the UI and code. Card fields never leave the browser | Team decision |
| Legal pages | Counted **outside** the 15 core pages, per `instructions.md` | Assumption — say if wrong |
| Journal | Built after all (4 articles) — it was on the original `instructions.md` list | Supports the lab manual's "building web presence" topic |

## Pages

17 working pages, plus legal and support pages:

| # | Page | Route |
|---|---|---|
| 1 | Home | `/` |
| 2 | Shop (catalogue with filters) | `/categories` |
| 3 | Search & Shop by Impact | `/search` |
| 4 | Product detail | `/product/[slug]` |
| 5 | Cart | `/cart` |
| 6 | Checkout + simulated payment | `/checkout` |
| 7 | Order tracking & invoice | `/orders/[id]` |
| 8 | Sign in / Register / Reset password | `/auth`, `/auth/reset` |
| 9 | My Account (profile, orders, addresses, wishlist, tickets, consents) | `/account` |
| 10 | Impact dashboard | `/account/impact` |
| 11 | Vendor registration | `/vendor/register` |
| 12 | Vendor dashboard | `/vendor/dashboard` |
| 13 | Admin panel | `/admin` |
| 14 | Sustainability guide & Our Impact | `/sustainability` |
| 15 | About | `/about` |
| 16 | Contact & FAQ | `/contact` |
| 17 | Journal (index + articles) | `/journal`, `/journal/[slug]` |

Legal and support: Terms, Privacy Policy, Disclaimer, Shipping/Returns/Refunds, custom 404 and error pages.

## Build queue

Effort: S = under an hour, M = a few hours, L = most of a day.

- [x] **T1 — Auth + consent foundation (L).** SQLite layer, users/sessions/consents tables, register/login/logout/me API, `/auth` page with unchecked T&C checkbox that blocks submit (client and server), consent row with user ID, timestamp and policy version, header shows signed-in state, consent records visible after sign-up.
- [x] **T2 — Privacy Policy + Returns & Shipping policy (M).** Draft final text (DPDP Act 2023 notice items, retention, rights, grievance contact), cookie/data notice banner, add privacy consent at registration once the policy exists.
- [x] **T3 — Server-side orders + checkout consent (L).** Orders and order_items tables, server recomputes prices from the catalogue (never trusts client totals), GST breakdown, checkout requires sign-in, T&C consent recorded with context `checkout`, mock payment labelled as simulation, success/failed/cancelled outcomes stored on the order.
- [x] **T4 — Order confirmation, tracking and invoice (M).** `/orders/[id]` reads the stored order (no more query-string totals), status timeline, printable GST invoice with seller details and country of origin.
- [x] **T5 — Account page (M).** Profile edit, order history, saved addresses (used at checkout), wishlist (heart on product cards/detail).
- [x] **T6 — Impact dashboard (M).** Per-product impact metrics in the catalogue (plastic avoided, water saved, waste diverted), totals computed from the user's paid orders, empty state for no orders.
- [x] **T7 — Password reset (S).** Token-based reset. No email service: reset link is shown on screen and labelled as a demo shortcut.
- [x] **T8 — Vendor onboarding (M).** `/vendor/register` application form (business, GSTIN format check, address, categories, T&C acceptance with context `vendor`), application status.
- [x] **T9 — Vendor dashboard (L).** Approved vendors manage their products (CRUD with sustainability attributes and country of origin), see orders for their items, payout summary using the commission model (10% default, editable per vendor by admin).
- [x] **T10 — Admin panel (L).** Seeded admin account; approve/reject vendors, moderate products, view all orders, **consent log view** (user, policy, version, context, timestamp).
- [x] **T11 — Search (M).** Catalogue in the DB, verification badges, `/search` with text search and Shop by Impact / category / score filters.
- [x] **T12 — Content pages (M).** Sustainability guide (scoring methodology), About, Contact & FAQ (contact form stored in DB, visible in admin).
- [x] **T13 — Polish (S–M).** Custom 404 and error pages, empty states, login rate limiting, security headers, order cancellation before dispatch, Journal, README completed.

## Legal requirements

Items marked (A) were drafted from the team's legal framework doc and general knowledge; check them against the official text before submission.

- [x] Consumer Protection (E-Commerce) Rules 2020 (A): seller name and location on listings, country of origin, shipping/returns/refunds policy, no cancellation fee, grievance mechanism with 48-hour acknowledgement and 30-day resolution tracked in admin, no pre-ticked consent boxes.
- [x] DPDP Act 2023 (A): Privacy Policy with notice items, separate unchecked privacy consent at registration, consent recorded with version, rights and grievance route, informational cookie notice (essential cookie only).
- [x] GST (A): tax-inclusive prices with a GST breakdown and place of supply on the invoice.

## Still needed from the team

- [x] Grievance Officer details — fictional demo values in `lib/legal.ts` (labelled as fictional on the site); replace before any live use.
- [x] Policy numbers (10% commission, 7-day returns, 7-day refunds) kept as set in `lib/legal.ts` and `lib/vendor-shared.ts`.
- [ ] Decide whether `components/PlaceholderPage.tsx` (no longer used by any page) should be deleted.

## Lab-manual concept → implementation map

| Manual topic | Where it shows up in the site |
|---|---|
| Legal & ethical (ToS, customer data, IP) | T&C and Privacy click-wraps at register/checkout/vendor application with stored consent log; Privacy Policy; Returns policy; admin consent log; grievance queue; copyright footer; photo credits |
| Taxation | GST-inclusive pricing, GST breakdown on invoice |
| Security (threats, assets, countermeasures) | scrypt password hashing, hashed session and reset tokens, HTTP-only cookies, login rate limiting, server-side price recomputation, role checks on vendor/admin routes, upload signature checks, security headers (nosniff, frame denial, HSTS in production) |
| Client–server channel | HTTPS at deployment (host config); `Secure` cookie flag in production |
| Payment systems | Mock gateway flow with success/failure/cancel, card data never sent to the server (stands in for tokenisation) |
| Stakeholder access | Buyer, vendor and admin roles with separate dashboards |
| Catalogue management | Vendor product add/edit with photo upload + admin review and scoring |
| Selling on the web (presence, CRM) | Journal content, Shop by Impact search, wishlist, impact dashboard, support tickets |
