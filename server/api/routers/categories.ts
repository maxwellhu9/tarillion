/** Category procedures. See docs/SCHEMA_AND_API.md § categories. */

import { Category } from "@/server/models/responses";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { notImplemented } from "./_todo";

const getCategories = publicProcedure
  .output(Category.array())
  .query(notImplemented);

export const categoriesApiRouter = createTRPCRouter({ getCategories });
