import { createTRPCRouter } from "./init";
import { githubRouter } from "./routers/github-router";

// Create the main app router
export const appRouter = createTRPCRouter({
  github: githubRouter,
  // Add other routers here
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
