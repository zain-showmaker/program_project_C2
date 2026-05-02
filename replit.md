# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## PC Warehouse Pro (artifacts/warehouse)

A dark-themed inventory & sales web app. Features:

- **Auth**: Replit Auth (OIDC). Gated by `<AuthGate>` in `App.tsx`. Header shows user info + logout dropdown.
- **Cost & profit tracking**: Components have `cost`, sales have `unitCost`/`totalCost`. Margin/profit computed in API serializers.
- **Persistent cart**: `usePersistentCart` (localStorage key `pcwh:cart:v1`).
- **Command palette**: `<CommandPalette>` (⌘K) — pages, actions, component search.
- **Bulk select**: Inventory has Select-mode w/ checkboxes + bulk delete.
- **Undo toast**: Single-component delete shows Undo action that re-creates the item.
- **Receipts**: jsPDF-generated PDFs; downloadable per checkout and per recent transaction row.
- **Customer tracking**: Customer name field on Sales checkout, displayed on transactions.
- **Returns**: Per-row return button on Sales transactions; restock + mark `isReturned`.
- **Component photos**: Optional `imageUrl` field on items, used for thumbnail + soft background.
- **Best sellers / Slow movers / Reorder list**: API endpoints + Analytics page sections (urgency-ranked).

## Auth notes

- `lib/replit-auth-web` is a composite library with `vite/client` types (it uses `import.meta.env.BASE_URL`).
- API routes mounted at `/api/auth/user`, `/api/login`, `/api/callback`, `/api/logout`.
