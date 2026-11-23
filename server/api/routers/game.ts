/**
 * Gameplay procedures. All answer checking and scoring happens here on the
 * server so the answer list is never sent to the client mid-game.
 * See docs/SCHEMA_AND_API.md (game, Scoring).
 */

import { TRPCError } from "@trpc/server";
import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { answersTable, guessesTable, playsTable } from "@/server/db/schema";
import {
  PlayIdentity,
  PromptIdentity,
  StartPlay,
  SubmitGuess,
} from "@/server/models/inputs";
import { GuessResult, Play, RevealedAnswer } from "@/server/models/responses";
import { loadPlay, loadPrompt } from "../loaders";
import {
  GOLDEN_RAM_BONUS,
  MAX_STRIKES,
  matchAnswer,
  normalize,
  rarity,
  todayInChapelHill,
} from "../scoring";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/** Number of finished plays (any mode) for a prompt. */
async function finishedPlayCount(promptId: number) {
  const [row] = await db
    .select({ n: count() })
    .from(playsTable)
    .where(and(eq(playsTable.promptId, promptId), eq(playsTable.status, "finished")));
  return row.n;
}

/** Starts a play, or resumes the existing daily / in-progress one. */
const startPlay = protectedProcedure
  .input(StartPlay)
  .output(Play)
  .mutation(async ({ ctx, input }) => {
    const { promptId, mode } = input;
    const profileId = ctx.subject.id;
    const prompt = await loadPrompt(promptId);
    const today = todayInChapelHill();

    if (mode === "daily" && prompt.dailyDate !== today) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This is not today's prompt." });
    }
    // Today's and future daily prompts can't be played early in Unlimited.
    if (mode === "unlimited" && prompt.dailyDate !== null && prompt.dailyDate >= today) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This prompt is not available yet." });
    }

    const existing = await db.query.playsTable.findFirst({
      where:
        mode === "daily"
          ? { profileId, promptId, mode }
          : { profileId, promptId, mode, status: "in_progress" },
    });
    if (existing) return loadPlay(existing.id, profileId);

    // The unique index stops a second daily play if two requests race.
    await db.insert(playsTable).values({ profileId, promptId, mode }).onConflictDoNothing();
    const play = await db.query.playsTable.findFirst({
      where: { profileId, promptId, mode, status: "in_progress" },
      orderBy: { id: "desc" },
    });
    return loadPlay(play!.id, profileId);
  });

const getPlay = protectedProcedure
  .input(PlayIdentity)
  .output(Play)
  .query(({ ctx, input }) => loadPlay(input.playId, ctx.subject.id));

/** The signed-in user's daily play for a prompt, or null if not started. */
const getMyDailyPlay = protectedProcedure
  .input(PromptIdentity)
  .output(Play.nullable())
  .query(async ({ ctx, input }) => {
    const play = await db.query.playsTable.findFirst({
      where: { profileId: ctx.subject.id, promptId: input.promptId, mode: "daily" },
    });
    return play ? loadPlay(play.id, ctx.subject.id) : null;
  });

const submitGuess = protectedProcedure
  .input(SubmitGuess)
  .output(GuessResult)
  .mutation(async ({ ctx, input }) => {
    const profileId = ctx.subject.id;

    const result = await db.transaction(async (tx) => {
      // Lock the play row so two quick guesses can't both count.
      const [play] = await tx
        .select()
        .from(playsTable)
        .where(eq(playsTable.id, input.playId))
        .for("update");
      if (!play) throw new TRPCError({ code: "NOT_FOUND", message: "Play not found." });
      if (play.profileId !== profileId) throw new TRPCError({ code: "FORBIDDEN" });
      if (play.status === "finished") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This round is over." });
      }

      const answers = await tx
        .select()
        .from(answersTable)
        .where(eq(answersTable.promptId, play.promptId));
      const previous = await tx
        .select()
        .from(guessesTable)
        .where(eq(guessesTable.playId, play.id));

      const match = matchAnswer(input.text, answers);
      const isRepeat = match
        ? previous.some((g) => g.answerId === match.id)
        : previous.some((g) => g.answerId === null && normalize(g.rawText) === normalize(input.text));
      if (isRepeat) return { result: "duplicate" as const, guessId: null };

      let points = 0;
      let strikes = play.strikes;
      if (match) {
        points = rarity(match, await finishedPlayCount(play.promptId));
        if (match.isGolden) points += GOLDEN_RAM_BONUS;
        await tx
          .update(answersTable)
          .set({ timesFound: sql`${answersTable.timesFound} + 1` })
          .where(eq(answersTable.id, match.id));
      } else {
        strikes += 1;
      }

      const [guess] = await tx
        .insert(guessesTable)
        .values({ playId: play.id, answerId: match?.id ?? null, rawText: input.text, points })
        .returning({ id: guessesTable.id });

      const foundCount = previous.filter((g) => g.answerId !== null).length + (match ? 1 : 0);
      const finished = strikes >= MAX_STRIKES || foundCount === answers.length;
      await tx
        .update(playsTable)
        .set({
          score: play.score + points,
          strikes,
          foundGolden: play.foundGolden || (match?.isGolden ?? false),
          ...(finished && { status: "finished" as const, finishedAt: new Date() }),
        })
        .where(eq(playsTable.id, play.id));

      return { result: match ? ("correct" as const) : ("wrong" as const), guessId: guess.id };
    });

    const play = await loadPlay(input.playId, profileId);
    return {
      result: result.result,
      guess: play.guesses.find((g) => g.id === result.guessId) ?? null,
      play,
    };
  });

/** Ends a play early. */
const endPlay = protectedProcedure
  .input(PlayIdentity)
  .output(Play)
  .mutation(async ({ ctx, input }) => {
    await loadPlay(input.playId, ctx.subject.id); // ownership check
    await db
      .update(playsTable)
      .set({ status: "finished", finishedAt: new Date() })
      .where(and(eq(playsTable.id, input.playId), eq(playsTable.status, "in_progress")));
    return loadPlay(input.playId, ctx.subject.id);
  });

/**
 * Every answer with live rarity, rarest first. Allowed once the user has
 * finished a play of this prompt, or for any past daily prompt.
 */
const revealAnswers = protectedProcedure
  .input(PromptIdentity)
  .output(RevealedAnswer.array())
  .query(async ({ ctx, input }) => {
    const profileId = ctx.subject.id;
    const prompt = await loadPrompt(input.promptId);
    const myPlays = await db.query.playsTable.findMany({
      where: { profileId, promptId: input.promptId },
      with: { guesses: { columns: { answerId: true } } },
    });

    const isPastDaily = prompt.dailyDate !== null && prompt.dailyDate < todayInChapelHill();
    if (!isPastDaily && !myPlays.some((p) => p.status === "finished")) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Finish the round first." });
    }

    const found = new Set(myPlays.flatMap((p) => p.guesses.map((g) => g.answerId)));
    const finished = await finishedPlayCount(input.promptId);
    const answers = await db.query.answersTable.findMany({
      where: { promptId: input.promptId },
    });

    return answers
      .map((a) => ({
        id: a.id,
        text: a.text,
        rarity: rarity(a, finished),
        foundRate: finished === 0 ? 0 : Math.min(1, a.timesFound / finished),
        isGolden: a.isGolden,
        foundByMe: found.has(a.id),
      }))
      .sort((a, b) => b.rarity - a.rarity);
  });

export const gameApiRouter = createTRPCRouter({
  startPlay,
  getPlay,
  getMyDailyPlay,
  submitGuess,
  endPlay,
  revealAnswers,
});
