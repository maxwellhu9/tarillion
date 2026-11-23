/** Stats and history procedures. See docs/SCHEMA_AND_API.md § stats. */

import { PaginationParams, ProfileIdentity } from "@/server/models/inputs";
import { Paginated, PlaySummary, Stats } from "@/server/models/responses";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { notImplemented } from "./_todo";

const getMyStats = protectedProcedure.output(Stats).query(notImplemented);

const getProfileStats = publicProcedure
  .input(ProfileIdentity)
  .output(Stats)
  .query(notImplemented);

const getMyHistory = protectedProcedure
  .input(PaginationParams)
  .output(Paginated(PlaySummary))
  .query(notImplemented);

export const statsApiRouter = createTRPCRouter({
  getMyStats,
  getProfileStats,
  getMyHistory,
});
