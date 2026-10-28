import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { boards, categories, questions, users } from '../src/lib/server/db/schema.ts';

const url = process.env.DATABASE_URL ?? 'file:local.db';
const authToken = process.env.DATABASE_AUTH_TOKEN;

const client = createClient({ url, authToken });
const db = drizzle(client);

const SEED_USER = {
  id: 'seed-user-id',
  email: 'seed@banned-books-jeopardy.local',
  name: 'Seed Admin',
  role: 'administrator'
};

const SEED_BOARD = {
  title: 'Banned Books Trivia',
  description: 'Test your knowledge of frequently challenged and banned books',
  published: true
};

const CATEGORIES = [
  {
    name: 'Classic Novels',
    questions: [
      {
        question: 'This 1960 novel by Harper Lee features Scout Finch',
        answer: 'What is To Kill a Mockingbird?'
      },
      {
        question: 'J.D. Salinger wrote this 1951 novel about Holden Caulfield',
        answer: 'What is The Catcher in the Rye?'
      },
      { question: "George Orwell's dystopian novel set in Oceania", answer: 'What is 1984?' },
      {
        question: "Ray Bradbury's novel about book-burning firemen",
        answer: 'What is Fahrenheit 451?'
      },
      {
        question: "John Steinbeck's novel about the Joad family during the Depression",
        answer: 'What is The Grapes of Wrath?'
      }
    ]
  },
  {
    name: 'Young Adult',
    questions: [
      {
        question: 'This series by J.K. Rowling features a boy wizard',
        answer: 'What is Harry Potter?'
      },
      {
        question: "Suzanne Collins' dystopian trilogy featuring Katniss Everdeen",
        answer: 'What is The Hunger Games?'
      },
      {
        question: "Judy Blume's coming-of-age novel about Margaret",
        answer: "What is Are You There God? It's Me, Margaret?"
      },
      {
        question: "Jay Asher's novel about Hannah Baker's cassette tapes",
        answer: 'What is Thirteen Reasons Why?'
      },
      {
        question: "Laurie Halse Anderson's novel about teen trauma and silence",
        answer: 'What is Speak?'
      }
    ]
  },
  {
    name: 'Authors',
    questions: [
      { question: 'Author of "The Handmaid\'s Tale"', answer: 'Who is Margaret Atwood?' },
      { question: 'Author of "Slaughterhouse-Five"', answer: 'Who is Kurt Vonnegut?' },
      { question: 'Author of "Beloved" and Nobel Prize winner', answer: 'Who is Toni Morrison?' },
      { question: 'Author of "A Clockwork Orange"', answer: 'Who is Anthony Burgess?' },
      { question: 'Author of "Brave New World"', answer: 'Who is Aldous Huxley?' }
    ]
  },
  {
    name: 'Controversy',
    questions: [
      {
        question: 'Common reason books are challenged in schools',
        answer: 'What is explicit content or profanity?'
      },
      {
        question: 'Week in September celebrating freedom to read',
        answer: 'What is Banned Books Week?'
      },
      {
        question: 'Organization that tracks book challenges',
        answer: 'What is the American Library Association?'
      },
      { question: 'State that banned the most books in 2022-2023', answer: 'What is Florida?' },
      {
        question: 'Constitutional amendment protecting freedom of speech',
        answer: 'What is the First Amendment?'
      }
    ]
  },
  {
    name: 'Themes',
    questions: [
      {
        question: 'Books featuring LGBTQ+ characters are often challenged for this reason',
        answer: 'What is sexual content or "promoting a lifestyle"?'
      },
      {
        question: 'Theme in "The Perks of Being a Wallflower"',
        answer: 'What is mental health or coming of age?'
      },
      {
        question: 'Central theme in "Lord of the Flies"',
        answer: 'What is human nature or civilization vs savagery?'
      },
      {
        question: 'Theme that got "The Bluest Eye" frequently challenged',
        answer: 'What is racial identity or sexual violence?'
      },
      {
        question: 'Philosophical theme in "Brave New World"',
        answer: 'What is dystopian society or loss of individuality?'
      }
    ]
  }
];

const VALUES = [100, 200, 300, 400, 500];

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'player',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    created_by TEXT NOT NULL REFERENCES users(id),
    published INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    value INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    time_limit INTEGER NOT NULL DEFAULT 30,
    "order" INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  )`,
  `CREATE TABLE IF NOT EXISTS game_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL REFERENCES boards(id),
    started_by TEXT REFERENCES users(id),
    started_at INTEGER NOT NULL DEFAULT (unixepoch()),
    completed_at INTEGER
  )`
];

async function main() {
  for (const statement of SCHEMA_STATEMENTS) {
    await client.execute(statement);
  }

  await db.delete(questions);
  await db.delete(categories);
  await db.delete(boards);
  await db.delete(users);

  await db.insert(users).values(SEED_USER);

  const [board] = await db
    .insert(boards)
    .values({
      title: SEED_BOARD.title,
      description: SEED_BOARD.description,
      createdBy: SEED_USER.id,
      published: SEED_BOARD.published
    })
    .returning();

  let questionCount = 0;
  for (let i = 0; i < CATEGORIES.length; i++) {
    const category = CATEGORIES[i];
    const [inserted] = await db
      .insert(categories)
      .values({ boardId: board.id, name: category.name, order: i })
      .returning();

    for (let j = 0; j < category.questions.length; j++) {
      const q = category.questions[j];
      await db.insert(questions).values({
        categoryId: inserted.id,
        value: VALUES[j],
        question: q.question,
        answer: q.answer,
        timeLimit: 30,
        order: j
      });
      questionCount++;
    }
  }

  console.log(
    `Seeded board "${board.title}" (id ${board.id}) with ${CATEGORIES.length} categories and ${questionCount} questions.`
  );
  await client.close();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
