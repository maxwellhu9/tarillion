# Tarillion: Project Idea Description

**COMP 426 Final Project, Fall 2026**

**Team:** Maxwell Hu, Yewon Song, Ethan Tran, Aiden Li

**Repository:** https://github.com/maxwellhu9/tarillion

## Summary

**Tarillion** is a daily trivia game about UNC that rewards you for knowing the obscure answers. Each day every player gets the same open-ended prompt, like _"Name a residence hall at UNC"_, _"Name a UNC men's basketball player with an honored jersey"_ or _"Name a restaurant on Franklin Street"_. Players type as many valid answers as they can think of before collecting three strikes (wrong answers).

The scoring makes it interesting: **an answer earns more points the fewer other players found it.** Everyone gets a few points for "Lenoir", but naming "Chase" or "Carmichael" pays off. Each prompt also hides one **Golden Ram**, a deep-cut answer worth a large bonus. When a player finishes, they see the full answer list with each answer's live rarity, the answers they missed, and where they placed on the daily leaderboard compared with friends and the rest of campus.

The game is built for UNC students, alumni and fans who know the campus, its history, its sports and Chapel Hill. Besides the daily prompt there is an Unlimited mode for playing past and extra prompts by category, plus profiles, streaks, stats and friends.

**Stack:** Next.js (App Router) + TypeScript, tRPC, Drizzle ORM, Supabase (Postgres, Auth, Storage), Tailwind + shadcn/ui, deployed on Vercel.

## Main Features

### 1. Daily Heel (core game)
- **Description:** One shared UNC prompt per day, the same for every player. The player submits answers one at a time. The server checks each guess against the answer list using aliases and fuzzy matching, so "Davis Library", "Davis" and "davis lib" all count. A correct guess earns rarity points, a wrong guess is a strike, and three strikes (or quitting) ends the round. Each player gets one scored daily attempt.
- **User:** Every player (signed-in UNC students, alumni and fans).
- **Purpose:** A short daily ritual (about 2 minutes) that tests how well you really know UNC. Because everyone plays the same prompt, results are directly comparable and worth sharing, which brings players back every day.

### 2. Rarity scoring and the Golden Ram
- **Description:** Each answer's value is recalculated from how many players found it: `rarity = 100 × (1 − share of players who found it)`, kept between 5 and 100. New prompts start from a seeded base rarity until about 20 people have played. One hidden answer per prompt is the Golden Ram (+250 points). After finishing, the player sees the full reveal screen with every answer's rarity and found-rate, which answers they got, and which they missed.
- **User:** Every player, especially competitive players and UNC trivia nerds.
- **Purpose:** This is what makes the game different from a normal quiz. It rewards deep, specific knowledge over obvious answers, and the reveal screen is the "I can't believe I forgot Hinton James" moment that people share.

### 3. Leaderboards (daily, all-time, friends)
- **Description:** A daily leaderboard for the current prompt (or any past date), an all-time leaderboard of total daily scores, and a friends-only daily leaderboard. Entries show rank, avatar, handle, score and a Golden Ram badge.
- **User:** Competitive players and friend groups; guests can view the public boards without logging in.
- **Purpose:** Competition is the main reason to come back. The friends board turns the game into a group-chat rivalry ("who found the most dorms?").

### 4. Accounts, profiles and stats
- **Description:** Players sign up with email and password, choose a display name and a unique handle, and can upload an avatar. A profile page shows games played, current and longest daily streak, best and average score, total answers found, Golden Rams found, and a history of past plays.
- **User:** Signed-in returning players.
- **Purpose:** Streaks and lifetime stats give players a reason to play every day, and a public profile is what friends and leaderboard visitors click on.

### 5. Friends
- **Description:** Search for players by handle, send friend requests, accept or decline incoming requests, and remove friends. Accepted friends make up the friends leaderboard.
- **User:** Signed-in players who play with roommates, classmates or group chats.
- **Purpose:** Playing against people you know is more motivating than a campus-wide board alone, and it is the social hook for the app.

### 6. Unlimited mode and archive
- **Description:** Browse past Daily Heels in an archive, or play random extra prompts filtered by category (Campus, Sports, Dining & Franklin St, History, Academics, Chapel Hill). Unlimited plays count toward stats but not the daily leaderboard.
- **User:** Players who want more than one prompt a day, and new players catching up on past days.
- **Purpose:** Keeps engaged players playing longer and lets them focus on the parts of UNC they know best.

## Features → Backend Technology

### Database (Supabase Postgres via Drizzle ORM)
| Feature | Tables used |
| --- | --- |
| Daily Heel / Unlimited | `prompts` (with `daily_date`), `categories`, `answers` (aliases, Golden Ram flag) |
| Rarity scoring | `answers.times_found` with a count of finished `plays` for each prompt |
| Playing a round | `plays` (score, strikes, status) and `guesses` (each submission, matched answer, points) |
| Leaderboards | aggregate queries over `plays` joined with `profiles` |
| Profiles and stats | `profiles`, aggregates over `plays` / `guesses` |
| Friends | `friendships` (a self-referencing many-to-many on `profiles`) |

The schema has 7 tables, including many-to-one relationships (`prompts → categories`, `answers → prompts`, `guesses → plays`) and many-to-many relationships (`profiles ↔ prompts` through `plays`, `profiles ↔ profiles` through `friendships`, `plays ↔ answers` through `guesses`). The full schema is in `SCHEMA_AND_API.md`.

All answer checking and scoring runs **on the server** inside tRPC procedures, so the answer list is never sent to the browser until the player has finished. This keeps players from cheating by inspecting network traffic.

### Authentication (Supabase Auth)
- Email/password sign-up and login through Supabase Auth, using the same pattern as A05 (`@supabase/ssr` cookies refreshed in `proxy.ts`).
- After sign-up, `profiles.handleNewUser` creates the profile row keyed by the Supabase user id.
- tRPC has `publicProcedure`s (today's prompt, archive, public leaderboards, public profiles) and `protectedProcedure`s (playing, friends, personal stats), which throw `UNAUTHORIZED` without a valid session.
- Guests can browse the prompt, leaderboards and profiles, but must log in to play, so every scored play belongs to a real user.

### Storage (Supabase Storage)
- **`avatars` bucket:** profile pictures uploaded from the profile page and shown on profiles, leaderboards and friends lists.
- **`category-icons` bucket:** artwork for each category (for example the Old Well for Campus), shown on prompt cards and the Unlimited mode picker.
- **Stretch goal, `share-cards` bucket:** a generated image of a player's daily result (score, Golden Ram badge, emoji grid) that they can post to social media or a group chat.
