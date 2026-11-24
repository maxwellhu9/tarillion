# Tarillion: Project Idea Description

COMP 426 Final Project, Fall 2026

Team: Maxwell Hu, Yewon Song, Ethan Tran, Aiden Li

## Summary

Tarillion is a daily UNC trivia game. Every day all players get the same three open-ended prompts, such as "Name a UNC residence hall". For each prompt, players type as many valid answers as they can until they make three wrong guesses. An answer is worth more points the fewer other players found it, so obscure answers beat obvious ones. Each prompt also hides one bonus answer, the Golden Ram: a niche, rare answer that few players are likely to know. After finishing a prompt, players see every answer with its rarity and how they ranked against friends and other players.

Stack: Next.js, TypeScript, tRPC, Drizzle ORM, Supabase (Postgres, Auth, Storage), deployed on Vercel.

## Features

### 1. Daily prompts

- Description: Three shared UNC prompts per day, each played as its own round. The server checks each guess against the answer list, accepting alternate spellings. A correct guess earns points, a wrong guess is a strike, and three strikes ends that round. Strikes reset for each prompt. One scored attempt per prompt. The daily score is the total across all three rounds.
- User: All players.
- Purpose: A short daily game whose results can be compared, since everyone plays the same prompts. Three prompts give variety and keep one unfamiliar topic from deciding the day.

### 2. Rarity scoring and the Golden Ram

- Description: Each answer's points are based on the share of players who found it (5 to 100 points). Each prompt has one hidden Golden Ram, a niche, rare answer chosen in advance, worth a 250 point bonus. After finishing a prompt, players see the full answer list with rarity and which answers they missed.
- User: All players.
- Purpose: Rewards knowing UNC well, not just naming the most common answers.

### 3. Leaderboards

- Description: Daily, all-time, and friends-only leaderboards showing rank, handle, score, and whether the player found a Golden Ram. The daily score is the total across the three prompts.
- User: Competitive players and friend groups. Guests can view the public leaderboards.
- Purpose: Gives players a reason to return and compete.

### 4. Accounts, profiles, and stats

- Description: Sign up with email and password, choose a name and handle, upload an avatar. Profiles show games played, daily streak, best and average score, answers found, and play history.
- User: Signed-in players.
- Purpose: Streaks and stats encourage playing every day.

### 5. Friends

- Description: Search players by handle, send, accept, or decline friend requests, and remove friends.
- User: Signed-in players.
- Purpose: Powers the friends leaderboard.

### 6. Unlimited mode and archive

- Description: Play past daily prompts or random extra prompts by category (Campus, Sports, History, Academics, Dining, Chapel Hill). These count toward stats but not the daily leaderboard.
- User: Players who want more than the three daily prompts.
- Purpose: More content for engaged and new players.

## Backend

### Database

Supabase Postgres with 7 tables: profiles, categories, prompts, answers, plays, guesses, friendships.

- Daily prompts and Unlimited mode: prompts, categories, answers
- Scoring: answers.times_found compared with the number of finished plays
- Rounds: plays and guesses
- Leaderboards and stats: queries over plays joined with profiles
- Friends: friendships

Many-to-one: prompts to categories, answers to prompts, guesses to plays.
Many-to-many: profiles and prompts (through plays), profiles and profiles (through friendships), plays and answers (through guesses).

Answer checking runs on the server, so the answer list is never sent to the browser before the player finishes that prompt.

### Authentication

Supabase Auth with email and password, as in A05. After sign-up, a profile row is created with the user's id. Public tRPC procedures (today's prompts, archive, public leaderboards, profiles) work without logging in. Protected procedures (playing, friends, personal stats) require a session. Guests can browse but must log in to play.

### Storage

- avatars bucket: profile pictures.
- category-icons bucket: an image for each category.
