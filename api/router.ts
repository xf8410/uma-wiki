import { createRouter, publicQuery } from "./middleware";
import { compatibilityRouter } from "./routers/compatibility";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  compatibility: compatibilityRouter,
});

export type AppRouter = typeof appRouter;
