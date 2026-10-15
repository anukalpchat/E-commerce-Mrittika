# Mrittika

A multi-vendor marketplace for verified sustainable goods, built for the E-Commerce lab (MBA.Tech IT, Sem VII).
Team: Soham Sawant (A052), Anukalp Chaturvedi (A007), Shubham Murkunde (F025).

Build plan and task queue: [PLAN.md](PLAN.md).

## Stack

- Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- Backend: Next.js route handlers under `app/api/`
- Database: SQLite through Node's built-in `node:sqlite` — no database server to install

## Setup

Requires **Node.js 22.13 or newer** (for `node:sqlite`). Check with `node -v`.

```bash
npm install
cp .env.example .env.local   # optional; defaults work locally
npm run dev                  # http://localhost:3000
```

The database file `data/mrittika.db` and its tables are created automatically on the first API request.
To start from a clean database, stop the server and delete the `data/` folder.

Node prints `ExperimentalWarning: SQLite is an experimental feature` on startup. It is expected and harmless.

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_PATH` | No | `./data/mrittika.db` | Location of the SQLite file (uploaded photos go in `uploads/` beside it) |
| `SEED_DEMO_ACCOUNTS` | No | unset | Set to `true` to create the demo logins when `NODE_ENV=production` |
| `NEXT_DIST_DIR` | No | `.next` | Build folder; the test server uses `.next-test` |
| `DEMO_SHOW_RESET_LINKS` | No | unset | Set to `true` to show password-reset links on screen when `NODE_ENV=production` (there is no email service) |

## Tests

Integration tests run against a separate test server, so they never touch your `npm run dev` data:

```bash
npm run test:server   # terminal 1: port 3100, fresh database in data/test/, build output in .next-test/
npm test              # terminal 2
```

It is safe to keep `npm run dev` running at the same time.

## Demo accounts

Created automatically on first start (not in production unless `SEED_DEMO_ACCOUNTS=true`):

| Role | Email | Password | Opens |
|---|---|---|---|
| Admin | `admin@mrittika.test` | `MrittikaAdmin@2026` | `/admin` |
| Vendor (Aranya Botanicals) | `vendor@mrittika.test` | `AranyaVendor@2026` | `/vendor/dashboard` |

Buyers register themselves at `/auth?tab=register`.

The catalogue (30 products from 25 vendors) is seeded into the database from `lib/products.ts`. Products added to that file later are inserted automatically on the next request; existing rows are never overwritten.

Product photos are illustrative stock images. The 16 added in the catalogue expansion come from openly licensed collections; their sources and licences are in `lib/image-credits.ts` and shown under each photo.

## Payment

Payment is **simulated**. No gateway is called and no money moves. The payment modal has a *Demo outcome* switch (succeeds / fails); closing it cancels the order. Card details typed into it never leave the browser; only a label such as `UPI · name@upi` is stored on the order.

To try it: add a product to the cart → `/checkout` → sign in → fill the address → tick the T&C box → *Place Order & Pay*.

## Pages

| Page | Route | Status |
|---|---|---|
| Home | `/` | Working |
| Shop (catalogue) | `/categories` | Working: products read from the database (client-side filters) |
| Product detail | `/product/[slug]` | Working |
| Cart | `/cart` | Working (stored in the browser) |
| Checkout | `/checkout` | **Working**: sign-in required, saved addresses, T&C consent logged, simulated payment (success / fail / cancel) |
| Order tracking & invoice | `/orders/[id]` | **Working**: stored order, status timeline, printable GST invoice, cancel-before-dispatch with stock return (`/order-confirmation` redirects here) |
| Sign in / Register | `/auth` | **Working**: server-side accounts, sessions, separate T&C and Privacy consent checkboxes (both logged), forgot-password link |
| Account | `/account` | **Working**: profile, orders, addresses, wishlist, consent records (`/profile` redirects here) |
| Impact dashboard | `/account/impact` | **Working**: totals from paid orders; per-product figures are labelled estimates |
| Vendor registration | `/vendor/register` | **Working**: application with GSTIN check and T&C consent; shows review status |
| Vendor dashboard | `/vendor/dashboard` | **Working**: products (add/edit with photo upload, sent for review), orders (mark shipped/delivered), payouts statement (10% commission) |
| Admin | `/admin` | **Working**: approve/reject/suspend vendors, review and score products, all orders, support & grievance queue with 48 h / 30 day deadlines, consent log, users |
| Search & Shop by Impact | `/search` | **Working**: text search across name, materials, tags, certifications and vendor; impact, category and score filters; shareable URLs |
| Sustainability guide | `/sustainability` | **Working**: scoring method (4 weighted pillars, score bands, min. 60 to list), certifications glossary, live platform impact totals |
| Journal | `/journal`, `/journal/[slug]` | **Working**: 4 articles with linked products |
| About | `/about` | **Working**: mission, marketplace model, values, team; live catalogue stats |
| Contact & FAQ | `/contact` | **Working**: contact/grievance form creating tickets (admin *Support & Grievances* tab, customer *Support Tickets* tab), Grievance Officer box, buyer and vendor FAQ |
| Terms & Conditions | `/terms` | Final text; Grievance Officer details are fictional demo values |
| Disclaimer | `/disclaimer` | Final text |
| Privacy Policy | `/privacy` | **Final text** (DPDP-aligned, describes what the code actually stores) |
| Shipping, Returns & Refunds | `/returns-shipping` | **Final text** |
| Reset password | `/auth/reset` | **Working**: single-use 30-minute link; shown on screen in development because there is no email service |
| 404 / error | any unknown URL | Custom pages with search and support links |

## Security notes

- Vendor and admin pages and APIs check the role on the server; buyers get 403 / an "Admins only" page.
- Uploaded photos are checked by their file signature (JPEG/PNG/WebP only, 2 MB max), stored under random names and served with `nosniff`.
- Product prices, stock and sustainability scores are always read from the database on the server; vendors cannot set their own score.

- Passwords are hashed with scrypt and a per-user random salt; plaintext is never stored or logged.
- Sessions use a random 256-bit token in an `HttpOnly`, `SameSite=Lax` cookie (`Secure` in production). Only the token's SHA-256 hash is stored, so a leaked database cannot be used to log in.
- Login returns the same error for unknown emails and wrong passwords, and spends equal hashing time on both. After 5 failures for an email from one IP, sign-in is blocked for 15 minutes (in-memory counter, per server process).
- Password-reset tokens are random, stored only as hashes, single-use, expire in 30 minutes, and resetting signs the account out everywhere.
- Every response carries `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, a strict `Referrer-Policy` and a `Permissions-Policy`; production also sends HSTS.
- Terms and Privacy acceptance are enforced on the server as well as in the form, and stored in the `consents` table with user ID, policy, version, context, timestamp, IP and user agent.

## Demo walkthrough (for the viva)

1. **Buyer:** register at `/auth?tab=register` (two unchecked consent boxes) → add products → `/checkout` → place the order → choose *Payment fails*, then *Try again* with *Payment succeeds* → order page with timeline and GST invoice → `/account/impact`.
2. **Search:** `/search?impact=water`, or search “GOTS” or “Kerala”.
3. **Vendor:** sign in as `vendor@mrittika.test` → `/vendor/dashboard` → mark the new order shipped and delivered → *Payouts* shows the 10% commission.
4. **New vendor:** register another account → `/vendor/register` → apply → as admin, approve in `/admin?tab=vendors` → the new vendor adds a product with a photo → as admin, score it in `/admin?tab=products` → it appears in the shop.
5. **Grievance:** send a *Formal grievance* from `/contact` → it appears at the top of `/admin?tab=support` with its 48-hour deadline → resolve it with a note → the customer sees the resolution under *Support Tickets*.
6. **Compliance evidence:** `/admin?tab=consents` lists every Terms and Privacy acceptance with version, context, time and IP.

## Demo data notes

- The Grievance Officer's name, phone and office address are fictional (set in `lib/legal.ts`) and labelled as such on the site.
- Vendors and products are realistic but fictional; product photos are illustrative stock images.
