# Tarillion 🐏

A daily UNC trivia game where **the more obscure your answer, the more it's worth.** Every day everyone gets the same prompt ("Name a UNC residence hall"). Type as many answers as you can before three strikes. Answers score by rarity, and one hidden **Golden Ram** answer is worth a big bonus.

COMP 426 Final Project, Fall 2026.

- 📄 [Project description](docs/PROJECT_DESCRIPTION.md)
- 🗄️ [Database schema & API documentation](docs/SCHEMA_AND_API.md) ([diagram](docs/schema-diagram.png))

## Stack

Next.js (App Router) · TypeScript · tRPC · Drizzle ORM · Supabase (Postgres, Auth, Storage) · Tailwind + shadcn/ui · Vercel

## Getting started

```bash
npm install
cp .env.example .env    # fill in values from the Supabase dashboard
npm run db:push         # create the tables in Supabase
npm run db:seed         # load the UNC categories, prompts and answers
npm run dev             # http://localhost:3000
```

## Project structure

| Path | What it is |
| --- | --- |
| `app/` | Pages (App Router). `login/`, `signup/` are done; the game pages are next |
| `app/api/trpc/[trpc]/route.ts` | tRPC HTTP endpoint |
| `server/db/schema.ts` | Drizzle table definitions (7 tables) |
| `server/db/relations.ts` | Drizzle relations |
| `server/db/seed.ts` | UNC trivia seed data (7 prompts, sourced from unc.edu / Wikipedia) |
| `server/models/inputs.ts`, `responses.ts` | Zod input / output models: the API contract |
| `server/api/routers/` | tRPC routers: `profiles`, `categories`, `prompts`, `game`, `leaderboard`, `friends`, `stats` |
| `utils/supabase/` | Supabase clients, auth helpers, storage upload helpers |

Procedures that still throw `NOT_IMPLEMENTED` already have their final input and output types, so front-end work can start against them now. See `docs/SCHEMA_AND_API.md` for what each one must do.

## Team

| Name | Focus |
| --- | --- |
| Maxwell Hu | |
| Yewon Song | |
| Ethan Tran | |
| Aiden Li | |
