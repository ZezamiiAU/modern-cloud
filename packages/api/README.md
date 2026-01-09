# @repo/api

Central tRPC API for the Zezamii Modern Platform.

## Database Setup

### Prerequisites

- PostgreSQL database (Supabase recommended)
- `DATABASE_URL` environment variable set

### 1. Run Migrations

Apply all database migrations:

```bash
# Push schema directly (development)
pnpm db:push

# OR generate and apply migrations (production)
pnpm db:generate
pnpm db:migrate
```

### 2. Seed Test Data

Load test organization, sites, devices, and pass types:

```bash
psql $DATABASE_URL -f scripts/seed-test-data.sql
```

This creates:
- Test organization: `test-org`
- Test site: `melbourne-cbd`
- 3 test devices: `front-door`, `back-door`, `reception`
- 4 pass types: Day Pass, Half Day, Week Pass, Monthly Pass

### 3. Verify Setup

```bash
# Open Drizzle Studio to browse tables
pnpm db:studio
```

## QR Code URLs

After seeding, use these URLs in QR codes:

### Device-Specific QR Codes
```
Front Door:   https://daypass.zezamii.com/p/test-org/melbourne-cbd/front-door
Back Door:    https://daypass.zezamii.com/p/test-org/melbourne-cbd/back-door
Reception:    https://daypass.zezamii.com/p/test-org/melbourne-cbd/reception
```

### Site-Wide QR Code
```
Site:         https://daypass.zezamii.com/p/test-org/melbourne-cbd
```

## Database Schema

### Tables Created

- `core.pass_types` - Site-specific pass products with pricing
- `core.passes` (updated) - Links to pass_types via `pass_type_id`
- `core.org_refs` - Organization references
- `core.site_refs` - Site references
- `core.device_refs` - Device references

### Key Relationships

```
org_refs
  └── site_refs
       ├── pass_types (pricing per site)
       ├── device_refs (devices at site)
       └── passes (issued passes for site)
```

## API Usage

### Public Endpoints

```typescript
// Resolve QR code path slugs
const result = await trpc.public.resolvePathSlugs.query({
  orgSlug: 'test-org',
  siteSlug: 'melbourne-cbd',
  deviceSlug: 'front-door', // optional
});

// Get pass types for a site
const passTypes = await trpc.public.getPassTypes.query({
  siteId: 'site-uuid'
});
```

### Daypass Endpoints

```typescript
// Create payment intent
const payment = await trpc.daypass.createPaymentIntent.mutate({
  siteId: 'site-uuid',
  passTypeId: 'pass-type-uuid',
  email: 'user@example.com',
  name: 'John Doe',
});

// Issue pass after payment
const pass = await trpc.daypass.issuePass.mutate({
  paymentIntentId: 'pi_xxxxx',
});

// Validate pass code
const validation = await trpc.daypass.validatePass.query({
  code: 'DAYPASS-XXXX-XXXX',
});
```

## Development

```bash
# Type check
pnpm type-check

# Generate database types
pnpm db:generate

# Studio (database GUI)
pnpm db:studio
```
