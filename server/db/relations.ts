/**
 * Relations between the tables in `schema.ts`, for Drizzle's relational
 * query API (`db.query.<table>.findMany({ with: ... })`).
 *
 * @see https://orm.drizzle.team/docs/relations-v2
 */

import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  profilesTable: {
    plays: r.many.playsTable({
      from: r.profilesTable.id,
      to: r.playsTable.profileId,
    }),
    playedPrompts: r.many.promptsTable({
      from: r.profilesTable.id.through(r.playsTable.profileId),
      to: r.promptsTable.id.through(r.playsTable.promptId),
    }),
    sentFriendRequests: r.many.friendshipsTable({
      from: r.profilesTable.id,
      to: r.friendshipsTable.requesterId,
      alias: "requester",
    }),
    receivedFriendRequests: r.many.friendshipsTable({
      from: r.profilesTable.id,
      to: r.friendshipsTable.addresseeId,
      alias: "addressee",
    }),
  },

  categoriesTable: {
    prompts: r.many.promptsTable({
      from: r.categoriesTable.id,
      to: r.promptsTable.categoryId,
    }),
  },

  promptsTable: {
    category: r.one.categoriesTable({
      from: r.promptsTable.categoryId,
      to: r.categoriesTable.id,
      optional: false,
    }),
    answers: r.many.answersTable({
      from: r.promptsTable.id,
      to: r.answersTable.promptId,
    }),
    plays: r.many.playsTable({
      from: r.promptsTable.id,
      to: r.playsTable.promptId,
    }),
  },

  answersTable: {
    prompt: r.one.promptsTable({
      from: r.answersTable.promptId,
      to: r.promptsTable.id,
      optional: false,
    }),
    guesses: r.many.guessesTable({
      from: r.answersTable.id,
      to: r.guessesTable.answerId,
    }),
  },

  playsTable: {
    profile: r.one.profilesTable({
      from: r.playsTable.profileId,
      to: r.profilesTable.id,
      optional: false,
    }),
    prompt: r.one.promptsTable({
      from: r.playsTable.promptId,
      to: r.promptsTable.id,
      optional: false,
    }),
    guesses: r.many.guessesTable({
      from: r.playsTable.id,
      to: r.guessesTable.playId,
    }),
    foundAnswers: r.many.answersTable({
      from: r.playsTable.id.through(r.guessesTable.playId),
      to: r.answersTable.id.through(r.guessesTable.answerId),
    }),
  },

  guessesTable: {
    play: r.one.playsTable({
      from: r.guessesTable.playId,
      to: r.playsTable.id,
      optional: false,
    }),
    answer: r.one.answersTable({
      from: r.guessesTable.answerId,
      to: r.answersTable.id,
    }),
  },

  friendshipsTable: {
    requester: r.one.profilesTable({
      from: r.friendshipsTable.requesterId,
      to: r.profilesTable.id,
      optional: false,
      alias: "requester",
    }),
    addressee: r.one.profilesTable({
      from: r.friendshipsTable.addresseeId,
      to: r.profilesTable.id,
      optional: false,
      alias: "addressee",
    }),
  },
}));
