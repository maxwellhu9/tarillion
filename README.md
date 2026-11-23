# Tarillion

A daily UNC trivia game where rarer answers score more points. COMP 426 Final Project, Fall 2026.

Team: Maxwell Hu, Yewon Song, Ethan Tran, Aiden Li

- [Project description](docs/PROJECT_DESCRIPTION.md)
- [Database schema and API](docs/SCHEMA_AND_API.md)

## Setup

```bash
npm install
cp .env.example .env   # add Supabase values
npm run db:push        # create tables
npm run db:seed        # add UNC prompts and answers
npm run dev
```

## Structure

- `app/` pages
- `server/db/` schema, relations, seed data
- `server/models/` Zod input and output types
- `server/api/routers/` tRPC procedures (unfinished ones throw NOT_IMPLEMENTED)
- `utils/` Supabase and tRPC clients
