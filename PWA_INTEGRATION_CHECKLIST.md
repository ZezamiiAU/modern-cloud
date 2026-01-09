# PWA Integration Checklist

## Prerequisites

- [ ] Access to v0-zezamii-pass-prd repository
- [ ] Backup of current apps/daypass (if replacing)
- [ ] Reviewed PWA_INTEGRATION_PLAN.md

## Step 1: Get the PWA Code

### Option A: Clone Repository Manually
```bash
cd /path/to/parent-directory
git clone https://github.com/ZezamiiAU/v0-zezamii-pass-prd.git
```

### Option B: Use Integration Script
```bash
cd /home/user/modern-cloud
./scripts/integrate-pwa.sh
```

## Step 2: Update package.json

The PWA's `package.json` must be updated to integrate with the monorepo.

### Required Changes:

**Current package.json structure (example):**
```json
{
  "name": "zezamii-pass-pwa",
  "version": "1.0.0",
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "qrcode": "^1.5.0",
    // ... other deps
  }
}
```

**Updated for monorepo:**
```json
{
  "name": "@app/daypass",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/api": "workspace:*",
    "@repo/ui": "workspace:*",
    "@repo/config": "workspace:*",
    "@supabase/supabase-js": "^2.42.0",
    "@tanstack/react-query": "^5.28.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@trpc/server": "^11.0.0",
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "superjson": "^2.2.1",
    "zod": "^3.23.0",
    "qrcode": "^1.5.0",
    "qrcode.react": "^3.1.0",
    "qr-code-styling": "^1.6.0-rc.1",
    "@stripe/stripe-js": "^2.0.0",
    "@stripe/react-stripe-js": "^2.0.0"
  },
  "devDependencies": {
    "@repo/eslint-config": "workspace:*",
    "@repo/typescript-config": "workspace:*",
    "@types/node": "^20.12.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.4.0"
  }
}
```

**Key changes:**
- ✅ Name changed to `@app/daypass`
- ✅ Added workspace dependencies: `@repo/api`, `@repo/ui`, `@repo/config`
- ✅ Added tRPC and React Query
- ✅ Added dev script with port 3001
- ✅ Kept QR code libraries
- ✅ Added Stripe libraries

## Step 3: Update Import Paths

Replace any hardcoded imports with workspace package imports:

### Before:
```typescript
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
```

### After:
```typescript
import { Button, Card } from '@repo/ui'
```

### tRPC Integration:

Create or update `src/lib/trpc.ts`:
```typescript
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@repo/api'

export const trpc = createTRPCReact<AppRouter>()
```

Update providers in `src/app/providers.tsx`:
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import superjson from 'superjson'
import { trpc } from '@/lib/trpc'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/trpc',
          transformer: superjson,
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}
```

## Step 4: Update Configuration Files

### tsconfig.json
Extend from shared config:
```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### .eslintrc.js
```javascript
module.exports = {
  extends: ["@repo/eslint-config/next.js"],
};
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";
import sharedConfig from "@repo/config/tailwind";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [sharedConfig],
};

export default config;
```

## Step 5: Update Environment Variables

Create `.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/trpc

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# Supabase (if needed)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Step 6: Integrate with Backend APIs

### Pass Purchase Flow

Replace any old API calls with tRPC calls:

```typescript
'use client'

import { trpc } from '@/lib/trpc'
import { useSearchParams } from 'next/navigation'

export function PassPurchasePage() {
  const searchParams = useSearchParams()
  const orgSlug = searchParams.get('org') || ''
  const siteSlug = searchParams.get('site') || ''
  const deviceSlug = searchParams.get('device')

  // Resolve slugs to IDs and get site info
  const { data: context } = trpc.public.resolvePathSlugs.useQuery({
    orgSlug,
    siteSlug,
    deviceSlug: deviceSlug || undefined,
  })

  // Get available pass types for this site
  const { data: passTypes } = trpc.public.getPassTypes.useQuery(
    { siteId: context?.site.id || '' },
    { enabled: !!context?.site.id }
  )

  // Create payment intent
  const createPayment = trpc.daypass.createPaymentIntent.useMutation()

  // Issue pass after payment
  const issuePass = trpc.daypass.issuePass.useMutation()

  // ... rest of component
}
```

### Stripe Integration

```typescript
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PaymentForm({ clientSecret, onSuccess }: Props) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormContent onSuccess={onSuccess} />
    </Elements>
  )
}

function PaymentFormContent({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pass/success`,
      },
    })

    if (error) {
      // Handle error
      setIsProcessing(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  )
}
```

### QR Code Generation

```typescript
import QRCode from 'qrcode'
import { QRCodeSVG } from 'qrcode.react'

// Option 1: Using qrcode library
export function generateQRCode(passCode: string) {
  return QRCode.toDataURL(passCode, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })
}

// Option 2: Using qrcode.react
export function PassCodeQR({ code }: { code: string }) {
  return (
    <div className="flex justify-center">
      <QRCodeSVG
        value={code}
        size={200}
        level="H"
        includeMargin
      />
    </div>
  )
}

// Option 3: Using qr-code-styling (more customizable)
import QRCodeStyling from 'qr-code-styling'

export function FancyPassCodeQR({ code }: { code: string }) {
  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    data: code,
    dotsOptions: {
      color: '#000000',
      type: 'rounded',
    },
    cornersSquareOptions: {
      type: 'extra-rounded',
    },
  })

  return <div ref={(ref) => ref && qrCode.append(ref)} />
}
```

## Step 7: Update Turbo Configuration

Ensure `turbo.json` includes the daypass app (should already be configured):

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Step 8: Install Dependencies and Test

```bash
# Install all dependencies
pnpm install

# Type check
pnpm --filter @app/daypass type-check

# Run dev server
pnpm --filter @app/daypass dev

# Build for production
pnpm --filter @app/daypass build
```

## Step 9: Test Integration

### Test URLs:
- `http://localhost:3001/` - Landing page
- `http://localhost:3001/p/test-org/melbourne-cbd/front-door` - QR code flow

### Test Flow:
1. [ ] Landing page loads
2. [ ] QR code URL resolves slugs correctly
3. [ ] Pass types display for the site
4. [ ] Can select a pass type
5. [ ] User details form works
6. [ ] Stripe payment form loads
7. [ ] Payment processes successfully
8. [ ] Pass code is generated and displayed
9. [ ] QR code renders for pass code
10. [ ] Email confirmation sent (if implemented)

## Step 10: Commit Changes

```bash
git add apps/daypass
git add PWA_INTEGRATION_PLAN.md
git add PWA_INTEGRATION_CHECKLIST.md
git add scripts/integrate-pwa.sh
git commit -m "Integrate production PWA into daypass app"
git push -u origin claude/document-dev-plan-rJRck
```

## Common Issues & Solutions

### Issue: Module not found '@repo/ui'
**Solution:** Run `pnpm install` from monorepo root

### Issue: tRPC types not found
**Solution:** Build the API package first:
```bash
pnpm --filter @repo/api build
```

### Issue: Stripe not loading
**Solution:** Check environment variable is set:
```bash
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### Issue: QR codes not rendering
**Solution:** Ensure QR code library is installed:
```bash
pnpm --filter @app/daypass add qrcode qrcode.react @types/qrcode
```

## Verification Checklist

After integration:

- [ ] `pnpm install` runs without errors
- [ ] `pnpm dev` starts all apps
- [ ] `pnpm --filter @app/daypass dev` starts on port 3001
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] All tRPC endpoints resolve correctly
- [ ] Stripe integration works in test mode
- [ ] QR codes generate correctly
- [ ] PWA manifest is valid
- [ ] App can be installed as PWA
- [ ] All environment variables are documented

## Next Steps After Integration

1. **Add QR Code Generation Admin UI**
   - Create admin page at `apps/cloud/src/app/dashboard/qr-codes`
   - Generate QR codes for each device
   - Download/print QR codes

2. **Enhance Pass Display**
   - Add Apple Wallet / Google Pay integration
   - Save pass to device
   - Offline pass storage

3. **Testing & QA**
   - Test on mobile devices
   - Test PWA installation
   - Test offline functionality
   - Load testing with Stripe

4. **Deploy**
   - Set up production environment variables
   - Configure production Stripe keys
   - Deploy to Vercel/hosting platform
   - Test production flow end-to-end
