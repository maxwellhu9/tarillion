import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  out: "./supabase/migrations",
  // Drizzle Kit 1.0 manages *every* Postgres schema by default. Supabase owns
  // several of its own schemas (auth, storage, etc.), so we limit Drizzle to
  // the `public` schema where our tables live.
  schemaFilter: ["public"],
  dbCredentials: {
    // drizzle-kit hangs on Supabase's transaction pooler (port 6543), so it
    // uses the session pooler on the same host (port 5432) instead.
    url: process.env.DATABASE_URL!.replace(":6543/", ":5432/"),
  },
});
