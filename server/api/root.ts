/** Primary tRPC router: every procedure is reachable at /api/trpc/<router>.<procedure>. */

import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { categoriesApiRouter } from "./routers/categories";
import { friendsApiRouter } from "./routers/friends";
import { gameApiRouter } from "./routers/game";
import { leaderboardApiRouter } from "./routers/leaderboard";
import { profilesApiRouter } from "./routers/profiles";
import { promptsApiRouter } from "./routers/prompts";
import { statsApiRouter } from "./routers/stats";

export const appRouter = createTRPCRouter({
  profiles: profilesApiRouter,
  categories: categoriesApiRouter,
  prompts: promptsApiRouter,
  game: gameApiRouter,
  leaderboard: leaderboardApiRouter,
  friends: friendsApiRouter,
  stats: statsApiRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
