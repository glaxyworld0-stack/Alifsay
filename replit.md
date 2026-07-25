# ALIFSAY — Premium Pakistani Fashion E-commerce

International Pakistani fashion and designer clothing e-commerce store targeting diaspora customers in USA, UK, Canada, UAE, Europe, and Australia.

## Run & Operate

- `pnpm --filter @workspace/alifsay run dev` — run the storefront (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS v4, Framer Motion, Wouter routing
- API: Express 5, cookie-based sessions for cart/wishlist
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `artifacts/alifsay/` — React storefront (all pages and components)
- `artifacts/api-server/` — Express API server
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not hand-edit)
- `lib/api-zod/src/generated/` — generated Zod schemas for server validation
- `lib/db/src/schema/` — Drizzle ORM table definitions

## Product

ALIFSAY sells Pakistani Designer Dresses, Luxury Pret, Formal Wear, Wedding Dresses, Men's Wear, Kids Collection, Islamic Wear, Unstitched Collection, and Accessories to international diaspora customers.

**Pages:** Homepage, Shop/catalog, Category pages, Single product, Cart, Checkout, Order confirmation, Order tracking, Wishlist, My Orders, About, Contact, FAQ, Shipping Policy, Return Policy, Terms, Privacy, Blog, Newsletter, Size Guide, 404

**Features:** Multi-currency (USD/GBP/EUR/CAD/AUD/AED/PKR), session-based cart & wishlist, coupon codes (WELCOME10/ALIFSAY15/EID20/DIASPORA25), AJAX product filters, Quick View modal, cart slide-out drawer, size guide, order tracking

## Architecture decisions

- Cart and wishlist are session-based (cookie `alifsay-session`) — no auth required
- Prices stored as `numeric` strings in DB, converted to numbers in API responses
- CORS configured with `credentials: true` to support session cookies from the frontend
- Product images from Unsplash CDN; fallback to locally generated assets in `src/assets/products/`
- OpenAPI spec gates all frontend/backend contracts — always run codegen after spec changes

## User preferences

_Populate as you build._

## Gotchas

- Run `pnpm run typecheck:libs` after any `lib/*` schema change before running leaf artifact typechecks
- `slug` is auto-generated from `name` if not provided when creating products via API
- Coupon codes are defined server-side in `cart.ts` COUPONS object — add new codes there
- `pnpm --filter @workspace/db run push` must be run after any schema changes before starting the API server
