/**
 * Zod models for the outputs returned by tRPC procedures.
 * These are the source of truth for the output shapes in docs/SCHEMA_AND_API.md.
 */

import { z } from "zod";

export const Profile = z.object({
  id: z.string(),
  name: z.string(),
  handle: z.string(),
  avatarUrl: z.string().nullable(),
  createdAt: z.date({ coerce: true }),
});

export const Category = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  iconUrl: z.string().nullable(),
});

/** A prompt as shown before/while playing — never includes the answers. */
export const Prompt = z.object({
  id: z.number(),
  question: z.string(),
  category: Category,
  dailyDate: z.string().nullable(),
  /** 1–3 within the day; null for Unlimited-only prompts. */
  dailyPosition: z.number().nullable(),
  answerCount: z.number(),
});

export const Guess = z.object({
  id: z.number(),
  rawText: z.string(),
  /** Canonical answer text if the guess matched, otherwise null. */
  matchedAnswer: z.string().nullable(),
  points: z.number(),
  isGolden: z.boolean(),
  guessedAt: z.date({ coerce: true }),
});

export const Play = z.object({
  id: z.number(),
  prompt: Prompt,
  mode: z.enum(["daily", "unlimited"]),
  status: z.enum(["in_progress", "finished"]),
  score: z.number(),
  strikes: z.number(),
  maxStrikes: z.number(),
  foundGolden: z.boolean(),
  startedAt: z.date({ coerce: true }),
  finishedAt: z.date({ coerce: true }).nullable(),
  guesses: Guess.array(),
});

export const GuessResult = z.object({
  result: z.enum(["correct", "duplicate", "wrong"]),
  guess: Guess.nullable(),
  play: Play,
});

export const RevealedAnswer = z.object({
  id: z.number(),
  text: z.string(),
  /** 1–100; higher = fewer players found it. */
  rarity: z.number(),
  /** Share of finished plays that found this answer (0–1). */
  foundRate: z.number(),
  isGolden: z.boolean(),
  foundByMe: z.boolean(),
});

export const LeaderboardEntry = z.object({
  rank: z.number(),
  profile: Profile,
  score: z.number(),
  foundGolden: z.boolean(),
});

export const Stats = z.object({
  gamesPlayed: z.number(),
  dailyGamesPlayed: z.number(),
  currentDailyStreak: z.number(),
  longestDailyStreak: z.number(),
  bestScore: z.number(),
  averageScore: z.number(),
  answersFound: z.number(),
  goldenRamsFound: z.number(),
});

export const PlaySummary = z.object({
  id: z.number(),
  promptId: z.number(),
  question: z.string(),
  mode: z.enum(["daily", "unlimited"]),
  score: z.number(),
  foundGolden: z.boolean(),
  finishedAt: z.date({ coerce: true }).nullable(),
});

export const Friend = z.object({
  profile: Profile,
  status: z.enum(["pending", "accepted"]),
  /** "outgoing" = I sent the request; "incoming" = they sent it to me. */
  direction: z.enum(["outgoing", "incoming"]),
  since: z.date({ coerce: true }),
});

export const Paginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ items: item.array(), nextCursor: z.number().nullable() });
