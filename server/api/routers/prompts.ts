/**
 * Prompt procedures. These never return answers — see `game.revealAnswers`.
 * See docs/SCHEMA_AND_API.md § prompts.
 */

import {
  ArchiveParams,
  PromptIdentity,
  RandomPromptParams,
} from "@/server/models/inputs";
import { Paginated, Prompt } from "@/server/models/responses";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { notImplemented } from "./_todo";

/** Today's Daily Heel (date in America/New_York). */
const getDailyPrompt = publicProcedure.output(Prompt).query(notImplemented);

const getPrompt = publicProcedure
  .input(PromptIdentity)
  .output(Prompt)
  .query(notImplemented);

/** Random non-daily prompt for Unlimited mode. */
const getRandomPrompt = publicProcedure
  .input(RandomPromptParams)
  .output(Prompt)
  .query(notImplemented);

/** Past Daily Heels, newest first (today excluded). */
const getArchive = publicProcedure
  .input(ArchiveParams)
  .output(Paginated(Prompt))
  .query(notImplemented);

export const promptsApiRouter = createTRPCRouter({
  getDailyPrompt,
  getPrompt,
  getRandomPrompt,
  getArchive,
});
