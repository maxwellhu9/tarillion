/**
 * Zod models for the inputs accepted by tRPC procedures.
 * These are the source of truth for the input shapes in docs/SCHEMA_AND_API.md.
 */

import { z } from "zod";

export const PaginationParams = z.object({
  cursor: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(50).default(20),
});

export const ProfileIdentity = z.object({ profileId: z.string() });
export const ProfileHandle = z.object({ handle: z.string() });
export const NewUser = z.object({
  name: z.string().min(1).max(50),
  handle: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-z0-9_]+$/, "lowercase letters, numbers, underscores"),
});
export const ProfileUpdate = NewUser.partial();
export const DraftProfileImage = z.object({ avatarUrl: z.string().nullable() });
export const ProfileSearch = z.object({ query: z.string().min(1).max(30) });

export const PromptIdentity = z.object({ promptId: z.number().int() });
export const RandomPromptParams = z.object({
  categorySlug: z.string().optional(),
});
export const ArchiveParams = PaginationParams.extend({
  categorySlug: z.string().optional(),
});

export const PlayMode = z.enum(["daily", "unlimited"]);
export const StartPlay = z.object({
  promptId: z.number().int(),
  mode: PlayMode,
});
export const PlayIdentity = z.object({ playId: z.number().int() });
export const SubmitGuess = z.object({
  playId: z.number().int(),
  text: z.string().trim().min(1).max(80),
});

/** `date` is YYYY-MM-DD; defaults to today (America/New_York). */
export const DailyLeaderboardParams = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  limit: z.number().int().min(1).max(100).default(25),
});
export const LeaderboardParams = z.object({
  limit: z.number().int().min(1).max(100).default(25),
});

export const FriendRequest = z.object({ handle: z.string() });
export const FriendResponse = z.object({
  requesterId: z.string(),
  accept: z.boolean(),
});
