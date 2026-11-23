/**
 * Seeds categories, prompts and answers with UNC trivia.
 *
 * Run with:  npm run db:seed
 * Re-running clears categories, prompts and answers (and any plays of them).
 *
 * Sources (checked Nov 2026; re-check before the demo):
 * - Residence halls: housing.unc.edu "What's My Address" + Wikipedia "UNC-Chapel Hill student housing"
 * - Basketball: Wikipedia "List of North Carolina Tar Heels basketball honorees"
 * - Chancellors: Wikipedia "List of leaders of the University of North Carolina at Chapel Hill"
 * - Venues: goheels.com facilities + Wikipedia "North Carolina Tar Heels sports venues"
 * - Libraries: library.unc.edu
 */

import "dotenv/config";
import { client, db } from "./index";
import { todayInChapelHill } from "../api/scoring";
import { answersTable, categoriesTable, promptsTable } from "./schema";

type SeedAnswer = {
  text: string;
  aliases?: string[];
  /** 1–100 starting guess at how obscure this is. */
  rarity: number;
  golden?: boolean;
};

type SeedPrompt = {
  category: string;
  question: string;
  /** Daily prompts get consecutive dates starting the day the seed runs. */
  daily?: boolean;
  answers: SeedAnswer[];
};

const categories = [
  { slug: "campus", name: "Campus", description: "Buildings, dorms, quads and landmarks" },
  { slug: "sports", name: "Sports", description: "Tar Heel athletics, past and present" },
  { slug: "history", name: "History", description: "People and moments that shaped Carolina" },
  { slug: "academics", name: "Academics", description: "Schools, libraries and classes" },
  { slug: "dining", name: "Dining & Franklin St", description: "Where Tar Heels eat" },
  { slug: "chapel-hill", name: "Chapel Hill", description: "The town around the university" },
];

const hall = (text: string, rarity: number, extra: Partial<SeedAnswer> = {}): SeedAnswer => ({
  text,
  aliases: [`${text} Residence Hall`, `${text} Hall`],
  rarity,
  ...extra,
});

const prompts: SeedPrompt[] = [
  {
    category: "campus",
    question: "Name a UNC residence hall",
    daily: true,
    answers: [
      hall("Hinton James", 10, { aliases: ["HoJo", "Hinton James Residence Hall"] }),
      hall("Ehringhaus", 15, { aliases: ["Ehaus", "Ehringhaus Residence Hall"] }),
      hall("Craige", 20),
      hall("Morrison", 20),
      hall("Koury", 30),
      hall("Horton", 35),
      hall("Hardin", 40),
      hall("Craige North", 55, { golden: true }),
      hall("Carmichael", 35),
      hall("Parker", 50),
      hall("Avery", 50),
      hall("Teague", 55),
      hall("Old East", 30),
      hall("Old West", 35),
      hall("Grimes", 60),
      hall("Manly", 60),
      hall("Mangum", 55),
      hall("Ruffin", 55),
      hall("Graham", 60),
      hall("Lewis", 60),
      hall("Everett", 55),
      hall("Stacy", 65),
      hall("McClinton", 60, { aliases: ["Aycock", "McClinton Residence Hall"] }),
      hall("Spencer", 60),
      hall("Kenan", 55),
      hall("Alderman", 65),
      hall("McIver", 60),
      hall("Cobb", 50),
      hall("Connor", 60),
      hall("Winston", 60),
      hall("Alexander", 65),
      hall("Joyner", 65),
    ],
  },
  {
    category: "sports",
    question: "Name a UNC men's basketball player whose number is retired",
    daily: true,
    answers: [
      { text: "Michael Jordan", aliases: ["Jordan", "MJ"], rarity: 5 },
      { text: "James Worthy", aliases: ["Worthy"], rarity: 30 },
      { text: "Tyler Hansbrough", aliases: ["Hansbrough", "Psycho T"], rarity: 25 },
      { text: "Antawn Jamison", aliases: ["Jamison"], rarity: 45 },
      { text: "Phil Ford", aliases: ["Ford"], rarity: 55 },
      { text: "Lennie Rosenbluth", aliases: ["Rosenbluth"], rarity: 75 },
      { text: "George Glamack", aliases: ["Glamack"], rarity: 90 },
      { text: "Jack Cobb", aliases: ["Cobb"], rarity: 95, golden: true },
    ],
  },
  {
    category: "history",
    question: "Name a chancellor of UNC-Chapel Hill",
    daily: true,
    answers: [
      { text: "Lee Roberts", aliases: ["Roberts"], rarity: 10 },
      { text: "Kevin Guskiewicz", aliases: ["Guskiewicz", "Guskiewiecz"], rarity: 30 },
      { text: "Carol Folt", aliases: ["Folt", "Carol L. Folt"], rarity: 45 },
      { text: "Holden Thorp", aliases: ["Thorp", "Herbert Holden Thorp"], rarity: 60 },
      { text: "James Moeser", aliases: ["Moeser"], rarity: 70 },
      { text: "Michael Hooker", aliases: ["Hooker"], rarity: 75 },
      { text: "William McCoy", aliases: ["McCoy", "William Octavius McCoy"], rarity: 90 },
      { text: "Paul Hardin III", aliases: ["Paul Hardin", "Hardin"], rarity: 80 },
      { text: "Christopher Fordham", aliases: ["Fordham", "Christopher Columbus Fordham"], rarity: 80 },
      { text: "Ferebee Taylor", aliases: ["Nelson Ferebee Taylor", "Taylor"], rarity: 85 },
      { text: "Carlyle Sitterson", aliases: ["Sitterson", "Joseph Carlyle Sitterson"], rarity: 75 },
      { text: "Paul Sharp", aliases: ["Paul Frederick Sharp", "Sharp"], rarity: 95, golden: true },
      { text: "William Aycock", aliases: ["Aycock", "William Brantley Aycock", "Bill Aycock"], rarity: 85 },
      { text: "Robert House", aliases: ["Robert Burton House", "House"], rarity: 85 },
    ],
  },
  {
    category: "sports",
    question: "Name a venue that has hosted Tar Heel athletics",
    daily: true,
    answers: [
      { text: "Dean E. Smith Center", aliases: ["Dean Smith Center", "Smith Center", "Dean Dome"], rarity: 5 },
      { text: "Kenan Stadium", aliases: ["Kenan Memorial Stadium", "Kenan"], rarity: 10 },
      { text: "Carmichael Arena", aliases: ["Carmichael", "Carmichael Auditorium"], rarity: 35 },
      { text: "Boshamer Stadium", aliases: ["Boshamer", "The Bosh"], rarity: 45 },
      { text: "Fetzer Field", aliases: ["Fetzer"], rarity: 55 },
      { text: "Dorrance Field", aliases: ["Dorrance"], rarity: 60 },
      { text: "Woollen Gymnasium", aliases: ["Woollen Gym", "Woollen"], rarity: 65 },
      { text: "Finley Golf Course", aliases: ["Finley"], rarity: 70 },
      { text: "Eddie Smith Field House", aliases: ["Eddie Smith"], rarity: 85 },
      { text: "Henry Stadium", aliases: ["Francis E. Henry Stadium"], rarity: 85 },
      { text: "Anderson Stadium", aliases: ["Anderson Softball Stadium"], rarity: 75 },
      { text: "Koury Natatorium", aliases: ["Koury Nat", "Natatorium"], rarity: 75 },
      { text: "Cone-Kenfield Tennis Center", aliases: ["Cone Kenfield", "Kenfield"], rarity: 85 },
      { text: "Bynum Gymnasium", aliases: ["Bynum Gym", "Bynum Hall", "Bynum"], rarity: 90 },
      { text: "The Tin Can", aliases: ["Tin Can"], rarity: 95, golden: true },
    ],
  },
  {
    category: "academics",
    question: "Name a library at UNC-Chapel Hill",
    daily: true,
    answers: [
      { text: "Davis Library", aliases: ["Davis", "Walter Royal Davis Library"], rarity: 5 },
      { text: "Undergraduate Library", aliases: ["House Undergraduate Library", "UL", "House Library", "R.B. House"], rarity: 20 },
      { text: "Wilson Library", aliases: ["Wilson", "Louis Round Wilson Library"], rarity: 25 },
      { text: "Health Sciences Library", aliases: ["HSL"], rarity: 50 },
      { text: "Kenan Science Library", aliases: ["Kenan Science", "Science Library"], rarity: 60 },
      { text: "Law Library", aliases: ["Kathrine R. Everett Law Library", "Everett Law Library"], rarity: 70 },
      { text: "Music Library", rarity: 75 },
      { text: "Sloane Art Library", aliases: ["Art Library", "Sloane Art"], rarity: 75 },
      { text: "Park Library", aliases: ["Park"], rarity: 85 },
      { text: "SILS Library", aliases: ["School of Information and Library Science Library", "Manning Hall Library"], rarity: 85 },
      { text: "Stone Center Library", aliases: ["Stone Center"], rarity: 90, golden: true },
    ],
  },
  {
    category: "sports",
    question: "Name a year UNC won the men's basketball national championship",
    answers: [
      { text: "2017", rarity: 15 },
      { text: "2009", rarity: 20 },
      { text: "2005", rarity: 25 },
      { text: "1982", rarity: 35 },
      { text: "1993", rarity: 40 },
      { text: "1957", rarity: 65 },
      // Helms Foundation title, awarded retroactively.
      { text: "1924", rarity: 95, golden: true },
    ],
  },
  {
    category: "sports",
    question: "Name a UNC men's basketball player with an honored or retired jersey",
    answers: [
      ...[
        ["Michael Jordan", 5], ["James Worthy", 20], ["Vince Carter", 15], ["Tyler Hansbrough", 20],
        ["Sam Perkins", 40], ["Antawn Jamison", 35], ["Rasheed Wallace", 35], ["Jerry Stackhouse", 35],
        ["Phil Ford", 50], ["Ty Lawson", 40], ["Raymond Felton", 40], ["Sean May", 45],
        ["Harrison Barnes", 35], ["Tyler Zeller", 50], ["Marcus Paige", 45], ["Joel Berry II", 45],
        ["Justin Jackson", 45], ["Brice Johnson", 50], ["R. J. Davis", 40], ["Wayne Ellington", 50],
        ["Rashad McCants", 55], ["Brendan Haywood", 55], ["Joseph Forte", 70], ["Eric Montross", 50],
        ["Donald Williams", 70], ["George Lynch", 65], ["J.R. Reid", 65], ["Kenny Smith", 50],
        ["Brad Daugherty", 55], ["Al Wood", 80], ["Mike O'Koren", 80], ["Walter Davis", 65],
        ["Mitch Kupchak", 70], ["Bobby Jones", 75], ["Tommy LaGarde", 85], ["Bob McAdoo", 60],
        ["Dennis Wuycik", 90], ["Bill Chamberlain", 85], ["Charlie Scott", 60], ["Larry Miller", 75],
        ["Bob Lewis", 85], ["Billy Cunningham", 60], ["Larry Brown", 60], ["Doug Moe", 75],
        ["York Larese", 90], ["Lee Shaffer", 90], ["Tommy Kearns", 85], ["Pete Brennan", 85],
        ["Lennie Rosenbluth", 70], ["John Dillon", 92], ["Jim Jordan", 92], ["George Glamack", 90],
        ["Jack Cobb", 92],
      ].map(([text, rarity], _i, all) => {
        // Accept a bare last name only when no other honoree shares it (Jordan, Davis).
        const last = (n: string) => n.replace(/ (II|III)$/, "").split(" ").slice(-1)[0];
        const surname = last(text as string);
        const unique = all.filter(([n]) => last(n as string) === surname).length === 1;
        return { text: text as string, aliases: unique ? [surname] : [], rarity: rarity as number };
      }),
      { text: "Cartwright Carmichael", aliases: ["Carmichael"], rarity: 97, golden: true },
    ],
  },
];

async function main() {
  await db.delete(answersTable);
  await db.delete(promptsTable);
  await db.delete(categoriesTable);

  const insertedCategories = await db.insert(categoriesTable).values(categories).returning();
  const categoryId = Object.fromEntries(insertedCategories.map((c) => [c.slug, c.id]));

  const day = new Date(`${todayInChapelHill()}T12:00:00Z`);
  for (const p of prompts) {
    const dailyDate = p.daily ? day.toISOString().slice(0, 10) : null;
    if (p.daily) day.setUTCDate(day.getUTCDate() + 1);
    const [prompt] = await db
      .insert(promptsTable)
      .values({ categoryId: categoryId[p.category], question: p.question, dailyDate })
      .returning();
    await db.insert(answersTable).values(
      p.answers.map((a) => ({
        promptId: prompt.id,
        text: a.text,
        aliases: a.aliases ?? [],
        baseRarity: a.rarity,
        isGolden: a.golden ?? false,
      })),
    );
    console.log(`Seeded "${p.question}" (${p.answers.length} answers${dailyDate ? `, daily on ${dailyDate}` : ""})`);
  }
  await client.end();
}

main().catch(async (err) => {
  console.error(err);
  await client.end();
  process.exit(1);
});
