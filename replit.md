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

## Smarketing CRM App

### Overview
Enterprise Revenue CRM + Smarketing Operating System. Unifies Meta Ads → Lead Capture → Messaging → Qualification → Sales → Demo → Signup → Activation → Paid.

### Features
- 10-role RBAC (super_admin, admin, sales_manager, sales_rep, marketing_manager, marketing_specialist, support_manager, support_agent, account_manager, viewer)
- 16 frontend pages: login, dashboard, leads (list/detail/new), contacts, companies, opportunities, pipeline (kanban drag-drop), tasks, inbox (list+conversation), campaigns, workflows, settings (index/users/kpis/funnel)
- Omnichannel inbox (WhatsApp/Messenger/Instagram)
- AI lead scoring endpoint
- Bilingual AR/EN support in layout
- Dynamic funnel stages, pipelines, KPI definitions (zero-code admin)

### Architecture
- **Frontend**: React + Vite artifact at `artifacts/crm` (port from PORT env, proxies /api → :8080)
- **Backend**: Express API server at `artifacts/api-server` (port 8080)
- **Database**: PostgreSQL via Drizzle ORM, schema at `lib/db/src/schema/`
- **API Client**: Generated React Query hooks at `lib/api-client-react/src/generated/api.ts`

### Demo Credentials
- Admin: admin@smarketing.com / admin123
- Sales Rep: sarah@smarketing.com / sarah123

### Key Type Notes
- `LeadsListResponse` wraps `{ leads: Lead[], total, page, limit }` — not a plain array
- All other list endpoints (`listCompanies`, `listContacts`, `listOpportunities`, etc.) return arrays directly
- Hooks with params: `useListUsers(params?, options?)` — params first, options second
- Hooks without required params: `useListCampaigns(undefined, options)` pattern
- `FunnelStage` uses `name`, `position` (not `stageName`, `order`)
- `KpiDefinition` uses `name`, `timeAggregation` (not `kpiName`, `frequency`)
- `PipelineBoardStage` uses `stageId`, `stageName` (not `id`, `name`)
- `Campaign` type only has minimal fields; use `as any` for extended DB fields
