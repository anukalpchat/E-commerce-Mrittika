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
| `DATABASE_PATH` | No | `./data/mrittika.db` | Location of the SQLite file |

## Tests

Integration tests run against a live server:

```bash
npm run dev                               # terminal 1
npm test                                  # terminal 2 (uses http://localhost:3000)
BASE_URL=http://localhost:3111 npm test   # if the server runs elsewhere
```

Tests create throwaway accounts and orders with `@example.test` emails in your local database.

## Test credentials

There are no seeded accounts yet. Create one at `/auth?tab=register`.

## Payment

Payment is **simulated**. No gateway is called and no money moves. The payment modal has a *Demo outcome* switch (succeeds / fails); closing it cancels the order. Card details typed into it never leave the browser; only a label such as `UPI · name@upi` is stored on the order.

To try it: add a product to the cart → `/checkout` → sign in → fill the address → tick the T&C box → *Place Order & Pay*.

## Pages

| Page | Route | Status |
|---|---|---|
| Home | `/` | Working |
| Shop (catalogue) | `/categories` | Working (client-side filters) |
| Product detail | `/product/[slug]` | Working |
| Cart | `/cart` | Working (stored in the browser) |
| Checkout | `/checkout` | **Working**: sign-in required, saved addresses, T&C consent logged, simulated payment (success / fail / cancel) |
| Order tracking & invoice | `/orders/[id]` | **Working**: stored order, status timeline, printable GST invoice (`/order-confirmation` redirects here) |
| Sign in / Register | `/auth` | **Working**: server-side accounts, sessions, T&C consent log |
| Account | `/account` | **Working**: profile, orders, addresses, wishlist, consent records (`/profile` redirects here) |
| Impact dashboard | `/account/impact` | **Working**: totals from paid orders; per-product figures are labelled estimates |
| Vendor registration | `/vendor/register` | Placeholder |
| Vendor dashboard | `/vendor/dashboard` | Placeholder |
| Admin | `/admin` | Placeholder |
| Search | `/search` | Placeholder |
| Sustainability guide | `/sustainability` | Placeholder |
| Journal | `/journal` | Placeholder (stretch goal) |
| About | `/about` | Placeholder |
| Contact & FAQ | `/contact` | Placeholder |
| Terms & Conditions | `/terms` | Final text; Grievance Officer details still placeholders |
| Disclaimer | `/disclaimer` | Final text |
| Privacy Policy | `/privacy` | Pending draft |

## Security notes

- Passwords are hashed with scrypt and a per-user random salt; plaintext is never stored or logged.
- Sessions use a random 256-bit token in an `HttpOnly`, `SameSite=Lax` cookie (`Secure` in production). Only the token's SHA-256 hash is stored, so a leaked database cannot be used to log in.
- Login returns the same error for unknown emails and wrong passwords, and spends equal hashing time on both.
- Terms acceptance is enforced on the server as well as in the form, and stored in the `consents` table with user ID, policy version, context, timestamp, IP and user agent.
