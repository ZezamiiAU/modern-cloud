# Partner Portal — Implementation Plan

> Status: **Plan** (scaffold merged; production not yet started)
> Branch: `claude/partner-portal-role-vqyp17`

## Context

We are adding a **partner** role to the cloud platform. A partner is a lock
installer / reseller who services one or more customer organisations. They want
a portal to see the locks they installed, device health, access activity, and
partner-specific (co-branded) content.

A scaffold already exists (mock-backed) to validate UX:

- Contract stub: `packages/api/src/partner/types.ts` (exported from `@repo/api`)
- Portal + gate: `apps/cloud/src/app/partner/*`, `apps/cloud/src/lib/partner/*`
- Sidebar product: "Zezamii Partner" in `packages/ui/src/components/zezamii-sidebar.tsx`

This document is the plan to take that scaffold to production.

## Key design decisions (agreed)

1. **Per-org, not cross-org.** A partner logs in and **selects one org at a
   time** using the existing org switcher. There is **no aggregated "all orgs"
   layer**. This deletes the hardest parts of earlier drafts: no `x-partner-id`
   context, no cross-org aggregation views, no partner-scoped fan-out procedure.
2. **`partner` is an org membership role.** Add `"partner"` to
   `membershipRoleEnum`. A partner gets a normal `memberships` row (role
   `partner`) in each org they service, so the existing `selected_org` cookie →
   `x-org-id` → `orgProcedure` machinery handles all scoping with **zero new
   backend plumbing**.
3. **Identity is decoupled from access level.** "This user *is* a partner"
   (branding, resources) comes from a global `partner_memberships → partners`
   link. "What they can see in org X" comes from the org `memberships.role`.
   Branding/resources persist even if a customer changes their role in one org.
4. **Least privilege, customer-elevated.** Default `partner` role = a narrow,
   device-focused view. If a partner needs more, the **customer** changes that
   partner's org membership role (`partner` → `viewer` / `global_user`), at
   which point they drop into the normal cloud dashboard for that org. Note:
   memberships are **one role per org** (`uq_user_org`), so elevation is a role
   *change*, not a stacked second role. No new code — this is existing
   role machinery.
5. **v1 device scope: all devices in the selected org.** A partner sees every
   device in orgs they're a member of. Only add a
   `device_refs.installedByPartnerId` provenance column **if** multiple partners
   realistically service one org and "your locks vs. theirs" must be split.
   Deferred by default — it's the one avoidable schema change.
6. **Frontend stays in `apps/cloud`.** Since a partner is a scoped org member
   (not an external cross-org party), the separate-app rationale falls away. The
   existing scaffold screens get wired to real per-org data.

## Phase 1 — Schema & migration

Follow the existing idiom in `packages/api/src/db/schema/orgs.ts` and
`sites.ts`: TS string-literal enum tuples + a text column typed with
`.$type<...>()` + a matching `check("chk_*", sql\`... IN (...)\`)` constraint;
`chk_*_slug` regex checks; indexes via `index(...)` / `uniqueIndex(...)`; all
tables declared as `coreSchema.table(...)`.

- **Add the role:** append `"partner"` to `membershipRoleEnum` and extend the
  `chk_role` check constraint in `orgs.ts`. Update the `MembershipRole` type
  consumers as needed.
- **New tables** (`coreSchema`), exported from `db/schema/index.ts` and the
  package `index.ts`:
  - `partners` — brand identity: `id`, `slug`, `name`, `logoUrl`, `brandColor`,
    `contactEmail`, `tier`. (Mirrors the `Partner` interface already in
    `partner/types.ts`.)
  - `partner_memberships` — `userId → partnerId` link (who logs in as this
    partner). Unique on `(userId, partnerId)`.
  - `partner_resources` — co-branded content: `title`, `description`,
    `category`, `url`, `updatedAt`, `coBranded`, `partnerId`.
  - *(deferred)* `device_refs.installedByPartnerId` — only if decision 5 flips
    to "only their locks."
- **Views:** add `v_partner_memberships` (partner + user join) and, if resources
  are read via views, `v_partner_resources`, to the views SQL. The resolver
  reads `public.v_*` views, never `core.*` tables directly (repo convention:
  views are the stable, additive-only contract for tRPC).
- **Migration:** hand-write `packages/api/drizzle/0004_add_partners.sql` in the
  existing `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ... ADD ... IF NOT EXISTS`
  style, plus the view definitions. Apply with `pnpm db:push && pnpm db:views`
  from `packages/api` (note: `_journal.json` only tracks `0000`; later
  migrations are applied out-of-band via push, matching current practice).

Files: `packages/api/src/db/schema/orgs.ts`,
`packages/api/src/db/schema/partners.ts` (new),
`packages/api/src/db/schema/index.ts`, `packages/api/src/index.ts`,
`packages/api/drizzle/0004_add_partners.sql` (new), views SQL.

## Phase 2 — Portal wiring (real data)

- **Partner router:** add `partnerRouter` in `packages/api/src/router/` and mount
  it in `router/index.ts` (currently `health, public, daypass, events, legacy,
  admin`). Use the existing **`orgProcedure`** (no new middleware) so everything
  is auto-scoped to the selected org:
  - `getContext` — the signed-in user's partner identity + branding.
  - `listDevices` — devices in the current org (`device_refs`, later joined to
    health — see Phase 3).
  - `listActivity` — from `audit_log`, filtered to the current org. Being
    org-scoped is now exactly right (no `site_ref_id` needed).
  - `listResources` — `partner_resources` for the user's partner.
- **Swap the gate:** replace the mock in `apps/cloud/src/lib/partner/context.ts`
  (`isPartnerUser`, `getPartnerContext`) so the portal renders when the selected
  org's `membership.role === "partner"`; resolve branding/resources from the
  partner identity. Delete reliance on `apps/cloud/src/lib/partner/mock-data.ts`.
- **Server-side role check:** render partner pages based on the resolved role —
  do not rely on nav visibility alone.

Files: `packages/api/src/router/partner.ts` (new),
`packages/api/src/router/index.ts`, `apps/cloud/src/lib/partner/context.ts`,
`apps/cloud/src/app/partner/*` (swap mock imports for tRPC queries).

## Phase 3 — Device health source (the one real unknown)

`device_refs` has **no telemetry** (`externalDeviceId`, `slug`, `deviceType`,
`displayName` only). Health / battery / firmware / last-seen live in the device
platform / legacy MSSQL. **Decision required:**

- **A. On-demand fetch** via `packages/api/src/services/legacy-api.ts` — no new
  storage, always fresh, but adds latency and a hard dependency on the legacy
  API per portal load.
- **B. Synced `device_health` table** — a periodic sync writes health rows;
  portal reads are fast and resilient, at the cost of a sync job and staleness.

Recommendation: start with **A** if the legacy API is reliable and quick;
move to **B** if latency or availability becomes a problem.

## Phase 4 — Provisioning

Internal-admin flow (tRPC first, UI later) to:

- create a `partners` row,
- link users via `partner_memberships`,
- grant `partner` `memberships` rows in each org the partner services.

Elevation ("give this partner full access to my org") needs **no new code** —
the customer changes the partner's org membership role through existing role
management.

## Verification

- **Phase 1:** `cd packages/api && pnpm db:push && pnpm db:views`; confirm tables
  + views in `pnpm db:studio`.
- **Phase 2:** assert a `partner`-role membership renders the portal and a
  non-partner role does not; confirm `orgProcedure` scopes every read to the
  selected org. `MOCK_AUTH=1 next build` in `apps/cloud` stays green (already
  verified for the scaffold).
- **Phase 3–4:** seed a partner + memberships; drive the portal end-to-end for a
  selected org and confirm devices / activity / resources render from real data.

## Open questions

1. **Device health source** — Phase 3 option A (on-demand) vs. B (synced table)?
2. **Multi-partner orgs** — is one org ever serviced by more than one partner? If
   yes, add `device_refs.installedByPartnerId` provenance (decision 5) so a
   partner sees only their own locks.
