import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@repo/api";

/**
 * tRPC React client
 * Used for client-side data fetching
 */
export const trpc = createTRPCReact<AppRouter>({});
