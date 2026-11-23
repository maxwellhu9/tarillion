/**
 * Gameplay procedures. All answer checking and scoring happens here on the
 * server so the answer list is never sent to the client mid-game.
 * See docs/SCHEMA_AND_API.md § game.
 */

import {
  PlayIdentity,
  PromptIdentity,
  StartPlay,
  SubmitGuess,
} from "@/server/models/inputs";
import { GuessResult, Play, RevealedAnswer } from "@/server/models/responses";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { notImplemented } from "./_todo";

export const MAX_STRIKES = 3;
export const GOLDEN_RAM_BONUS = 250;

/** Starts a play, or resumes the existing in-progress / daily play. */
const startPlay = protectedProcedure
  .input(StartPlay)
  .output(Play)
  .mutation(notImplemented);

const getPlay = protectedProcedure
  .input(PlayIdentity)
  .output(Play)
  .query(notImplemented);

/** The signed-in user's daily play for a prompt, or null if not started. */
const getMyDailyPlay = protectedProcedure
  .input(PromptIdentity)
  .output(Play.nullable())
  .query(notImplemented);

const submitGuess = protectedProcedure
  .input(SubmitGuess)
  .output(GuessResult)
  .mutation(notImplemented);

/** Ends a play early ("I'm out of ideas"). */
const endPlay = protectedProcedure
  .input(PlayIdentity)
  .output(Play)
  .mutation(notImplemented);

/** Full answer list with rarity. Only after the user finished the prompt. */
const revealAnswers = protectedProcedure
  .input(PromptIdentity)
  .output(RevealedAnswer.array())
  .query(notImplemented);

export const gameApiRouter = createTRPCRouter({
  startPlay,
  getPlay,
  getMyDailyPlay,
  submitGuess,
  endPlay,
  revealAnswers,
});
