# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with code in this repository.

## Project Overview

Zezamii Modern is a Turborepo monorepo containing access pass and QR code generation applications. The project uses pnpm workspaces with shared packages for UI components, configuration, authentication, and API logic.

## Architecture

### Apps (Next.js 14)
- **cloud** (`apps/cloud`, port 3000): Main cloud dashboard with Kinde authentication
- **daypass** (`apps/daypass`, port 3001): Day pass management with Stripe payments
- **access-pass** (`apps/access-pass`, port 3002): Access pass generation and management

### Packages
- **@repo/ui**: Shared React components with Tailwind CSS
- **@repo/api**: tRPC API router and procedures
- **@repo/auth**: Authentication utilities (Kinde integration)
- **@repo/config**: Shared configuration (Tailwind, TypeScript configs)

## Common Commands

```bash
# Development
pnpm dev                  # Run all apps in development mode
pnpm build               # Build all apps and packages
pnpm lint                # Run ESLint across all packages
pnpm type-check          # Run TypeScript type checking
pnpm format              # Format code with Prettier
pnpm clean               # Clean all build outputs and node_modules

# Individual apps
pnpm --filter @app/cloud dev     # Run only cloud app
pnpm --filter @app/daypass dev   # Run only daypass app
pnpm --filter @app/access-pass dev  # Run only access-pass app
```

## Tech Stack

- **Package Manager**: pnpm 9.15.0 with workspaces
- **Build System**: Turborepo
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.4+
- **Styling**: Tailwind CSS 3.4
- **API**: tRPC 11 with React Query
- **Database**: Supabase
- **Authentication**: Kinde Auth
- **Payments**: Stripe (daypass app)
- **UI Components**: Radix UI primitives
- **Validation**: Zod
- **QR Codes**: qr-code-styling, qrcode.react

## Code Style Guidelines

- **Pre-commit hooks**: Husky + lint-staged runs ESLint and Prettier on staged files
- **ESLint**: Uses ESLint 9 with flat config
- **TypeScript**: Strict mode enabled, use workspace shared configs
- **Imports**: Use workspace package aliases (`@repo/ui`, `@repo/api`, etc.)
- **Components**: Prefer functional components with TypeScript interfaces

## Project Conventions

- Environment files: Copy `.env.example` to `.env.local` for each app
- Shared code goes in `packages/`, app-specific code stays in `apps/`
- tRPC routers are defined in `@repo/api` and consumed by apps
- UI components follow Radix UI patterns with Tailwind styling
