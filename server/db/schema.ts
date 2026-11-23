/**
 * Database schema for Tarillion (all tables).
 *
 * Relations between these tables are defined separately in `relations.ts`.
 * Push this schema to Supabase with:
 * ```
 * npx drizzle-kit push
 * ```
 *
 * Relationship summary:
 * - many-to-one:  prompts → categories, answers → prompts, plays → profiles,
 *                 plays → prompts, guesses → plays, guesses → answers
 * - many-to-many: profiles ↔ prompts   (through `plays`)
 *                 profiles ↔ profiles  (through `friendships`)
 *                 plays    ↔ answers   (through `guesses`)
 */

import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const playModeEnum = pgEnum("play_mode", ["daily", "unlimited"]);
export const playStatusEnum = pgEnum("play_status", ["in_progress", "finished"]);
export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
]);

/**
 * `profiles` — one row per signed-up user. `id` matches the Supabase
 * `auth.users.id` of that user.
 */
export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  handle: text("handle").notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * `categories` — topic buckets for prompts (Campus, Sports, Dining,
 * History, Chapel Hill, Academics, ...). `iconUrl` is a path in the
 * `category-icons` storage bucket.
 */
export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  iconUrl: text("icon_url"),
});

/**
 * `prompts` — one question, e.g. "Name a UNC residence hall".
 * `dailyDate` is set when the prompt is (or was) the Daily Heel for that
 * date; prompts with a null `dailyDate` are Unlimited-only.
 */
export const promptsTable = pgTable("prompts", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "restrict" }),
  question: text("question").notNull(),
  dailyDate: date("daily_date", { mode: "string" }).unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * `answers` — every accepted answer to a prompt. `aliases` holds alternate
 * spellings/nicknames ("Lenoir", "Lenoir Dining Hall"). Exactly one answer
 * per prompt may be the Golden Ram (`isGolden`).
 *
 * `timesFound` is a running counter used to compute live rarity.
 */
export const answersTable = pgTable("answers", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id")
    .notNull()
    .references(() => promptsTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  aliases: text("aliases").array().notNull().default(sql`'{}'::text[]`),
  baseRarity: integer("base_rarity").notNull().default(50),
  isGolden: boolean("is_golden").notNull().default(false),
  timesFound: integer("times_found").notNull().default(0),
});

/**
 * `plays` — one attempt by one user at one prompt. Junction table for the
 * profiles ↔ prompts many-to-many relationship. A user gets only one
 * daily-mode play per prompt (partial unique index).
 */
export const playsTable = pgTable(
  "plays",
  {
    id: serial("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profilesTable.id, { onDelete: "cascade" }),
    promptId: integer("prompt_id")
      .notNull()
      .references(() => promptsTable.id, { onDelete: "cascade" }),
    mode: playModeEnum("mode").notNull(),
    status: playStatusEnum("status").notNull().default("in_progress"),
    score: integer("score").notNull().default(0),
    strikes: integer("strikes").notNull().default(0),
    foundGolden: boolean("found_golden").notNull().default(false),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    finishedAt: timestamp("finished_at"),
  },
  (t) => [
    uniqueIndex("plays_one_daily_per_user")
      .on(t.profileId, t.promptId)
      .where(sql`${t.mode} = 'daily'`),
  ],
);

/**
 * `guesses` — every submission during a play. `answerId` is null for a
 * wrong guess (a strike). Junction table for plays ↔ answers.
 */
export const guessesTable = pgTable("guesses", {
  id: serial("id").primaryKey(),
  playId: integer("play_id")
    .notNull()
    .references(() => playsTable.id, { onDelete: "cascade" }),
  answerId: integer("answer_id").references(() => answersTable.id, {
    onDelete: "set null",
  }),
  rawText: text("raw_text").notNull(),
  points: integer("points").notNull().default(0),
  guessedAt: timestamp("guessed_at").notNull().defaultNow(),
});

/**
 * `friendships` — self-referencing many-to-many on profiles.
 * `requesterId` sent the request; `addresseeId` received it.
 */
export const friendshipsTable = pgTable(
  "friendships",
  {
    requesterId: text("requester_id")
      .notNull()
      .references(() => profilesTable.id, { onDelete: "cascade" }),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => profilesTable.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.requesterId, t.addresseeId] })],
);
