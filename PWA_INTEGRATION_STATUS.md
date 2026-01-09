# PWA Integration Status

## ✅ Completed (Backend Ready)

### 1. Database Schema Updates
- ✅ Added `visitor_phone` field to passes table
- ✅ Added `vehicle_plate` field to passes table
- ✅ Added `stripe_payment_intent_id` field to passes table
- ✅ Created migration: `0003_add_pass_pwa_fields.sql`
- ✅ Added index for Stripe payment intent lookups

**File:** `packages/api/src/db/schema/passes.ts`

### 2. tRPC API Endpoints Enhanced

**Updated `daypass.createPaymentIntent`:**
- ✅ Now accepts `phone` and `vehiclePlate` optional fields
- ✅ Stores these in Stripe metadata

**Added `daypass.getPassByPaymentIntent`:**
- ✅ Retrieves pass details by Stripe payment intent ID
- ✅ Used by success page to display pass after payment
- ✅ Includes all pass details: code, validity, vehicle, phone

**Added `daypass.syncPayment`:**
- ✅ Manually syncs payment from Stripe if webhook delayed
- ✅ Creates pass if payment succeeded but pass not yet created
- ✅ Handles retry logic for delayed webhook delivery

**File:** `packages/api/src/router/daypass.ts`

### 3. Stripe Service Updates
- ✅ Updated `CreatePaymentIntentInput` interface to include phone and vehiclePlate
- ✅ `getPaymentIntent` function already exists (no changes needed)

**File:** `packages/api/src/services/stripe.ts`

### 4. PWA Components Copied
- ✅ `components/ui/spinner.tsx` - Loading spinner
- ✅ `components/ui/collapsible.tsx` - Collapsible component
- ✅ `components/pass-purchase-form.tsx` - Main purchase flow
- ✅ `components/payment-form.tsx` - Stripe payment integration
- ✅ `app/success/page.tsx` - Pass code display after payment

**Location:** `apps/daypass/src/`

---

## ⏳ In Progress / Remaining Work

### 1. Adapt PWA Components to Monorepo
**Current State:** Components copied but still use PWA-specific imports

**Needs:**
- Replace `@/components/ui/*` imports with `@repo/ui` where available
- Update Supabase API calls to use tRPC hooks
- Fix import paths for components not in @repo/ui

**Affected Files:**
- `apps/daypass/src/components/pass-purchase-form.tsx`
- `apps/daypass/src/components/payment-form.tsx`
- `apps/daypass/src/app/success/page.tsx`

### 2. Update Main Entry Point
**Current:** Basic landing with "Buy Pass" button
**Needs:** Use PWA's device landing page pattern

**File to Update:** `apps/daypass/src/app/p/[orgSlug]/[siteSlug]/[deviceSlug]/page.tsx`

**Changes Needed:**
```typescript
// Replace current implementation with PWA version
// Use trpc.public.resolvePathSlugs to get device/site/org info
// Show PassPurchaseForm component
```

### 3. Replace Supabase with tRPC

**In `pass-purchase-form.tsx`:**
```typescript
// OLD (Supabase):
const res = await fetch(`/api/pass-types?orgId=${organizationId}`)

// NEW (tRPC):
const { data: passTypes } = trpc.public.getPassTypes.useQuery({
  siteId: siteId
})
```

```typescript
// OLD (Supabase):
const data = await createPaymentIntent({ ... })

// NEW (tRPC):
const createPayment = trpc.daypass.createPaymentIntent.useMutation()
await createPayment.mutateAsync({ ... })
```

**In `success/page.tsx`:**
```typescript
// OLD (Supabase):
const response = await fetch(`/api/passes/by-session?payment_intent=${paymentIntent}`)

// NEW (tRPC):
const { data: pass } = trpc.daypass.getPassByPaymentIntent.useQuery({
  paymentIntentId: paymentIntent
})
```

### 4. Add Dependencies
**Need to add to `apps/daypass/package.json`:**
```json
{
  "qrcode": "^1.5.0",
  "qrcode.react": "^3.1.0",
  "sonner": "latest",
  "date-fns": "4.1.0",
  "@stripe/react-stripe-js": "latest",
  "@stripe/stripe-js": "latest"
}
```

### 5. PWA Features
**Still need to copy:**
- `/public/sw.js` - Service worker
- PWA icons (icon-192.jpg, icon-512.jpg)
- PWA manifest (or generate dynamically)
- `pwa-install-prompt.tsx` component
- `service-worker-registration.tsx` component

### 6. Environment Variables
**Add to `.env.local`:**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SUPPORT_EMAIL=support@zezamii.com
```

---

## 📋 Migration Checklist

To complete the integration, follow these steps:

### Step 1: Run Database Migration
```bash
cd packages/api
pnpm db:migrate
# Or manually: psql -d your_db -f drizzle/0003_add_pass_pwa_fields.sql
```

### Step 2: Add Dependencies
```bash
cd apps/daypass
pnpm add qrcode qrcode.react sonner date-fns @stripe/react-stripe-js @stripe/stripe-js
pnpm add -D @types/qrcode
```

### Step 3: Update Component Imports
Edit each copied component to replace imports:
- `@/components/ui/*` → `@repo/ui` or local `./ui/*`
- `@/lib/*` → local `../lib/*` or create utilities

### Step 4: Create tRPC Client Wrapper
Create `apps/daypass/src/lib/api-client.ts`:
```typescript
import { trpc } from './trpc'

export async function createPaymentIntent(input) {
  // Wrapper for PWA compatibility
  return trpc.daypass.createPaymentIntent.mutate(input)
}
```

### Step 5: Update Pass Purchase Form
Replace Supabase calls with tRPC hooks in `pass-purchase-form.tsx`

### Step 6: Update Success Page
Replace Supabase calls with tRPC hooks in `success/page.tsx`

### Step 7: Test Flow
```bash
pnpm --filter @app/daypass dev
# Visit: http://localhost:3001/p/test-org/melbourne-cbd/front-door
```

### Step 8: Add PWA Assets
```bash
cp /tmp/v0-zezamii-pass-prd/public/sw.js apps/daypass/public/
cp /tmp/v0-zezamii-pass-prd/public/icon-*.jpg apps/daypass/public/
# Update manifest.json
```

---

## 🎯 Quick Reference

### New tRPC Endpoints Available:

**Get pass types:**
```typescript
trpc.public.getPassTypes.useQuery({ siteId: "uuid" })
```

**Resolve slugs:**
```typescript
trpc.public.resolvePathSlugs.useQuery({
  orgSlug: "test-org",
  siteSlug: "melbourne-cbd",
  deviceSlug: "front-door" // optional
})
```

**Create payment:**
```typescript
trpc.daypass.createPaymentIntent.useMutation()
// Input: { siteId, passTypeId, email, name, phone?, vehiclePlate? }
```

**Get pass after payment:**
```typescript
trpc.daypass.getPassByPaymentIntent.useQuery({
  paymentIntentId: "pi_xxx"
})
```

**Sync payment (retry):**
```typescript
trpc.daypass.syncPayment.useMutation()
// Input: { paymentIntentId: "pi_xxx" }
```

---

## 📁 Files Changed

### Backend (packages/api/)
- `src/db/schema/passes.ts` - Added fields
- `src/router/daypass.ts` - Added endpoints
- `src/services/stripe.ts` - Updated types
- `drizzle/0003_add_pass_pwa_fields.sql` - Migration

### Frontend (apps/daypass/)
- `src/components/ui/spinner.tsx` - NEW
- `src/components/ui/collapsible.tsx` - NEW
- `src/components/pass-purchase-form.tsx` - NEW (needs tRPC update)
- `src/components/payment-form.tsx` - NEW (needs import fixes)
- `src/app/success/page.tsx` - NEW (needs tRPC update)

---

## 🚀 Next Actions

1. **Immediate:** Fix component imports to work with monorepo
2. **High Priority:** Replace Supabase calls with tRPC
3. **Medium Priority:** Add PWA features (service worker, icons)
4. **Low Priority:** Add QR code generation for pass display

---

## 📊 Progress Summary

**Backend:** 100% Complete ✅
- Database schema updated
- tRPC endpoints added
- All PWA features supported

**Frontend:** 40% Complete ⏳
- Components copied
- Still needs: import fixes, tRPC integration, testing

**PWA Features:** 10% Complete ⏳
- Still needs: service worker, manifest, icons

**Estimated Remaining:** 2-3 hours of focused work

---

## 💡 Tips for Completing Integration

1. **Start with imports:** Fix all `@/` imports first before testing
2. **Use existing patterns:** Look at how `apps/cloud` uses tRPC
3. **Test incrementally:** Get pass-purchase-form working first
4. **PWA last:** Service worker and icons can wait until flow works

---

## 🐛 Known Issues to Watch For

1. **UI Component Imports:** Some PWA components may reference UI elements not in @repo/ui
   - Solution: Copy missing UI components to local `ui/` folder

2. **Type Mismatches:** PWA expects `duration_minutes`, we have `duration_hours`
   - Solution: Convert in tRPC layer or update frontend to convert

3. **Metadata Schema:** Stripe metadata has string keys, need to match exactly
   - Solution: Already handled in daypass router

4. **Payment Intent Retrieval:** Success page needs paymentIntentId in URL
   - Solution: PaymentForm already redirects with correct URL format

---

For detailed technical analysis, see `PWA_ANALYSIS.md`
