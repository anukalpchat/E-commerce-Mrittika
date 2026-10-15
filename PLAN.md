# Mrittika — Build Plan

Single source of truth for what is left to build. Tick items as they land; each task is one commit.

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
| Journal | Cut from the 15; stretch goal only | No commerce or lab-manual value |

## Final 15 pages

| # | Page | Route | Status |
|---|---|---|---|
| 1 | Home | `/` | Working |
| 2 | Shop — catalogue, search, Shop by Impact | `/categories` (+ `/search` redirect) | Working (client-side); search to add |
| 3 | Product detail | `/product/[slug]` | Working |
| 4 | Cart | `/cart` | Working |
| 5 | Checkout + mock payment | `/checkout` | Partial |
| 6 | Order confirmation & tracking | `/orders/[id]` | Stub |
| 7 | Sign in / Register / Reset | `/auth` | Placeholder |
| 8 | Account — profile, orders, addresses, wishlist | `/account` (`/profile` redirects) | Placeholder |
| 9 | Impact dashboard | `/account/impact` | Placeholder |
| 10 | Vendor registration | `/vendor/register` | Placeholder |
| 11 | Vendor dashboard | `/vendor/dashboard` | Placeholder |
| 12 | Admin panel | `/admin` | Placeholder |
| 13 | Sustainability guide / Our Impact | `/sustainability` | Placeholder |
| 14 | About | `/about` | Placeholder |
| 15 | Contact & FAQ | `/contact` | Placeholder |

Supporting (outside the 15): Terms, Privacy, Disclaimer, Returns & Shipping, Grievance (section of Terms), 404.

## Build queue

Effort: S = under an hour, M = a few hours, L = most of a day.

- [x] **T1 — Auth + consent foundation (L).** SQLite layer, users/sessions/consents tables, register/login/logout/me API, `/auth` page with unchecked T&C checkbox that blocks submit (client and server), consent row with user ID, timestamp and policy version, header shows signed-in state, consent records visible after sign-up.
- [ ] **T2 — Privacy Policy + Returns & Shipping policy (M).** Draft final text (DPDP Act 2023 notice items, retention, rights, grievance contact), cookie/data notice banner, add privacy consent at registration once the policy exists.
- [ ] **T3 — Server-side orders + checkout consent (L).** Orders and order_items tables, server recomputes prices from the catalogue (never trusts client totals), GST breakdown, checkout requires sign-in, T&C consent recorded with context `checkout`, mock payment labelled as simulation, success/failed/cancelled outcomes stored on the order.
- [ ] **T4 — Order confirmation, tracking and invoice (M).** `/orders/[id]` reads the stored order (no more query-string totals), status timeline, printable GST invoice with seller details and country of origin.
- [ ] **T5 — Account page (M).** Profile edit, order history, saved addresses (used at checkout), wishlist (heart on product cards/detail).
- [ ] **T6 — Impact dashboard (M).** Per-product impact metrics in the catalogue (plastic avoided, water saved, waste diverted), totals computed from the user's paid orders, empty state for no orders.
- [ ] **T7 — Password reset (S).** Token-based reset. No email service: reset link is shown on screen and labelled as a demo shortcut.
- [ ] **T8 — Vendor onboarding (M).** `/vendor/register` application form (business, GSTIN format check, address, categories, T&C acceptance with context `vendor`), application status.
- [ ] **T9 — Vendor dashboard (L).** Approved vendors manage their products (CRUD with sustainability attributes and country of origin), see orders for their items, payout summary using the commission model (e.g. 12% platform commission — confirm rate).
- [ ] **T10 — Admin panel (L).** Seeded admin account; approve/reject vendors, moderate products, view all orders, **consent log view** (user, policy, version, context, timestamp).
- [ ] **T11 — Catalogue from DB + search (M).** Move seed products into the DB so vendor-added products appear in the shop; text search; merge `/search` into the shop with Shop by Impact filters; vendor verification badges.
- [ ] **T12 — Content pages (M).** Sustainability guide (scoring methodology), About, Contact & FAQ (contact form stored in DB, visible in admin).
- [ ] **T13 — Polish (S–M).** Custom 404 and error pages, loading/empty states, keyboard pass, README completed with page list and credentials.

## Legal requirements tracked

Items marked (A) are assumptions from memory and must be checked against the official text before submission.

- [ ] Consumer Protection (E-Commerce) Rules 2020 (A): seller name/address on listings, country of origin, return/refund/shipping terms, Grievance Officer name + contact with 48-hour acknowledgement and 1-month resolution.
- [ ] DPDP Act 2023 (A): notice before collecting personal data, specific consent, right to withdraw/erase, grievance contact.
- [ ] GST (A): tax-inclusive prices with a breakdown on the invoice.
- [ ] Grievance Officer name and phone are still placeholders in `app/terms/page.tsx` — **team must supply real details.**

## Lab-manual concept → implementation map

| Manual topic | Where it shows up in the site |
|---|---|
| Legal & ethical (ToS, customer data) | T&C click-wrap at register/checkout with stored consent log; Privacy Policy; admin consent log |
| Taxation | GST-inclusive pricing, GST breakdown on invoice |
| Security (threats, assets, countermeasures) | scrypt password hashing, hashed session tokens, HTTP-only cookies, server-side price recomputation, role checks on vendor/admin routes |
| Client–server channel | HTTPS at deployment (host config); `Secure` cookie flag in production |
| Payment systems | Mock gateway flow with success/failure/cancel, card data never sent to the server (stands in for tokenisation) |
| Stakeholder access | Buyer, vendor and admin roles with separate dashboards |
| Catalogue management | Vendor product CRUD + admin moderation |
