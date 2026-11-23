/** Leaderboard procedures. See docs/SCHEMA_AND_API.md § leaderboard. */

import {
  DailyLeaderboardParams,
  LeaderboardParams,
} from "@/server/models/inputs";
import { LeaderboardEntry } from "@/server/models/responses";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { notImplemented } from "./_todo";

const getDailyLeaderboard = publicProcedure
  .input(DailyLeaderboardParams)
  .output(LeaderboardEntry.array())
  .query(notImplemented);

/** Ranked by total daily-mode score across all days. */
const getAllTimeLeaderboard = publicProcedure
  .input(LeaderboardParams)
  .output(LeaderboardEntry.array())
  .query(notImplemented);

/** Daily leaderboard restricted to me + accepted friends. */
const getFriendsLeaderboard = protectedProcedure
  .input(DailyLeaderboardParams)
  .output(LeaderboardEntry.array())
  .query(notImplemented);

export const leaderboardApiRouter = createTRPCRouter({
  getDailyLeaderboard,
  getAllTimeLeaderboard,
  getFriendsLeaderboard,
});
