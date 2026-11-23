/**
 * Queries shared by several routers that build the `Prompt` and `Play`
 * response shapes.
 */

import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { Play, Prompt } from "@/server/models/responses";
import { MAX_STRIKES } from "./scoring";

const promptFields = {
  with: {
    category: true,
    answers: { columns: { id: true } },
  },
} as const;

type PromptRow = NonNullable<
  Awaited<ReturnType<typeof db.query.promptsTable.findFirst<typeof promptFields>>>
>;

export function toPrompt(row: PromptRow) {
  return Prompt.parse({ ...row, answerCount: row.answers.length });
}

/** Loads one prompt (never its answers). Throws NOT_FOUND. */
export async function loadPrompt(promptId: number) {
  const row = await db.query.promptsTable.findFirst({
    ...promptFields,
    where: { id: promptId },
  });
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Prompt not found." });
  return toPrompt(row);
}

/** Loads one play with its prompt and guesses. Throws NOT_FOUND / FORBIDDEN. */
export async function loadPlay(playId: number, profileId: string) {
  const row = await db.query.playsTable.findFirst({
    where: { id: playId },
    with: {
      prompt: promptFields,
      guesses: {
        orderBy: { guessedAt: "asc", id: "asc" },
        with: { answer: { columns: { text: true, isGolden: true } } },
      },
    },
  });
  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Play not found." });
  if (row.profileId !== profileId) throw new TRPCError({ code: "FORBIDDEN" });

  return Play.parse({
    ...row,
    prompt: toPrompt(row.prompt),
    maxStrikes: MAX_STRIKES,
    guesses: row.guesses.map((g) => ({
      ...g,
      matchedAnswer: g.answer?.text ?? null,
      isGolden: g.answer?.isGolden ?? false,
    })),
  });
}
