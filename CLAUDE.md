# AI Assistant Onboarding Guide

**Project**: Banned Books Jeopardy
**Repository**: <https://github.com/Imamiland/banned_books_jeopardy>
**Purpose**: Interactive Jeopardy game for live Banned Books Coalition events at University of Toledo
**Hosting**: Cloudflare Pages (Direct Upload, deployed with Wrangler through `mise`)

---

## Table of Contents

- [How To Use This Document](#how-to-use-this-document)
- [Project Overview](#project-overview)
- [Current Status](#current-status)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database](#database)
- [Authentication and Authorization](#authentication-and-authorization)
- [Environment Variables](#environment-variables)
- [Development Setup](#development-setup)
- [Key Features](#key-features)
- [File Structure](#file-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Deployment](#deployment)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Resources and Quick Reference](#resources-and-quick-reference)

---

## How To Use This Document

This file is written for AI coding assistants. Read this whole section before changing any code.

### Status markers

Every feature or file in this document is in one of three states. Do not assume something exists just because it is described here.

| Marker            | Meaning                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- |
| ✅ **DONE**       | Exists in the repository and works.                                                      |
| ⚠️ **INCOMPLETE** | Exists but is a mock, a stub, or has known problems. Details are given where it appears. |
| 🔲 **PLANNED**    | Does **not** exist yet. This document gives the target design and code to build it.      |

### Ground-truth checks (run these first)

This document can be out of date. Before you rely on a statement about a file, confirm it:

```bash
git status --short                      # uncommitted changes?
ls src/lib/stores src/lib/components    # real store and component file names
ls src/lib/server src/lib/server/auth   # real server files
ls src/routes src/routes/auth           # real route files
cat svelte.config.js                    # which adapter? is csrf disabled?
cat .mise.toml                          # which tools and tasks exist?
mise tasks                              # list every task you may run
grep -E '"(packageManager|@sveltejs/adapter[^"]*|@libsql/client|drizzle-orm|jose|wrangler)"' package.json
```

**Conflict rule**: If this document and the code disagree about what _exists_, trust the code. If they disagree about what _should_ be built, trust this document. In both cases, tell the user about the disagreement in your final message.

### Rules you must follow

**DO**

- Read the files you are about to change before changing them.
- Make small, focused changes. One task per commit.
- Run every command through `mise run <task>` (see [mise Tasks](#mise-tasks)). Use `mise exec -- <command>` for a one-off command that has no task.
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`) for component state.
- Keep all server-only code under `src/lib/server/` or in `+page.server.ts` / `+server.ts` / `hooks.server.ts` files.
- Validate every form field and JSON body on the server. Never trust client input.
- Use Drizzle query builders. Never build SQL by concatenating strings.
- Check permissions on the server for every create, update, delete and publish action.
- Write or update tests for every behavior change.
- Tell the user when something in this document is wrong or missing.

**DO NOT**

- Do **not** commit `.env`, `.dev.vars`, API tokens or any secret. Never print a secret in a message.
- Do **not** run `db:push` or `db:migrate` against the production database. See [Production Migrations](#production-migrations).
- Do **not** read a role (or any permission) from a query string, cookie you did not sign, or request body.
- Do **not** import `@libsql/client` (the Node build). Always import `@libsql/client/web`. See [Database Client](#database-client).
- Do **not** use Node-only modules (`fs`, `path`, `child_process`, native addons) in server code that ships to Cloudflare. See [Workers Runtime Rules](#workers-runtime-rules).
- Do **not** keep per-user or per-request data in module-level variables on the server.
- Do **not** render user-written content with `{@html ...}`. Question text, answers, titles and descriptions are untrusted.
- Do **not** hand-edit generated files: `.svelte-kit/`, `.dev.vars`, `.svelte-kit/cloudflare/_routes.json`, or any Drizzle migration SQL that has already been applied.
- Do **not** use `git commit --no-verify`, and do not weaken or delete a failing test to make it pass.
- Do **not** disable SvelteKit's CSRF check (`csrf` option in `svelte.config.js`).

### Definition of done

A task is finished only when all of these pass:

```bash
mise run check        # svelte-check: 0 errors
mise run lint         # ESLint + Prettier
mise run test:unit    # Vitest
```

Also run `mise run test:e2e` when you changed routes, auth or the game board, and `mise run preview:cf` (then open <http://localhost:8788>) when you changed server code, hooks, the database layer or dependencies. Commit with a Conventional Commit message (see [Git Commits](#git-commits)).

### If you are unsure

Stop and ask the user. Guessing is worse than asking for: auth behavior, anything that touches production data, deleting files, or changing the database schema.

---

## Project Overview

Banned Books Jeopardy is a web application for live events where a Jeopardy-style board is projected onto a screen.

- **Public view**: browse published boards and play a game.
- **Admin view**: create, edit and publish boards (login required).
- **Live gameplay**: animated tiles, a countdown timer, and sound effects.
- **Single-game focus**: built for one live game at a time, not a multi-user gaming platform.

**Key use case**: At a Banned Books Coalition event, an administrator logs in, opens a published board, projects it, and moderates the game with the audience. Clicking a tile flips it to show the clue, a timer counts down with ticking sounds, and the answer is revealed on click or timeout.

### Glossary (read this; it prevents common mistakes)

Jeopardy inverts the usual meaning of "question" and "answer". The database and code use these names:

| Word in code          | What it really is                                                      | Example                                       |
| --------------------- | ---------------------------------------------------------------------- | --------------------------------------------- |
| `questions.question`  | The **clue** shown first on the board (Jeopardy calls it the "answer") | "This 1953 novel burns books at 451 degrees." |
| `questions.answer`    | The **response** revealed afterward (Jeopardy calls it the "question") | "What is Fahrenheit 451?"                     |
| `questions.value`     | Point value: 100, 200, 300, 400 or 500                                 | `300`                                         |
| `questions.timeLimit` | Seconds on the countdown timer (default 30)                            | `30`                                          |
| `order`               | Display position, 0 to 4 (used on categories and questions)            | `0` is the leftmost category / top row        |
| **board**             | One complete game: 5 categories × 5 questions = 25 tiles               |                                               |
| **published**         | A board visible to the public. A draft is `published = false`.         |                                               |

The names are not being changed. Always use them exactly as shown, and write `// clue` or `// response` comments where it helps readability.

---

## Current Status

This table reflects the last code review recorded for this project (October 2025) plus the plan in this file. The code has **not** been re-checked since. Re-verify with the [ground-truth checks](#ground-truth-checks-run-these-first) before relying on any row.

| Capability                                               | State            | Notes                                                                                                                                                |
| -------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5×5 board with 25 tiles, flip animation                  | ✅ DONE          | `GameBoard.svelte`, `QuestionTile.svelte`, `CategoryHeader.svelte`                                                                                   |
| Countdown timer with tick sound                          | ⚠️ INCOMPLETE    | Works, but counts with `setInterval` ticks and drifts. Fix described in [Timer](#4-timer-component).                                                 |
| Sound effects (6 files)                                  | ✅ DONE          | `static/sounds/`, `src/lib/utils/sounds.ts`                                                                                                          |
| Game-state persistence in `localStorage`                 | ⚠️ INCOMPLETE    | Works, but no `try/catch` around `JSON.parse` and allows duplicate tiles. See [Game State](#5-local-storage-game-state).                             |
| Board create/edit/delete in the admin UI                 | ✅ DONE          | `BoardEditor.svelte`, `src/lib/server/boards.ts`, admin routes                                                                                       |
| Permission helpers (`canViewBoard`, `canEditBoard`, ...) | ✅ DONE          | `src/lib/utils/permissions.ts`                                                                                                                       |
| Database schema (5 tables)                               | ⚠️ INCOMPLETE    | Works, but lacks indexes, constraints and `updatedAt` auto-update. Hardened schema is in [Database](#database).                                      |
| Login with Auth0                                         | ⚠️ **MOCK ONLY** | See the warning below.                                                                                                                               |
| Signed session cookie                                    | 🔲 PLANNED       | Current cookie is plain base64.                                                                                                                      |
| Admin route guard in `hooks.server.ts`                   | 🔲 PLANNED       | No `+layout.server.ts` guard exists today.                                                                                                           |
| CSRF protection                                          | ⚠️ VERIFY        | SvelteKit protects form posts by default. Confirm `svelte.config.js` does not disable it. JSON endpoints need an explicit check (see [CSRF](#csrf)). |
| `gameSessions` table                                     | ⚠️ INCOMPLETE    | Defined in the schema, not used by any code.                                                                                                         |
| Hosting on Cloudflare Pages                              | 🔲 PLANNED       | Repo was set up for Vercel. Follow [Migration From Vercel](#migration-from-vercel).                                                                  |

### Mock authentication warning (most important fact in this file)

> **The app ships with a _mock_ login. Anyone who can reach a deployed copy can become an administrator.** It must never run on a public URL.

What the mock does today:

- `src/routes/auth/callback/+page.server.ts` calls `mockUser(role)` where `role` comes from `url.searchParams.get('role')`. So `/auth/callback?role=administrator` grants admin.
- `src/lib/server/auth/auth0.ts` stores the user in a cookie with `btoa(JSON.stringify(user))`. That is encoding, not a signature, so anyone can forge it. (`btoa` also throws on non-Latin-1 characters in a name.)
- `@auth0/auth0-spa-js` is **not** installed, and it is the wrong library for this design anyway (it is a browser SPA SDK).
- `SECRET_SESSION_KEY` is in `.env.example` but no code reads it.

Required actions, in order:

1. **If the old Vercel deployment is still online, take it down now.**
2. Make the mock impossible to run outside local `mise run dev`. See [Mock Auth Rules](#mock-auth-rules).
3. Replace it with the real flow in [Auth Implementation Spec](#auth-implementation-spec).

---

## Tech Stack

### Frontend

- **Framework**: [SvelteKit 2](https://svelte.dev/docs/kit) with Svelte 5
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) (configured in CSS with `@theme`; no `tailwind.config.js` is needed)
- **Language**: TypeScript (strict mode)

### Backend

- **Runtime**: Cloudflare Pages Functions, which run on the **Workers runtime (not Node.js)**
- **Adapter**: `@sveltejs/adapter-cloudflare`
- **Database**: [Turso](https://turso.tech/) (libSQL/SQLite) over HTTP using `@libsql/client/web`
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) with `drizzle-orm/libsql/web`
- **Authentication**: [Auth0](https://auth0.com/) (Authorization Code flow with PKCE), tokens verified with [`jose`](https://github.com/panva/jose)

### Tooling

- **Tool and task runner**: [mise](https://mise.jdx.dev/) installs Node, pnpm, Wrangler and pre-commit, loads `.env`, and runs every task
- **Package manager**: pnpm. The exact version is the `packageManager` field in `package.json`; mise installs it. Run `pnpm --version` to see it. Do not write a pnpm version number anywhere else.
- **Node.js**: 22.20.0 (pinned in `.mise.toml`)
- **Deploy tool**: [Wrangler](https://developers.cloudflare.com/workers/wrangler/), installed by mise (`npm:wrangler`)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Linting/formatting**: ESLint, Prettier, pre-commit hooks
- **CI/CD**: GitHub Actions (calls `mise run`), Semantic Release
- **Migrations**: Drizzle Kit

---

## Architecture

### Application flow

```text
                    Public landing page
              (list of published boards)
                           |
            +--------------+---------------+
            |                              |
     Login (Auth0)                   Select a board
      [admin area]                     [play a game]
            |                              |
   +--------+--------+                     v
   |                 |              Game board (5x5 grid)
 Create boards   Edit boards                |
              (own, or any if admin)        v
                                   Click tile: flip, show clue,
                                   start timer + tick sound
                                            |
                                            v
                                   Timeout or click:
                                   stop timer, reveal answer
```

### State management

| State                  | Where it lives                                     | Examples                              |
| ---------------------- | -------------------------------------------------- | ------------------------------------- |
| Server data            | Turso database                                     | users, boards, categories, questions  |
| Game progress          | Browser `localStorage`, key `game-state-<boardId>` | revealed tiles, current question      |
| Login session          | Signed, HttpOnly cookie `bbj_session`              | user id, email, name, role, expiry    |
| Short-lived login data | Signed, HttpOnly cookie `bbj_auth_tx` (10 min)     | OAuth `state`, `nonce`, PKCE verifier |

### Request lifecycle on Cloudflare

1. The browser requests a page. Static files (JS, CSS, sounds) are served by Cloudflare without running code.
2. Page and API routes run as a Pages Function (Workers runtime).
3. `src/hooks.server.ts` runs first on every request. It creates the database client, reads and verifies the session cookie into `event.locals.user`, applies the admin guard, and sets security headers.
4. The route's `load` function or action uses `event.locals.db` and `event.locals.user`.

### Workers Runtime Rules

The server does **not** run on Node.js. Follow these rules for all server code:

1. **No filesystem.** `fs`, `path.resolve` on real files, and reading files at runtime do not work. Import assets at build time instead.
2. **No long-lived process.** Each request may run in a fresh isolate. Never store per-user or per-request data in a module-level variable. (A module-level cache of _public_ data, such as the Auth0 signing keys, is allowed.)
3. **Create the database client per request** (see [Database Client](#database-client)).
4. **Use Web Crypto** (`crypto.subtle`, `crypto.getRandomValues`) and `jose`. Do not use `jsonwebtoken`, `bcrypt`, or Node's `crypto` module.
5. **Environment values are strings that exist only at request time.** Read them inside `handle` or a request handler through `$env/dynamic/private`. Do not read them at module top level or at build time.
6. **`nodejs_compat` is enabled** in `wrangler.toml`, but treat it as a safety net, not permission to use Node APIs.
7. **`vite dev` runs on Node and hides Workers problems.** Before finishing any server-side change, run `mise run preview:cf`, which runs the production build in the real Workers runtime (workerd).
8. **Response headers**: `static/_headers` only affects static files. Headers on page and API responses must be set in `hooks.server.ts` (`event.setHeaders`) or through `kit.csp`.
9. **Free-plan limits**: Function requests per day and CPU time per request are capped. Static files are not counted. This app is database-wait bound and fits easily for one live game. Check the current limits at <https://developers.cloudflare.com/pages/platform/limits/> before a big event.

---

## Database

Turso (libSQL, which is SQLite-compatible) with Drizzle ORM. The schema file is `src/lib/server/db/schema.ts`.

### Schema (target version)

⚠️ The schema in the repo works but is missing the hardening below. Applying it is a 🔲 PLANNED task (see [Task: Harden the Schema](#task-harden-the-schema)). Do not rename any existing table or column.

```typescript
// src/lib/server/db/schema.ts
import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const ROLES = ['administrator', 'creator', 'player'] as const;
export type Role = (typeof ROLES)[number];

export const QUESTION_VALUES = [100, 200, 300, 400, 500] as const;

// Shared columns. `$onUpdate` makes Drizzle refresh updated_at on every update()
// made through Drizzle. (A plain `default` only applies on insert.)
const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date())
};

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Auth0 "sub" claim, e.g. "auth0|abc123"
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role', { enum: ROLES }).notNull().default('player'),
  ...timestamps
});

export const boards = sqliteTable(
  'boards',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    description: text('description'),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    published: integer('published', { mode: 'boolean' }).notNull().default(false),
    ...timestamps
  },
  (t) => [
    index('boards_published_idx').on(t.published),
    index('boards_created_by_idx').on(t.createdBy)
  ]
);

// 5 categories per board
export const categories = sqliteTable(
  'categories',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    boardId: integer('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    order: integer('order').notNull(), // 0-4, left to right
    ...timestamps
  },
  (t) => [
    index('categories_board_id_idx').on(t.boardId),
    uniqueIndex('categories_board_order_uq').on(t.boardId, t.order),
    check('categories_order_check', sql`${t.order} BETWEEN 0 AND 4`)
  ]
);

// 5 questions per category = 25 per board
export const questions = sqliteTable(
  'questions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    value: integer('value').notNull(), // 100, 200, 300, 400, 500
    question: text('question').notNull(), // the CLUE shown first
    answer: text('answer').notNull(), // the RESPONSE revealed later
    timeLimit: integer('time_limit').notNull().default(30), // seconds
    order: integer('order').notNull(), // 0-4, top to bottom
    ...timestamps
  },
  (t) => [
    index('questions_category_id_idx').on(t.categoryId),
    uniqueIndex('questions_category_order_uq').on(t.categoryId, t.order),
    check('questions_order_check', sql`${t.order} BETWEEN 0 AND 4`),
    check('questions_value_check', sql`${t.value} IN (100, 200, 300, 400, 500)`),
    check('questions_time_limit_check', sql`${t.timeLimit} BETWEEN 1 AND 600`)
  ]
);

// Optional analytics. DEFINED BUT UNUSED by app code. Either wire it into the
// game start/finish flow or remove it; do not leave it half-used.
export const gameSessions = sqliteTable('game_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  boardId: integer('board_id')
    .notNull()
    .references(() => boards.id, { onDelete: 'cascade' }),
  startedBy: text('started_by').references(() => users.id),
  startedAt: integer('started_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer('completed_at', { mode: 'timestamp' })
});
```

### Schema rules

1. A board has exactly 5 categories (`order` 0 to 4) and each category has exactly 5 questions (`order` 0 to 4, values 100 to 500). The database enforces ranges and uniqueness; the server code in `src/lib/server/boards.ts` must also verify that all 25 questions exist and are non-empty before saving. Never rely on the form alone.
2. Deleting a board deletes its categories and questions (`onDelete: 'cascade'`). Deleting a user who owns boards is **not** allowed by the database. Never delete users.
3. `order` is an SQL reserved word. Drizzle quotes it automatically. In hand-written SQL always write `"order"`.
4. The user's role is stored in `users.role` but **Auth0 is the source of truth**. The role is refreshed from the Auth0 token on every login (see [Auth Implementation Spec](#auth-implementation-spec)). Never edit `users.role` by hand to grant access; assign the role in Auth0.
5. Unpublished boards (`published = false`) must never be returned to anyone except their owner or an administrator. See `canViewBoard`.

### Database Client

The Workers runtime cannot open `file:` databases or load native libSQL code. The app must use the **web** client, created **once per request**.

```typescript
// src/lib/server/db/index.ts
import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql/web';
import * as schema from './schema';

export type Db = ReturnType<typeof createDb>;

export function createDb(env: { DATABASE_URL: string; DATABASE_AUTH_TOKEN?: string }) {
  const client = createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN });
  return drizzle(client, { schema });
}
```

It is attached to every request in `hooks.server.ts` as `event.locals.db` (full file in [Hooks](#hooks)). Route code must use `locals.db`. Never call `createDb` anywhere else and never store the result in a module-level variable.

Pick the Turso region closest to your users (for Toledo, a US East or Midwest region). Every request makes a network round trip from the Cloudflare edge to the database.

### Local Database

The web client cannot read `file:local.db`. Run a local libSQL server that stores data in a file:

```bash
# Terminal 1: leave this running (listens on http://127.0.0.1:8080)
mise run db:serve        # runs: turso dev --db-file local.db

# Terminal 2:
mise run db:push         # create tables in the local database
mise run db:seed         # optional sample data
```

`.env` must contain `DATABASE_URL="http://127.0.0.1:8080"`. `local.db` is gitignored.

### Drizzle Kit config

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN
  }
});
```

### Database commands

| Command                    | What it does                                           | Safe against production? |
| -------------------------- | ------------------------------------------------------ | ------------------------ |
| `mise run db:serve`        | Start the local libSQL server                          | n/a                      |
| `mise run db:push`         | Make the **local** database match the schema, no files | **NO. Local only.**      |
| `mise run db:generate`     | Write a new SQL migration file into `drizzle/`         | Yes (creates a file)     |
| `mise run db:migrate`      | Apply committed migrations to the database in `.env`   | Local only (see below)   |
| `mise run db:migrate:prod` | Apply committed migrations to production               | Yes. The only safe way.  |
| `mise run db:studio`       | Open Drizzle Studio                                    | Read the target first    |
| `mise run db:seed`         | Insert sample data                                     | **NO. Local only.**      |

If `package.json` lacks `db:generate` or `db:migrate`, add `"db:generate": "drizzle-kit generate"` and `"db:migrate": "drizzle-kit migrate"`.

### Production Migrations

Use `db:push` only on your local database. Production changes always go through committed migration files:

1. Edit `src/lib/server/db/schema.ts`.
2. `mise run db:generate`. Open the new file in `drizzle/` and read the SQL. Check it does not drop data you need.
3. Apply it locally with `mise run db:migrate` and run `mise run test`.
4. Commit the schema change **and** the new `drizzle/` files together.
5. Back up production: `turso db shell banned-books-jeopardy .dump > backup-$(date +%F).sql`
6. Apply to production (the variables are named `PROD_*` so your local `.env` can never be used by accident):

   ```bash
   PROD_DATABASE_URL="libsql://banned-books-jeopardy-<org>.turso.io" \
   PROD_DATABASE_AUTH_TOKEN="<token>" \
   mise run db:migrate:prod
   ```

7. Only after the migration succeeds, deploy the code ([Deploying](#deploying)). Write migrations so the previous code version still works, because a Cloudflare rollback does not roll back the database.

---

## Authentication and Authorization

### Design in one paragraph

The server runs the OAuth 2.0 **Authorization Code flow with PKCE** against Auth0. `/auth/login` redirects to Auth0. Auth0 redirects back to `/auth/callback` with a `code`. The server exchanges the code for an ID token (using the client secret), verifies the token with `jose`, reads the user's roles from a custom claim, saves the user in the `users` table, and sets a **signed, HttpOnly** session cookie. `hooks.server.ts` verifies that cookie on every request and puts the user in `event.locals.user`. The browser never sees a token and never sees the client secret.

### Roles

| Role              | Can do                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| **administrator** | Create boards, edit and delete any board, publish any board, manage users |
| **creator**       | Create boards, edit and publish **own** boards, view all published boards |
| **player**        | View published boards and play. Cannot reach `/admin/*`                   |

A signed-out visitor can view published boards and play. If Auth0 returns several roles, the highest one wins: `administrator` > `creator` > `player`. No roles means `player`.

### Auth0 setup (do once per Auth0 tenant)

Create **two** Auth0 applications. This keeps preview and local logins away from the production app.

| Application name                     | Used by                                  |
| ------------------------------------ | ---------------------------------------- |
| `banned-books-jeopardy` (production) | The production site only                 |
| `banned-books-jeopardy-dev`          | Local development and the `next` preview |

For each application (Auth0 Dashboard → Applications → Create Application → **Regular Web Application**):

1. Copy **Domain**, **Client ID** and **Client Secret** from Settings. Domain goes in `AUTH0_DOMAIN` **without** `https://`.
2. Under Settings → Advanced → Grant Types, make sure **Authorization Code** is enabled.
3. Set the URLs:

   | Application | Allowed Callback URLs                                                                                                                      | Allowed Logout URLs                                                                              |
   | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
   | production  | `https://banned-books-jeopardy.pages.dev/auth/callback` and the same path on your custom domain, if any                                    | `https://banned-books-jeopardy.pages.dev` and your custom domain, if any                         |
   | dev         | `http://localhost:5173/auth/callback`, `http://localhost:8788/auth/callback`, `https://next.banned-books-jeopardy.pages.dev/auth/callback` | `http://localhost:5173`, `http://localhost:8788`, `https://next.banned-books-jeopardy.pages.dev` |

   Port 5173 is `mise run dev`. Port 8788 is `mise run preview:cf`. Use the **real** `*.pages.dev` hostname from the Cloudflare dashboard (Cloudflare may add a suffix to the project name). Do not use wildcard callback URLs on the production application.

4. Create the three roles (User Management → Roles): `administrator`, `creator`, `player`. Assign them to users (User Management → Users → select user → Roles).
5. Add the roles to the ID token with a **Post Login Action** (Actions → Library → Create Action → Build from scratch, name `inject-roles`; then Actions → Triggers → post-login → drag the action into the flow → Apply). Use an **action**, not a Rule: Auth0 Rules are deprecated.

   ```javascript
   // Replace the namespace with a URL you control. It must equal AUTH0_ROLES_CLAIM exactly.
   exports.onExecutePostLogin = async (event, api) => {
     const namespace = 'https://banned-books-jeopardy.example';
     const roles = (event.authorization && event.authorization.roles) || [];
     api.idToken.setCustomClaim(`${namespace}/roles`, roles);
   };
   ```

   With that namespace, `AUTH0_ROLES_CLAIM` is `https://banned-books-jeopardy.example/roles`.

### Auth Implementation Spec

🔲 PLANNED. This replaces the mock. Do the steps in [Task: Implement Real Auth0 Login](#task-implement-real-auth0-login). The code below is the target design.

**Install**: `mise exec -- pnpm add jose`. Do **not** install `@auth0/auth0-spa-js`; remove it if present.

#### `src/lib/server/auth/session.ts`: signing and verifying (Web Crypto only)

```typescript
// Relative import on purpose: Playwright E2E helpers import this file and cannot resolve `$lib`.
import { ROLES, type Role } from '../db/schema';

export const SESSION_COOKIE = 'bbj_session';
export const TX_COOKIE = 'bbj_auth_tx';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours
export const TX_MAX_AGE_SECONDS = 60 * 10; // 10 minutes

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const nowSeconds = () => Math.floor(Date.now() / 1000);

export function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function hmacKey(secret: string, usage: 'sign' | 'verify') {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [usage]
  );
}

/** Returns "<base64url(json)>.<base64url(hmac)>". Handles any Unicode (unlike btoa on its own). */
export async function signValue(value: unknown, secret: string): Promise<string> {
  const body = toBase64Url(encoder.encode(JSON.stringify(value)));
  const key = await hmacKey(secret, 'sign');
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(body)));
  return `${body}.${toBase64Url(signature)}`;
}

/** Returns the parsed value, or null if the token is missing, malformed, or the signature is wrong. */
export async function verifyValue<T>(token: string | undefined, secret: string): Promise<T | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  try {
    const key = await hmacKey(secret, 'verify');
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromBase64Url(parts[1]),
      encoder.encode(parts[0])
    );
    if (!valid) return null;
    return JSON.parse(decoder.decode(fromBase64Url(parts[0]))) as T;
  } catch {
    return null;
  }
}

export async function createSessionToken(user: SessionUser, secret: string): Promise<string> {
  return signValue({ ...user, exp: nowSeconds() + SESSION_MAX_AGE_SECONDS }, secret);
}

/** Verifies signature, expiry and role. Returns null for anything invalid. */
export async function readSession(
  token: string | undefined,
  secret: string
): Promise<SessionUser | null> {
  const payload = await verifyValue<SessionUser & { exp: number }>(token, secret);
  if (!payload || typeof payload.exp !== 'number' || payload.exp <= nowSeconds()) return null;
  if (!ROLES.includes(payload.role)) return null;
  return { id: payload.id, email: payload.email, name: payload.name, role: payload.role };
}

/** Cookie options shared by both cookies. `secure` is off only for http://localhost. */
export function cookieOptions(url: URL, maxAge: number) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: url.protocol === 'https:',
    maxAge
  };
}
```

#### `src/lib/server/auth/auth0.ts`: talking to Auth0

```typescript
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Role } from '$lib/server/db/schema';
import { toBase64Url, type SessionUser } from './session';

export interface Auth0Config {
  domain: string; // e.g. "my-tenant.us.auth0.com" (no https://)
  clientId: string;
  clientSecret: string;
  scope: string;
  rolesClaim: string; // e.g. "https://banned-books-jeopardy.example/roles"
}

export function getAuth0Config(env: Record<string, string | undefined>): Auth0Config {
  const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SCOPE, AUTH0_ROLES_CLAIM } =
    env;
  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !AUTH0_ROLES_CLAIM) {
    throw new Error('Missing Auth0 environment variables');
  }
  return {
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    scope: AUTH0_SCOPE ?? 'openid profile email',
    rolesClaim: AUTH0_ROLES_CLAIM
  };
}

export function randomString(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return toBase64Url(new Uint8Array(digest));
}

export function buildAuthorizeUrl(
  cfg: Auth0Config,
  redirectUri: string,
  tx: { state: string; nonce: string; challenge: string }
): string {
  const url = new URL(`https://${cfg.domain}/authorize`);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: cfg.clientId,
    redirect_uri: redirectUri,
    scope: cfg.scope,
    state: tx.state,
    nonce: tx.nonce,
    code_challenge: tx.challenge,
    code_challenge_method: 'S256'
  }).toString();
  return url.toString();
}

export async function exchangeCode(
  cfg: Auth0Config,
  redirectUri: string,
  code: string,
  verifier: string
): Promise<{ id_token: string }> {
  const response = await fetch(`https://${cfg.domain}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier
    })
  });
  if (!response.ok) throw new Error(`Auth0 token exchange failed with status ${response.status}`);
  return (await response.json()) as { id_token: string };
}

// Public signing keys only. Safe to cache at module level (it is not per-user data).
const jwksByDomain = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export function pickRole(roles: unknown): Role {
  const list = Array.isArray(roles) ? roles : [];
  if (list.includes('administrator')) return 'administrator';
  if (list.includes('creator')) return 'creator';
  return 'player';
}

/** Verifies signature, issuer, audience, expiry and nonce. Throws on any problem. */
export async function verifyIdToken(
  cfg: Auth0Config,
  idToken: string,
  expectedNonce: string
): Promise<SessionUser> {
  let jwks = jwksByDomain.get(cfg.domain);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`https://${cfg.domain}/.well-known/jwks.json`));
    jwksByDomain.set(cfg.domain, jwks);
  }
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: `https://${cfg.domain}/`,
    audience: cfg.clientId
  });
  if (payload.nonce !== expectedNonce) throw new Error('Nonce mismatch');
  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
    throw new Error('ID token is missing sub or email');
  }
  return {
    id: payload.sub,
    email: payload.email,
    name: typeof payload.name === 'string' ? payload.name : null,
    role: pickRole(payload[cfg.rolesClaim])
  };
}
```

#### Routes

```typescript
// src/routes/auth/login/+server.ts
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
  buildAuthorizeUrl,
  getAuth0Config,
  pkceChallenge,
  randomString
} from '$lib/server/auth/auth0';
import {
  TX_COOKIE,
  TX_MAX_AGE_SECONDS,
  cookieOptions,
  nowSeconds,
  signValue
} from '$lib/server/auth/session';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const cfg = getAuth0Config(env);
  const state = randomString();
  const nonce = randomString();
  const verifier = randomString(48);

  const tx = await signValue(
    { state, nonce, verifier, exp: nowSeconds() + TX_MAX_AGE_SECONDS },
    env.SECRET_SESSION_KEY!
  );
  cookies.set(TX_COOKIE, tx, cookieOptions(url, TX_MAX_AGE_SECONDS));

  redirect(
    302,
    buildAuthorizeUrl(cfg, `${url.origin}/auth/callback`, {
      state,
      nonce,
      challenge: await pkceChallenge(verifier)
    })
  );
};
```

```typescript
// src/routes/auth/callback/+server.ts
// DELETE the old src/routes/auth/callback/+page.server.ts. A route folder must not have both.
import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { users } from '$lib/server/db/schema';
import { exchangeCode, getAuth0Config, verifyIdToken } from '$lib/server/auth/auth0';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  TX_COOKIE,
  cookieOptions,
  createSessionToken,
  nowSeconds,
  verifyValue
} from '$lib/server/auth/session';
import type { RequestHandler } from './$types';

interface Tx {
  state: string;
  nonce: string;
  verifier: string;
  exp: number;
}

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
  const secret = env.SECRET_SESSION_KEY!;
  const tx = await verifyValue<Tx>(cookies.get(TX_COOKIE), secret);
  cookies.delete(TX_COOKIE, { path: '/' }); // single use

  if (url.searchParams.get('error')) error(400, 'Login was cancelled or denied.');
  if (!tx || tx.exp <= nowSeconds()) error(400, 'Login session expired. Please try again.');
  if (url.searchParams.get('state') !== tx.state) error(400, 'Invalid login state.');
  const code = url.searchParams.get('code');
  if (!code) error(400, 'Missing authorization code.');

  const cfg = getAuth0Config(env);
  const redirectUri = `${url.origin}/auth/callback`;
  const { id_token } = await exchangeCode(cfg, redirectUri, code, tx.verifier);
  const user = await verifyIdToken(cfg, id_token, tx.nonce);

  // Auth0 is the source of truth: refresh email, name and role on every login.
  await locals.db
    .insert(users)
    .values({ id: user.id, email: user.email, name: user.name, role: user.role })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: user.email, name: user.name, role: user.role }
    });

  cookies.set(
    SESSION_COOKIE,
    await createSessionToken(user, secret),
    cookieOptions(url, SESSION_MAX_AGE_SECONDS)
  );
  redirect(302, '/');
};
```

```typescript
// src/routes/auth/logout/+server.ts
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { SESSION_COOKIE } from '$lib/server/auth/session';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  const logout = new URL(`https://${env.AUTH0_DOMAIN}/v2/logout`);
  logout.search = new URLSearchParams({
    client_id: env.AUTH0_CLIENT_ID!,
    returnTo: url.origin
  }).toString();
  redirect(302, logout.toString());
};
```

#### Hooks

```typescript
// src/hooks.server.ts
import { error, redirect, type Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createDb } from '$lib/server/db';
import { SESSION_COOKIE, readSession } from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Database client for THIS request only.
  event.locals.db = createDb({
    DATABASE_URL: env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: env.DATABASE_AUTH_TOKEN
  });

  // 2. Verified user, or null.
  event.locals.user = await readSession(event.cookies.get(SESSION_COOKIE), env.SECRET_SESSION_KEY);

  // 3. Admin guard. Every /admin page and every state-changing API call needs a real user.
  const path = event.url.pathname;
  if (path === '/admin' || path.startsWith('/admin/')) {
    if (!event.locals.user) redirect(303, '/auth/login');
    if (event.locals.user.role === 'player') error(403, 'You do not have access to this area.');
  }

  // 4. Security headers for page and API responses (static/_headers does NOT cover these).
  event.setHeaders({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });

  return resolve(event);
};
```

```typescript
// src/app.d.ts
import type { Db } from '$lib/server/db';
import type { SessionUser } from '$lib/server/auth/session';

declare global {
  namespace App {
    interface Locals {
      db: Db;
      user: SessionUser | null;
    }
  }
}

export {};
```

The hooks guard is only the first layer. **Every** `+page.server.ts` action and `+server.ts` handler that changes data must also call the permission helpers (below). Never rely on the UI hiding a button.

### Mock Auth Rules

The mock may exist only to let a developer log in locally without Auth0. It must be impossible to enable anywhere else.

1. The mock code path runs only when **both** are true: `dev` (imported from `$app/environment`) is `true`, and `env.ALLOW_MOCK_AUTH === 'true'`.
2. `dev` is `false` in every production build, including `mise run preview:cf` and every Cloudflare deployment, so the mock is off there even if `ALLOW_MOCK_AUTH` is accidentally set.
3. Never read the role from the URL. Use a fixed mock user per role, chosen by separate routes or a dev-only page, and still issue a **signed** session cookie.
4. Never set `ALLOW_MOCK_AUTH` in `wrangler.toml` or in Cloudflare.
5. E2E tests do not use the mock. They create a signed cookie directly (see [Testing](#testing)).

```typescript
// src/lib/server/auth/mock.ts
import { dev } from '$app/environment';

export const mockAuthEnabled = (env: Record<string, string | undefined>) =>
  dev && env.ALLOW_MOCK_AUTH === 'true';
```

### Permission helpers

File: `src/lib/utils/permissions.ts`. These functions take the user from `locals.user` (never from the request). The rules:

| Function          | Rule                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `canViewBoard`    | Published board: anyone. Draft: its owner or an administrator.                                                                                    |
| `canEditBoard`    | `administrator`: any board. `creator`: only boards they own. Everyone else: no.                                                                   |
| `canDeleteBoard`  | `administrator` only.                                                                                                                             |
| `canPublishBoard` | `administrator`: any board. `creator`: only boards they own. (Verify against the code; if the code differs, the code wins and you tell the user.) |
| `canManageUsers`  | `administrator` only.                                                                                                                             |

```typescript
import type { SessionUser } from '$lib/server/auth/session';

export function canEditBoard(user: SessionUser | null, board: { createdBy: string }): boolean {
  if (!user) return false;
  if (user.role === 'administrator') return true;
  return user.role === 'creator' && board.createdBy === user.id;
}
```

When you add a role (see [Task: Add a New Role](#task-add-a-new-role)), update **every** helper. A helper copied from an example that forgets `creator` silently breaks editing.

### CSRF

- SvelteKit rejects cross-origin form submissions by default. Do not disable it (`kit.csrf` in `svelte.config.js`). Check that file for a disabled setting; if you find one, restore the default and tell the user.
- That built-in check does **not** cover JSON requests. For every `POST`, `PUT`, `PATCH` and `DELETE` handler in `src/routes/api/**/+server.ts`, call this helper first:

```typescript
// src/lib/server/csrf.ts
import { error } from '@sveltejs/kit';

export function assertSameOrigin(request: Request, url: URL): void {
  if (request.headers.get('origin') !== url.origin) error(403, 'Cross-origin request blocked');
}
```

- The session cookie is `SameSite=Lax`, which is a second layer of defense.

### Other security rules

- **XSS**: render all user content as text (`{question.question}`), never `{@html ...}`.
- **Content-Security-Policy**: set `kit.csp` in `svelte.config.js` (PLANNED). Start with this and test with `mise run preview:cf`:

  ```javascript
  csp: {
    mode: 'auto',
    directives: {
      'default-src': ['self'],
      'script-src': ['self'],
      'style-src': ['self', 'unsafe-inline'],
      'img-src': ['self', 'data:'],
      'media-src': ['self'],
      'connect-src': ['self'],
      'frame-ancestors': ['none'],
      'base-uri': ['self'],
      'form-action': ['self']
    }
  }
  ```

- **Rate limiting**: add a Cloudflare rate-limiting rule for requests whose path starts with `/auth/` (Cloudflare dashboard → Security → WAF → Rate limiting rules).
- **Known trade-off**: `getBoardForGame` sends every response (answer) to the browser together with the clues. This is acceptable for a projected game with one moderator. Do not describe answers as hidden.

---

## Environment Variables

### Variable reference

| Name                       | Secret? | Used by           | Local `.env` value                            | Notes                                                                                                              |
| -------------------------- | ------- | ----------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`             | no      | app               | `http://127.0.0.1:8080`                       | Production: `libsql://<db>-<org>.turso.io`                                                                         |
| `DATABASE_AUTH_TOKEN`      | **yes** | app               | (leave unset locally)                         | `turso db tokens create banned-books-jeopardy`                                                                     |
| `AUTH0_DOMAIN`             | no      | app               | `your-tenant.us.auth0.com`                    | No `https://`                                                                                                      |
| `AUTH0_CLIENT_ID`          | no      | app               | dev application's client ID                   |                                                                                                                    |
| `AUTH0_CLIENT_SECRET`      | **yes** | app               | dev application's secret                      |                                                                                                                    |
| `AUTH0_SCOPE`              | no      | app               | `openid profile email`                        |                                                                                                                    |
| `AUTH0_ROLES_CLAIM`        | no      | app               | `https://banned-books-jeopardy.example/roles` | Must equal the namespace in the Auth0 Action plus `/roles`                                                         |
| `SECRET_SESSION_KEY`       | **yes** | app               | any 32+ character random string               | Generate with `openssl rand -base64 48`. Use a **different** value per environment. Changing it logs everyone out. |
| `ALLOW_MOCK_AUTH`          | no      | app (dev only)    | `true` or unset                               | Never set in Cloudflare                                                                                            |
| `CLOUDFLARE_API_TOKEN`     | **yes** | deploy tasks      | your token (local deploys only)               | Permission: Account → Cloudflare Pages → Edit                                                                      |
| `CLOUDFLARE_ACCOUNT_ID`    | no      | deploy tasks      | your account ID                               | Cloudflare dashboard sidebar                                                                                       |
| `PROD_DATABASE_URL`        | no      | `db:migrate:prod` | (never in `.env`; pass on the command line)   |                                                                                                                    |
| `PROD_DATABASE_AUTH_TOKEN` | **yes** | `db:migrate:prod` | (never in `.env`; pass on the command line)   |                                                                                                                    |

**Removed variables** (delete them from `.env.example` and code if present): `AUTH0_CALLBACK_URL`, `AUTH0_LOGOUT_URL`, `PUBLIC_APP_URL`, `AUTH0_AUDIENCE`, `VERCEL_URL`, `VERCEL_ENV`. The redirect URL is now derived from the request (`url.origin`), so it is correct on localhost, previews and production without configuration.

Cloudflare sets `CF_PAGES`, `CF_PAGES_BRANCH`, `CF_PAGES_COMMIT_SHA` and `CF_PAGES_URL` only in Cloudflare-run builds. This project builds locally and in GitHub Actions, so they do not exist. Do not use them.

### Local `.env` example

```bash
# .env  (gitignored; mise loads it automatically)
DATABASE_URL="http://127.0.0.1:8080"  # from `mise run db:serve`
AUTH0_DOMAIN="your-dev-tenant.us.auth0.com"
AUTH0_CLIENT_ID="your-dev-client-id"
AUTH0_CLIENT_SECRET="your-dev-client-secret" # pragma: allowlist secret
AUTH0_SCOPE="openid profile email"
AUTH0_ROLES_CLAIM="https://banned-books-jeopardy.example/roles"
SECRET_SESSION_KEY="generate-with-openssl-rand-base64-48" # pragma: allowlist secret
ALLOW_MOCK_AUTH="true"

# Only needed to deploy from your own machine:
CLOUDFLARE_API_TOKEN="your-api-token" # pragma: allowlist secret
CLOUDFLARE_ACCOUNT_ID="your-account-id"
```

`.env.example` must contain the same names with placeholder values and no real secrets.

### Where each environment gets its values

| Environment                                   | Non-secret values                            | Secret values                                                             |
| --------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| Local (`mise run dev`)                        | `.env`                                       | `.env`                                                                    |
| Local Workers runtime (`mise run preview:cf`) | `.dev.vars` (copied from `.env` by the task) | `.dev.vars`                                                               |
| Cloudflare Production                         | `wrangler.toml` `[env.production.vars]`      | Cloudflare dashboard or `wrangler pages secret put`                       |
| Cloudflare Preview                            | `wrangler.toml` `[env.preview.vars]`         | Cloudflare dashboard or `wrangler pages secret put`                       |
| GitHub Actions                                | n/a                                          | GitHub repository secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |

### Obtaining credentials

**Turso**

```bash
brew install tursodatabase/tap/turso        # macOS
# or: curl -sSfL https://get.tur.so/install.sh | bash   # Linux / WSL
turso auth login
turso db create banned-books-jeopardy
turso db show banned-books-jeopardy --url         # -> DATABASE_URL
turso db tokens create banned-books-jeopardy      # -> DATABASE_AUTH_TOKEN
```

**Auth0**: see [Auth0 setup](#auth0-setup-do-once-per-auth0-tenant).

**Cloudflare**

1. Create a free account at <https://dash.cloudflare.com/>.
2. Account ID: Workers & Pages → the right-hand sidebar.
3. API token: My Profile → API Tokens → Create Token → Custom token → permission **Account / Cloudflare Pages / Edit** → copy it once.

---

## Development Setup

### Prerequisites

- **mise**: installs and runs everything else. Install: `curl https://mise.run | sh` (or `brew install mise`), then activate it in your shell (see <https://mise.jdx.dev/getting-started.html>).
- **Git**
- **Turso CLI**: required for the local database (`turso dev`) and for managing the remote one. Install commands are in [Obtaining credentials](#obtaining-credentials).

mise installs Node.js, pnpm, Python, pre-commit and Wrangler for you. Do not install them separately.

### Initial setup

```bash
# 1. Clone
git clone https://github.com/Imamiland/banned_books_jeopardy.git
cd banned_books_jeopardy

# 2. Trust the config and install every tool listed in .mise.toml
mise trust && mise install

# 3. Install dependencies and the git hooks
mise run setup

# 4. Create your .env, then edit it (see Environment Variables)
cp .env.example .env

# 5. Terminal 1: start the local database and leave it running
mise run db:serve

# 6. Terminal 2: create tables, then (optionally) add sample data
mise run db:push
mise run db:seed

# 7. Start the dev server
mise run dev            # http://localhost:5173
```

Check your tools at any time with `mise current` and `mise doctor`. `mise env` prints **secrets** from `.env`; never paste its output into a chat or issue.

### mise Tasks

Always run commands as `mise run <task>`. That guarantees the right tool versions and that `.env` is loaded, and it is exactly what GitHub Actions does.

```text
Development
  mise run dev               Dev server with hot reload (http://localhost:5173), runs on Node
  mise run build             Production build into .svelte-kit/cloudflare
  mise run preview           Preview the build on Node (http://localhost:4173). Does NOT test Workers.
  mise run preview:cf        Build, then run in the Workers runtime (http://localhost:8788)  <- use before deploying
  mise run check             svelte-check (type check)
  mise run watch             svelte-check in watch mode

Testing
  mise run test              Unit + E2E
  mise run test:unit         Vitest
  mise run test:unit:watch   Vitest watch mode
  mise run test:e2e          Playwright
  mise run test:e2e:ui       Playwright UI mode
  mise run test:e2e:debug    Playwright debug mode

Quality
  mise run lint              ESLint + Prettier check
  mise run lint:fix          Auto-fix
  mise run format            Prettier write
  mise run format:check      Prettier check only
  mise run precommit         Run pre-commit hooks manually
  mise run ci                lint + check + test + build (what GitHub Actions runs)

Database
  mise run db:serve          Local libSQL server (keep running)
  mise run db:push           Local database <- schema (local only!)
  mise run db:generate       Create a migration file
  mise run db:migrate        Apply migrations to the database in .env (local)
  mise run db:migrate:prod   Apply migrations to production (needs PROD_* variables)
  mise run db:studio         Drizzle Studio
  mise run db:seed           Sample data (local only!)

Cloudflare
  mise run cf:login          One-time browser login for Wrangler
  mise run cf:project:create One-time: create the Direct Upload Pages project
  mise run deploy            Build, then deploy to PRODUCTION (main branch only)
  mise run deploy:upload     Deploy the existing build to PRODUCTION (used by CI after `mise run ci`)
  mise run deploy:preview    Build, then deploy a PREVIEW

Utility
  mise run setup | clean | update | info
```

Run `mise tasks` to see what actually exists. Tasks marked 🔲 PLANNED in this document (`db:serve`, `db:generate`, `db:migrate:prod`, `preview:cf`, `cf:*`, `deploy*`) must be added to `.mise.toml`; the exact definitions are below.

For a one-off command with no task, use `mise exec -- <command>`, for example `mise exec -- wrangler pages deployment list --project-name banned-books-jeopardy`.

### mise Config Additions

Open the existing `.mise.toml`. **Keep everything already in it.** Add only what is missing from this block. Replace any Vercel CLI entry with the Wrangler one.

```toml
[tools]
node = "22.20.0"
python = "3.12"
pre-commit = "4.3.0"
"npm:wrangler" = "4"            # replaces the Vercel CLI; bump the major version deliberately
# (keep the existing pnpm entry as it is)

[env]
_.file = ".env"                 # loads .env for every mise task

[tasks."db:serve"]
description = "Start the local libSQL server on http://127.0.0.1:8080 (keep running)"
run = "turso dev --db-file local.db"

[tasks."db:generate"]
description = "Generate a SQL migration from schema changes"
run = "pnpm db:generate"

# Production migrations. Reads PROD_* names so the local .env can never be used by accident.
[tasks."db:migrate:prod"]
description = "Apply committed migrations to PRODUCTION (needs PROD_DATABASE_URL and PROD_DATABASE_AUTH_TOKEN in the shell)"
env = { DATABASE_URL = '{{ get_env(name="PROD_DATABASE_URL", default="") }}', DATABASE_AUTH_TOKEN = '{{ get_env(name="PROD_DATABASE_AUTH_TOKEN", default="") }}' }
run = '''
test -n "$DATABASE_URL" || { echo "Set PROD_DATABASE_URL and PROD_DATABASE_AUTH_TOKEN first"; exit 1; }
case "$DATABASE_URL" in libsql://*) ;; *) echo "Refusing: not a libsql:// URL"; exit 1;; esac
pnpm db:migrate
'''

[tasks."preview:cf"]
description = "Build, then run the production build in the Workers runtime at http://localhost:8788"
depends = ["build"]
run = '''
grep -v '^CLOUDFLARE_' .env > .dev.vars
wrangler pages dev .svelte-kit/cloudflare --port 8788
'''

[tasks."cf:login"]
description = "One-time: log Wrangler in to Cloudflare in your browser"
run = "wrangler login"

[tasks."cf:project:create"]
description = "One-time: create the Direct Upload Pages project (production branch: main)"
run = "wrangler pages project create banned-books-jeopardy --production-branch main"

[tasks."deploy:upload"]
description = "Deploy the EXISTING build to PRODUCTION (no rebuild). Refuses to run unless on branch main."
run = '''
test "$(git rev-parse --abbrev-ref HEAD)" = "main" || { echo "Refusing: production deploys must be from main"; exit 1; }
wrangler pages deploy .svelte-kit/cloudflare --project-name banned-books-jeopardy --branch main --commit-dirty=true
'''

[tasks.deploy]
description = "Build, then deploy to PRODUCTION"
depends = ["build"]
run = "mise run deploy:upload"

[tasks."deploy:preview"]
description = "Build, then deploy a PREVIEW. Branch alias is DEPLOY_BRANCH, or the current git branch."
depends = ["build"]
run = '''
BRANCH="${DEPLOY_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"
test "$BRANCH" != "main" || { echo "Use 'mise run deploy' for main"; exit 1; }
wrangler pages deploy .svelte-kit/cloudflare --project-name banned-books-jeopardy --branch "$BRANCH" --commit-dirty=true
'''
```

After adding `db:migrate:prod`, verify once that the `PROD_*` override works: run `PROD_DATABASE_URL="libsql://does-not-exist.example" PROD_DATABASE_AUTH_TOKEN=x mise run db:migrate:prod`. It must fail trying to reach `does-not-exist.example`. If it migrates your local database instead, stop and tell the user: the task `env` is not overriding `.env`.

`.gitignore` must contain: `.env`, `.dev.vars`, `local.db*`, `.svelte-kit/`, `.wrangler/`.

---

## Key Features

### 1. Game Board Display

**Location**: `src/routes/game/[boardId]/+page.svelte`, using `GameBoard.svelte`, `QuestionTile.svelte`, `CategoryHeader.svelte`.

- **Layout**: 5 columns (categories) × 5 rows (values 100 to 500).
- **Styling**: Tailwind CSS, dark blue background, gold text (`--color-jeopardy-blue`, `--color-jeopardy-gold`).
- **Animation**: CSS 3D flip transitions.
- **Data access**: the load function calls `getBoardForGame` and must return nothing for a draft board unless `canViewBoard(locals.user, board)` is true.

Tile states:

| State         | What the tile shows                            |
| ------------- | ---------------------------------------------- |
| **Unplayed**  | The point value                                |
| **Playing**   | Flipped: the clue text and the countdown timer |
| **Answered**  | Flipped: the response text                     |
| **Completed** | Grayed out / marked used                       |

### 2. Question Flow

```text
Click tile
   |
   v
Flip animation (3D rotate) + play "tile-flip" sound
   |
   v
Show clue, start countdown, loop "timer-tick" sound
   |
   +--------------+---------------+
   |              |               |
Timeout       Click to reveal    Reset
   |              |               |
   +--------------+---------------+
   |
   v
Stop timer and tick sound
Flip to show response
Play "answer-reveal" sound
```

### 3. Sound Effects

**Location**: `static/sounds/`. Pass the name **without** `.mp3` to `playSound`.

| File                 | Description            | Trigger              |
| -------------------- | ---------------------- | -------------------- |
| `tile-click.mp3`     | Quick click/pop        | Tile is clicked      |
| `tile-flip.mp3`      | Whoosh                 | During the flip      |
| `timer-tick.mp3`     | Clock ticking (looped) | While the timer runs |
| `timer-expire.mp3`   | Buzzer                 | Time runs out        |
| `answer-reveal.mp3`  | Dramatic reveal        | Response is shown    |
| `board-complete.mp3` | Victory sound          | All tiles answered   |

```typescript
// src/lib/utils/sounds.ts  (the existing file also exports preloadAllSounds() and clearSoundCache())
const soundCache = new Map<string, HTMLAudioElement>();

export function playSound(soundName: string, loop = false): HTMLAudioElement {
  let audio = soundCache.get(soundName);
  if (!audio) {
    audio = new Audio(`/sounds/${soundName}.mp3`);
    soundCache.set(soundName, audio);
  }
  audio.loop = loop;
  audio.currentTime = 0;
  audio.play().catch((err) => console.error('Sound play failed:', err));
  return audio;
}

export function stopSound(soundName: string): void {
  const audio = soundCache.get(soundName);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
```

Browsers block sound until the user has clicked something. The first sound must happen after a click. This only runs in the browser, so call it from event handlers or `$effect`, never at the top level of a server file.

### 4. Timer Component

**Location**: `src/lib/components/Timer.svelte`. ⚠️ The repo version counts down by decrementing a number once per `setInterval` tick, which drifts and falls behind when the browser throttles a background tab. The target version below computes the remaining time from a fixed end time.

```svelte
<script lang="ts">
  import { playSound, stopSound } from '$lib/utils/sounds';

  interface Props {
    timeLimit?: number;
    onExpire?: () => void;
  }

  let { timeLimit = 30, onExpire }: Props = $props();
  let remaining = $state(0);

  // Runs in the browser only. The returned function is the cleanup.
  $effect(() => {
    const endsAt = Date.now() + timeLimit * 1000;
    remaining = timeLimit;
    playSound('timer-tick', true);

    const id = setInterval(() => {
      remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      if (remaining === 0) {
        clearInterval(id);
        stopSound('timer-tick');
        playSound('timer-expire');
        onExpire?.();
      }
    }, 250);

    return () => {
      clearInterval(id);
      stopSound('timer-tick');
    };
  });
</script>

<div
  class="timer text-4xl font-bold text-red-500"
  aria-live="off"
>
  {remaining}s
</div>
```

### 5. Local Storage Game State

**Location**: `src/lib/stores/gameStore.ts`. (An older version of this document called it `gameState.ts`. Run `ls src/lib/stores` and use the real file name and export name.) Progress is saved so a refresh or an accidental tab close does not lose the game. ⚠️ The repo version has no `try/catch` around `JSON.parse` (corrupt data crashes the board), can add the same tile twice, and touches `localStorage` without checking it is in a browser. Target version:

```typescript
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export interface GameState {
  boardId: number;
  revealedTiles: number[]; // question IDs
  currentQuestion: number | null;
  startedAt: number;
}

const keyFor = (boardId: number) => `game-state-${boardId}`;

function load(boardId: number): GameState | null {
  if (!browser) return null;
  try {
    const raw = localStorage.getItem(keyFor(boardId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    return parsed.boardId === boardId && Array.isArray(parsed.revealedTiles) ? parsed : null;
  } catch {
    return null; // corrupt data: start a fresh game
  }
}

function save(state: GameState): void {
  if (!browser) return;
  try {
    localStorage.setItem(keyFor(state.boardId), JSON.stringify(state));
  } catch {
    // Storage full or private mode: keep playing without persistence.
  }
}

function createGameStateStore() {
  const { subscribe, set, update } = writable<GameState | null>(null);

  return {
    subscribe,
    init(boardId: number) {
      const state = load(boardId) ?? {
        boardId,
        revealedTiles: [],
        currentQuestion: null,
        startedAt: Date.now()
      };
      set(state);
      save(state);
    },
    revealTile(questionId: number) {
      update((state) => {
        if (!state) return state;
        const next = {
          ...state,
          revealedTiles: state.revealedTiles.includes(questionId)
            ? state.revealedTiles
            : [...state.revealedTiles, questionId],
          currentQuestion: questionId
        };
        save(next);
        return next;
      });
    },
    reset(boardId: number) {
      if (browser) localStorage.removeItem(keyFor(boardId));
      set(null);
    }
  };
}

export const gameState = createGameStateStore();
```

Call `gameState.init(boardId)` inside `onMount`, never during server rendering.

### 6. Admin Board Editor

**Location**: `src/routes/admin/boards/[id]/edit/+page.svelte` and `BoardEditor.svelte`; server logic in `src/lib/server/boards.ts` (`parseBoardForm`, `createBoardFromForm`, `updateBoardFromForm`, `getBoardForGame`, `getBoardWithContent`).

- A form with 5 category names; each has 5 clue/response pairs; values are assigned automatically (100 to 500).
- A time limit per question (default 30 seconds, allowed 1 to 600).
- A Draft/Publish toggle.
- **Server validation (required)**: `parseBoardForm` must reject the save unless there are exactly 5 non-empty category names and 25 non-empty clue/response pairs. The browser form is a convenience, not a safeguard.
- **Permission checks (required)**: `canEditBoard` for editing, `canPublishBoard` for changing `published`, `canDeleteBoard` for deleting. Run them in the server action using `locals.user`.

---

## File Structure

Legend: no mark means it exists today. 🔲 means it must be created or changed as part of this plan.

```text
banned_books_jeopardy/
├── .github/workflows/
│   ├── deploy-cloudflare.yml     # 🔲 replaces deploy-vercel.yml
│   └── ...                       # scorecard, codeql, sonarcloud, dependency-review, project-automation
├── drizzle/                      # 🔲 generated SQL migrations (commit them)
├── e2e/
│   ├── helpers/auth.ts           # 🔲 signs a session cookie for tests
│   ├── game-flow.test.ts
│   ├── admin-crud.test.ts
│   └── demo.test.ts
├── src/
│   ├── lib/
│   │   ├── components/           # Timer, GameBoard, QuestionTile, CategoryHeader, BoardEditor, AdminNav (.svelte)
│   │   ├── server/               # server-only code; never imported by browser code
│   │   │   ├── db/
│   │   │   │   ├── index.ts      # createDb(): libSQL web client, per request (🔲 change)
│   │   │   │   └── schema.ts     # tables (🔲 harden)
│   │   │   ├── auth/
│   │   │   │   ├── auth0.ts      # Auth0 calls + ID token verification (🔲 replace mock)
│   │   │   │   ├── session.ts    # 🔲 sign/verify cookies (Web Crypto)
│   │   │   │   └── mock.ts       # 🔲 dev-only mock gate
│   │   │   ├── boards.ts         # board queries and form parsing
│   │   │   └── csrf.ts           # 🔲 assertSameOrigin()
│   │   ├── stores/
│   │   │   └── gameStore.ts      # game state in localStorage (verify real name)
│   │   ├── types/game.ts
│   │   └── utils/
│   │       ├── sounds.ts
│   │       └── permissions.ts
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte / +page.server.ts    # homepage: published boards
│   │   ├── admin/boards/new/                  # create board
│   │   ├── admin/boards/[id]/edit/            # edit board
│   │   ├── game/[boardId]/                    # play a board
│   │   ├── auth/
│   │   │   ├── login/+server.ts               # 🔲 start login
│   │   │   ├── callback/+server.ts            # 🔲 replaces +page.server.ts
│   │   │   └── logout/+server.ts              # 🔲 end session
│   │   ├── api/boards/+server.ts
│   │   └── demo/+page.svelte
│   ├── app.css                   # Tailwind + @theme colors
│   ├── app.d.ts                  # 🔲 App.Locals { db, user }
│   ├── app.html
│   └── hooks.server.ts           # 🔲 db client, session, admin guard, headers
├── static/
│   ├── sounds/                   # six .mp3 files
│   ├── _headers                  # 🔲 cache rules for static files only
│   └── favicon.png
├── .dev.vars                     # generated by `mise run preview:cf`; gitignored; never edit
├── .env                          # local secrets; gitignored
├── .env.example                  # placeholders only
├── .mise.toml                    # tools, env, tasks
├── drizzle.config.ts
├── playwright.config.ts
├── svelte.config.js              # 🔲 adapter-cloudflare, csp
├── vite.config.ts
├── wrangler.toml                 # 🔲 Cloudflare Pages config
└── package.json
```

---

## Coding Standards

### TypeScript

- Strict mode. Fix every type error; never silence one with `any`, `@ts-ignore` or `as unknown as`. Use a real type or `unknown` and narrow it.
- Server-only code lives in `src/lib/server/`. SvelteKit will refuse to bundle it into browser code; that is intentional.

### Svelte 5

- Component state uses runes: `$state`, `$derived`, `$effect`, `$props`.
- Existing shared stores in `src/lib/stores/` use `writable`. Leave them as they are until a deliberate migration. Do not create **new** `writable` stores for component-local state.
- Components are PascalCase (`GameBoard.svelte`).
- Props are typed with an interface. The correct Svelte 5 syntax is:

  ```svelte
  <script lang="ts">
    interface Props {
      title: string;
      onSave?: () => void;
    }

    let { title, onSave }: Props = $props(); // NOT $props<Props>()
    let count = $state(0);
    let doubled = $derived(count * 2);
  </script>
  ```

- Event handlers use `onclick={...}`, not `on:click`.
- Code that touches `window`, `localStorage` or `Audio` runs only in `onMount`, `$effect` or an event handler.

### Tailwind CSS 4

Tailwind 4 is configured in CSS. `src/app.css`:

```css
@import 'tailwindcss';
@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';

@theme {
  --color-jeopardy-blue: #060ce9;
  --color-jeopardy-gold: #ffd700;
}
```

- No inline `style=` attributes when a Tailwind class exists.
- If `package.json` lists `@tailwindcss/aspect-ratio` or `@tailwindcss/container-queries`, remove them (`mise exec -- pnpm remove <name>`). Tailwind 4 has `aspect-*` utilities and `@container` built in.
- If `tailwind.config.js` exists and `app.css` has no `@config` line, delete the file.

### Formatting

- Prettier formats, ESLint lints, and pre-commit runs both. Run `mise run format && mise run lint` before committing.

### Git Commits

Use [Conventional Commits](https://www.conventionalcommits.org/). Semantic Release builds the changelog from them.

```text
feat: add countdown timer to game board
fix: reject unsigned session cookies
docs: update onboarding guide
chore: upgrade dependencies
```

---

## Testing

### Unit tests (Vitest)

**Location**: `src/**/*.test.ts` or `src/**/*.spec.ts`. Run: `mise run test:unit`.

**Required unit tests for auth** (🔲 PLANNED), in `src/lib/server/auth/session.test.ts`. These run in Node, which has Web Crypto built in:

```typescript
import { describe, expect, it } from 'vitest';
import { createSessionToken, readSession, type SessionUser } from './session';

const secret = 'test-secret-test-secret-test-secret'; // pragma: allowlist secret
const user: SessionUser = {
  id: 'auth0|1',
  email: 'a@example.com',
  name: 'Zoë Ñandú',
  role: 'creator'
};

describe('session cookie', () => {
  it('round-trips a user, including non-Latin-1 characters', async () => {
    const token = await createSessionToken(user, secret);
    expect(await readSession(token, secret)).toEqual(user);
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken(user, secret);
    expect(await readSession(token, 'another-secret-another-secret-12345')).toBeNull();
  });

  it('rejects the old unsigned base64 cookie', async () => {
    const forged = btoa(JSON.stringify({ ...user, role: 'administrator' }));
    expect(await readSession(forged, secret)).toBeNull();
  });

  it('rejects missing and malformed values', async () => {
    expect(await readSession(undefined, secret)).toBeNull();
    expect(await readSession('a.b.c', secret)).toBeNull();
  });
});
```

**Testing code that uses the browser `Audio` API**: jsdom does not implement `play()`, so it must be mocked, and the test needs the jsdom environment (`mise exec -- pnpm add -D jsdom`):

```typescript
// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { playSound } from './sounds';

describe('playSound', () => {
  it('creates an audio element and plays it', () => {
    const play = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const audio = playSound('tile-click');
    expect(audio).toBeInstanceOf(HTMLAudioElement);
    expect(play).toHaveBeenCalled();
  });
});
```

Also add unit tests for every permission helper (all roles × own/other/draft/published) and for `gameStore` (corrupt JSON, duplicate tile).

### E2E tests (Playwright)

**Location**: `e2e/**/*.test.ts`. Run: `mise run test:e2e`. Prerequisite: `mise run db:serve` is running and the database is seeded.

Run E2E against the **Workers runtime**, not Node, so Workers-only failures are caught. In `playwright.config.ts`:

```typescript
webServer: {
  command: 'mise run preview:cf',
  url: 'http://localhost:8788',
  reuseExistingServer: !process.env.CI,
  timeout: 180_000
},
use: { baseURL: 'http://localhost:8788' }
```

Tests never use the mock login. They create a signed cookie with the same secret the server uses:

```typescript
// e2e/helpers/auth.ts
import type { BrowserContext } from '@playwright/test';
import {
  SESSION_COOKIE,
  createSessionToken,
  type SessionUser
} from '../../src/lib/server/auth/session';

export async function loginAs(
  context: BrowserContext,
  user: SessionUser,
  baseURL = 'http://localhost:8788'
) {
  const token = await createSessionToken(user, process.env.SECRET_SESSION_KEY!);
  await context.addCookies([{ name: SESSION_COOKIE, value: token, url: baseURL }]);
}
```

Required E2E cases (🔲 PLANNED):

1. Signed-out visitor opening `/admin/boards/new` is redirected to `/auth/login`.
2. A `player` opening `/admin/boards/new` gets a 403.
3. A `creator` can edit their own board and gets 403/redirect on another creator's board.
4. An `administrator` can edit any board.
5. A draft board returns 404/403 on `/game/<id>` for the public, and works for its owner.
6. A hand-made `btoa(...)` cookie and a tampered cookie are treated as signed out.
7. A cross-origin JSON `POST` to `/api/boards` is rejected with 403.
8. Gameplay: 5 categories render, a tile flips on click, the answer shows after timeout, refresh keeps revealed tiles.

Use `data-testid` attributes for selectors instead of CSS class names. Do not assume a seeded board with id 1 exists unless the test seeds it.

---

## Deployment

### How deployment works

- Hosting is **Cloudflare Pages using Direct Upload**. Cloudflare does **not** build the project. mise builds it (on your machine or in GitHub Actions) and `wrangler pages deploy` uploads `.svelte-kit/cloudflare`.
- Because the build runs under mise, Node and pnpm versions come from `.mise.toml` and `package.json`. There are no `NODE_VERSION` / `PNPM_VERSION` settings to maintain in Cloudflare.
- The build must not need secrets. All configuration is read at request time from `$env/dynamic/private`. Never use `$env/static/private` for secrets.
- A Pages project is **either** Git-integrated **or** Direct Upload, and it cannot be switched later. This project is Direct Upload. Do not click "Connect to Git" in the dashboard.

| Environment | Branch         | URL                                                         | Deploy command            |
| ----------- | -------------- | ----------------------------------------------------------- | ------------------------- |
| Production  | `main`         | `https://banned-books-jeopardy.pages.dev` (+ custom domain) | `mise run deploy`         |
| Preview     | `next`         | `https://next.banned-books-jeopardy.pages.dev`              | `mise run deploy:preview` |
| Preview     | any other name | `https://<branch>.banned-books-jeopardy.pages.dev`          | `mise run deploy:preview` |

Every deployment also gets its own unique `https://<hash>.banned-books-jeopardy.pages.dev` URL. Project names are global on `pages.dev`, so Cloudflare may append a suffix to yours. Read the real hostname from the dashboard or from the output of `mise run cf:project:create` and use it everywhere (Auth0 URLs, this file).

### Project configuration

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter()
    // csp: { ... }  see "Other security rules"
  }
};

export default config;
```

```toml
# wrangler.toml
name = "banned-books-jeopardy"
pages_build_output_dir = ".svelte-kit/cloudflare"
compatibility_date = "2025-10-01"          # bump deliberately, then re-test with `mise run preview:cf`
compatibility_flags = ["nodejs_compat"]

# Non-secret values. Never put secrets here: this file is committed.
# Define the same keys in BOTH blocks. If Wrangler reports an error about env blocks,
# stop and tell the user rather than guessing.
[env.production.vars]
DATABASE_URL = "libsql://banned-books-jeopardy-<org>.turso.io"
AUTH0_DOMAIN = "your-tenant.us.auth0.com"
AUTH0_CLIENT_ID = "<production application client id>"
AUTH0_SCOPE = "openid profile email"
AUTH0_ROLES_CLAIM = "https://banned-books-jeopardy.example/roles"

[env.preview.vars]
DATABASE_URL = "libsql://banned-books-jeopardy-dev-<org>.turso.io"   # separate dev database
AUTH0_DOMAIN = "your-tenant.us.auth0.com"
AUTH0_CLIENT_ID = "<dev application client id>"
AUTH0_SCOPE = "openid profile email"
AUTH0_ROLES_CLAIM = "https://banned-books-jeopardy.example/roles"
```

Use a **separate Turso database** for previews: `turso db create banned-books-jeopardy-dev`. That way a preview or test can never change real event data.

Secrets are **not** in this file. Set these three **separately for Production and Preview**:

| Secret                | Production value                  | Preview value                         |
| --------------------- | --------------------------------- | ------------------------------------- |
| `DATABASE_AUTH_TOKEN` | token for `banned-books-jeopardy` | token for `banned-books-jeopardy-dev` |
| `AUTH0_CLIENT_SECRET` | production application's secret   | dev application's secret              |
| `SECRET_SESSION_KEY`  | a new random value                | a different new random value          |

Set them in the Cloudflare dashboard: Workers & Pages → `banned-books-jeopardy` → Settings → Variables and Secrets → choose the **Production** or **Preview** tab → Add → type **Secret**. Or use the CLI: `mise exec -- wrangler pages secret put AUTH0_CLIENT_SECRET --project-name banned-books-jeopardy` (run it with `--help` to see how to pick the environment). A new secret applies to the **next** deployment.

Do not hand-edit the generated `_routes.json`. The adapter uses it so static files (JS, CSS, sounds) are served without running a Function.

### First-time Cloudflare setup (do once, in this order)

1. Put `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in `.env` (see [Obtaining credentials](#obtaining-credentials)), or run `mise run cf:login`.
2. `mise run cf:project:create`. Note the hostname it prints.
3. Put that hostname into the Auth0 callback and logout URLs ([Auth0 setup](#auth0-setup-do-once-per-auth0-tenant)) and into `wrangler.toml` comments where relevant.
4. Fill in `[env.production.vars]` and `[env.preview.vars]` in `wrangler.toml`; set the secrets in the dashboard.
5. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub repository secrets (Settings → Secrets and variables → Actions).
6. Complete the [Deployment Readiness Checklist](#deployment-readiness-checklist) **before** the first public deploy.

### Deploying

```bash
# Production. Only works from the main branch with a clean, tested checkout.
mise run deploy

# Preview of the current branch (URL is printed at the end)
mise run deploy:preview

# Preview with an explicit branch alias
DEPLOY_BRANCH=next mise run deploy:preview

# Test the production build locally in the Workers runtime first (http://localhost:8788)
mise run preview:cf
```

`mise run deploy` and `deploy:preview` both run `mise run build` first. If the deploy fails with an authentication error, see [Troubleshooting](#troubleshooting).

#### GitHub Actions (`.github/workflows/deploy-cloudflare.yml`, 🔲 PLANNED)

This replaces `deploy-vercel.yml`. It calls the same mise tasks you run locally. Tests are enforced by the existing CI workflow plus branch protection (require the CI check on `main`); this workflow only builds and deploys. Pin each `uses:` to a full commit SHA to satisfy the OpenSSF Scorecard workflow already in this repo.

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main, next]
  pull_request:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    # Pull requests from forks do not receive secrets, so skip them.
    if: github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository
    env:
      CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    steps:
      - uses: actions/checkout@v4 # pin to a full commit SHA
      - uses: jdx/mise-action@v2 # pin to a full commit SHA
      - run: pnpm install --frozen-lockfile

      - name: Deploy production
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          mise run build
          mise run deploy:upload

      - name: Deploy preview
        if: github.ref != 'refs/heads/main'
        env:
          DEPLOY_BRANCH: ${{ github.head_ref || github.ref_name }}
        run: mise run deploy:preview
```

### Static file caching (`static/_headers`)

`static/_headers` applies **only to static files**. It does not touch page or API responses (those get headers from `hooks.server.ts`).

```text
/sounds/*
  Cache-Control: public, max-age=86400
```

Sound file names are not hashed, so do not mark them `immutable`. After `mise run build`, open `.svelte-kit/cloudflare/_headers` and confirm it contains both your rule and the adapter's own rules for `/_app/immutable/*`. If one is missing, tell the user.

### Preview Deployments and Auth0

Auth0 requires exact callback URLs, but preview hostnames change. The setup is:

- The `banned-books-jeopardy-dev` Auth0 application allows `http://localhost:5173`, `http://localhost:8788` and the stable alias `https://next.banned-books-jeopardy.pages.dev`. So login works on localhost and on the `next` preview.
- Other branch previews work for browsing, but login on them fails with a callback mismatch. That is expected. Merge to `next` to test login.
- Do not use wildcard callback URLs on the production Auth0 application.
- Protect previews with **Cloudflare Access** so unreviewed builds are not public: Cloudflare dashboard → Workers & Pages → project → Settings → General → Access policy → Enable.

### Custom domain

Workers & Pages → project → Custom domains → Set up a domain. Then: add the domain to the production Auth0 application's callback and logout URLs, and mention it in this file. No environment variable changes are needed, because the redirect URL comes from the request.

### Rollback

Workers & Pages → project → Deployments → pick the previous production deployment → Rollback. If that option is unavailable, check out the last good commit on `main` and run `mise run deploy`. The database is **not** rolled back, so migrations must stay backward compatible with the previous code.

### Migration From Vercel

🔲 PLANNED. Do these steps in order, on a new branch (`git switch -c chore/cloudflare-pages`). Do not skip the verification in step 9.

1. **Take down any public Vercel deployment** that still runs the mock login.
2. **Swap packages**:

   ```bash
   mise exec -- pnpm remove @sveltejs/adapter-vercel       # or @sveltejs/adapter-auto, whichever is installed
   mise exec -- pnpm add -D @sveltejs/adapter-cloudflare
   ```

   Do not add Wrangler through pnpm. mise provides it. `@libsql/client` is already installed; only the import path changes.

3. **Edit `svelte.config.js`** to the version in [Project configuration](#project-configuration).
4. **Create `wrangler.toml`** from the same section. Add the `.mise.toml` additions from [Development Setup](#mise-config-additions).
5. **Switch the database client**: replace `src/lib/server/db/index.ts` with the version in [Database Client](#database-client). Create `src/hooks.server.ts` and `src/app.d.ts` as shown in [Hooks](#hooks). If a `hooks.server.ts` already exists, merge instead of overwriting.
6. **Find and remove Vercel and Node-only code**:

   ```bash
   grep -rniE "vercel" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.svelte-kit --exclude=pnpm-lock.yaml
   grep -rn "process\.env" src
   grep -rnE "from '(node:)?(fs|path|crypto|child_process|os)'" src
   ```

   Delete `vercel.json`. Delete route options like `export const config = { runtime: 'nodejs22.x' }`. Replace `process.env.X` with `env.X` from `$env/dynamic/private`, read inside a request handler. Remove or replace any hit for the Node modules.

7. **Update environment files**: remove `VERCEL_*`, `AUTH0_CALLBACK_URL`, `AUTH0_LOGOUT_URL`, `PUBLIC_APP_URL`, `AUTH0_AUDIENCE` from `.env.example` and from code. Add `AUTH0_ROLES_CLAIM`, `ALLOW_MOCK_AUTH` and the placeholders from [Environment Variables](#environment-variables). Make sure `.gitignore` lists `.dev.vars`, `.wrangler/` and `local.db*`.
8. **Gate the mock login** exactly as described in [Mock Auth Rules](#mock-auth-rules), and add the admin guard from [Hooks](#hooks). A first public deploy without both is not allowed.
9. **Verify locally in the Workers runtime**:

   ```bash
   mise run db:serve        # terminal 1
   mise run db:push         # terminal 2
   mise run db:seed
   mise run preview:cf      # then open http://localhost:8788 and open a board
   ```

   Open `/admin/boards/new` while signed out. You must **not** see the editor.

10. **Replace the workflow**: delete `.github/workflows/deploy-vercel.yml`, add `deploy-cloudflare.yml` from the section above, add the GitHub secrets.
11. **Do the [First-time Cloudflare setup](#first-time-cloudflare-setup-do-once-in-this-order)**, then `mise run deploy` and smoke-test the production URL.
12. **Clean up**: delete the Vercel project and its GitHub integration, rewrite `DEPLOYMENT.md` for Cloudflare, search `README.md` for Vercel mentions, and run `mise run ci`.

### Deployment Readiness Checklist

Do **not** deploy to a public URL until every item in Phase 1 is checked.

**Phase 1: security (blocking)**

- [ ] The mock login can run only when `dev` is true and `ALLOW_MOCK_AUTH === 'true'`; `?role=` is gone from the code.
- [ ] `hooks.server.ts` blocks `/admin/*` for signed-out users (redirect) and `player` users (403).
- [ ] Session cookie is signed (`bbj_session`, value contains one `.`), HttpOnly, SameSite=Lax, `Secure` on https.
- [ ] Real Auth0 login works on the dev application; roles come from the token claim.
- [ ] Every server action and API handler that changes data checks permissions with `locals.user`; every JSON API handler calls `assertSameOrigin`.
- [ ] Draft boards are not visible to the public (`/game/<draft id>` is 404/403 when signed out).
- [ ] `svelte.config.js` does not disable `csrf`.
- [ ] No secrets in git (`git log -p -S'AUTH0_CLIENT_SECRET'` shows only placeholders).

**Phase 2: infrastructure**

- [ ] `mise run check`, `mise run lint`, `mise run test` pass.
- [ ] `mise run preview:cf` works end to end: board list loads (database read), login, create a board, play a board.
- [ ] Production and Preview each have `DATABASE_AUTH_TOKEN`, `AUTH0_CLIENT_SECRET`, `SECRET_SESSION_KEY` set, with different values.
- [ ] Preview uses the separate dev Turso database and dev Auth0 application.
- [ ] Auth0 callback and logout URLs contain the exact real hostnames.
- [ ] Cloudflare Access is enabled for previews.
- [ ] A Cloudflare rate-limiting rule exists for `/auth/*`.
- [ ] `mise run db:migrate:prod` has applied all migrations to production.

**Phase 3: before the live event**

- [ ] Rehearse the whole event on the production URL: login, open the published board, play all 25 tiles, check sound and timer on the projector machine.
- [ ] Check the current Cloudflare free-plan limits (see [Workers Runtime Rules](#workers-runtime-rules)).
- [ ] You know the rollback steps above.

---

## Common Tasks

### Task: Implement Real Auth0 Login

🔲 PLANNED. Goal: replace the mock with the design in [Auth Implementation Spec](#auth-implementation-spec).

1. Confirm the [Auth0 setup](#auth0-setup-do-once-per-auth0-tenant) is done and your `.env` has `AUTH0_*` and `SECRET_SESSION_KEY` values for the **dev** application.
2. `mise exec -- pnpm add jose`. If `@auth0/auth0-spa-js` is in `package.json`, `mise exec -- pnpm remove @auth0/auth0-spa-js`.
3. Find what uses the old auth code: `grep -rn "auth/auth0\|mockUser\|stores/auth" src`. Note every file.
4. Create `src/lib/server/auth/session.ts`, replace `src/lib/server/auth/auth0.ts`, and create `src/lib/server/auth/mock.ts` using the code in the spec.
5. Create `src/routes/auth/login/+server.ts` and `src/routes/auth/logout/+server.ts`. **Delete** `src/routes/auth/callback/+page.server.ts` and create `src/routes/auth/callback/+server.ts`.
6. Create or merge `src/hooks.server.ts` and `src/app.d.ts`.
7. Create `src/lib/server/csrf.ts` and call `assertSameOrigin(request, url)` first in every non-GET handler under `src/routes/api/`.
8. In every `+page.server.ts` action in `src/routes/admin/**`, read `locals.user` and call the matching helper from `permissions.ts`. Return `error(403, ...)` when it returns false. A missing user is `401`/redirect to `/auth/login`.
9. Update the UI: the login link goes to `/auth/login`, the logout link to `/auth/logout`. Any component that used the mock user now gets the user from the layout `load` (return `locals.user` from `src/routes/+layout.server.ts`; expose only `id`, `name`, `role`).
10. Write the tests listed under [Testing](#testing).
11. Verify manually with `mise run preview:cf` (port 8788; the dev Auth0 app allows it): log in as a user with each role. In browser DevTools → Application → Cookies, `bbj_session` must be HttpOnly and contain exactly one `.`. Edit the cookie value by one character and reload: you must be signed out.
12. Remove the old `mockUser` function and any `role` query-string code. Search again: `grep -rn "searchParams.get('role')" src` must find nothing.

### Task: Harden the Schema

🔲 PLANNED. Goal: bring `schema.ts` to the version in [Database](#database).

1. `git switch -c feat/harden-schema`. Start the local database (`mise run db:serve`).
2. Before changing anything, check the data will satisfy the new unique constraints. In `mise run db:studio` (or `turso db shell`), confirm there are no two categories with the same `(board_id, order)` and no two questions with the same `(category_id, order)`. Fix duplicates by hand first.
3. Edit `src/lib/server/db/schema.ts` to match the target version. Do not rename tables or columns.
4. `mise run db:generate`. Read the generated SQL in `drizzle/`. SQLite may recreate tables; that is normal. It must not drop a table without recreating it.
5. `mise run db:migrate`, then `mise run test`. Fix code that inserts out-of-range values (`order` 0 to 4, `time_limit` 1 to 600).
6. Search for code that sets `updatedAt` by hand and remove it (Drizzle now does it): `grep -rn "updatedAt" src`.
7. Commit schema and `drizzle/` files together. Production rollout follows [Production Migrations](#production-migrations).

### Task: Add a New Sound Effect

1. Get a royalty-free or licensed MP3.
2. Name it `action-description.mp3` (lowercase, hyphens), for example `correct-answer.mp3`.
3. Put it in `static/sounds/`.
4. If `preloadAllSounds()` in `src/lib/utils/sounds.ts` has a list of names, add the new name.
5. Play it from a browser-only place:

   ```svelte
   <script lang="ts">
     import { playSound } from '$lib/utils/sounds';
   </script>

   <button onclick={() => playSound('correct-answer')}>Correct!</button>
   ```

### Task: Create a New Board (through the UI)

1. Log in as a `creator` or `administrator`.
2. Open `/admin/boards/new`.
3. Fill in the title, description, 5 category names and 25 clue/response pairs.
4. Set time limits if you do not want 30 seconds.
5. Save as draft, or publish. A published board appears in the public list.

### Task: Modify the Database Schema

1. Edit `src/lib/server/db/schema.ts`.
2. `mise run db:generate`; read the new SQL file in `drizzle/`.
3. `mise run db:migrate` against your local database, then `mise run test`.
4. Commit the schema change and the `drizzle/` files together.
5. Roll out to production using [Production Migrations](#production-migrations). Do not use `db:push` for this.

### Task: Add a New Role

Example: adding `moderator`.

1. `src/lib/server/db/schema.ts`: add it to `ROLES`. (This is a TypeScript enum on a text column, so no SQL migration is needed.)
2. Auth0: create the role and assign it to users.
3. `pickRole` in `src/lib/server/auth/auth0.ts`: decide where it ranks, and add it.
4. `src/lib/utils/permissions.ts`: update **all five** helpers. Never replace an existing branch; add to it. For example, if moderators may edit boards they own, the `creator` branch must stay:

   ```typescript
   export function canEditBoard(user: SessionUser | null, board: { createdBy: string }): boolean {
     if (!user) return false;
     if (user.role === 'administrator') return true;
     if ((user.role === 'creator' || user.role === 'moderator') && board.createdBy === user.id)
       return true;
     return false;
   }
   ```

5. `hooks.server.ts`: decide whether the role may enter `/admin`.
6. Update the UI, the tests (every role × every helper), and the role tables in this file.

### Task: Reset Game State

In-game reset button:

```svelte
<script lang="ts">
  import { gameState } from '$lib/stores/gameStore';
  let { boardId }: { boardId: number } = $props();
</script>

<button onclick={() => gameState.reset(boardId)}>Reset Game</button>
```

Manual reset (browser console): `localStorage.removeItem('game-state-1')` (replace `1` with the board id).

---

## Troubleshooting

### `wrangler: command not found`, or the wrong tool versions

Run `mise install`, then `mise doctor`. Run tools through `mise run` or `mise exec -- <command>`. If you still see it, `.mise.toml` is missing `"npm:wrangler"` (see [`.mise.toml` additions](#mise-config-additions)).

### Wrangler authentication error during deploy

1. Make sure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set (locally in `.env`, in CI as GitHub secrets), or run `mise run cf:login`.
2. The token needs **Account → Cloudflare Pages → Edit**.
3. `Project not found`: run `mise run cf:project:create` once, and check the name is exactly `banned-books-jeopardy`.
4. An error about a Git-connected project means the project was created with Git integration. Delete it in the dashboard and recreate it with `mise run cf:project:create`.

### `Refusing: production deploys must be from main`

`deploy:upload` only runs on the `main` branch. For any other branch use `mise run deploy:preview`.

### Works locally, fails on Cloudflare

1. Reproduce it: `mise run preview:cf` runs the production build in the real Workers runtime.
2. `No such module "node:..."`, `fs`, or `process is not defined`: a dependency or your code uses a Node-only API. Replace it, or check that `nodejs_compat` is in `wrangler.toml`.
3. A variable is `undefined` at runtime: it is missing from the **Production** or **Preview** set (they are separate), or it is read at module scope. Read it inside `handle` or a handler, then redeploy.
4. A page returns 500 only in production: run `mise exec -- wrangler pages deployment tail --project-name banned-books-jeopardy` to see live logs.
5. Database errors only in production: confirm the code imports `@libsql/client/web` and that `DATABASE_URL` starts with `libsql://` or `https://`.

### Auth0 redirect loop or `redirect_uri` mismatch

1. The URL in the browser's address bar when you click login must match an **Allowed Callback URL** exactly (scheme, host, port, path `/auth/callback`).
2. On a preview, only `next.banned-books-jeopardy.pages.dev` and localhost are allowed for the dev application. See [Preview Deployments and Auth0](#preview-deployments-and-auth0).
3. Clear cookies for the site and try again. The 10-minute `bbj_auth_tx` cookie can be stale.
4. Check `hooks.server.ts` does not redirect `/auth/login` to itself (the admin guard must apply only to `/admin`).

### Everyone was logged out after a deploy

`SECRET_SESSION_KEY` changed, or Production and Preview values were swapped. Sessions signed with the old key are invalid by design. Users log in again.

### Database connection failed

1. `DATABASE_URL` and `DATABASE_AUTH_TOKEN` must be correct for the environment you are in.
2. Locally, `mise run db:serve` must be running and `.env` must say `DATABASE_URL="http://127.0.0.1:8080"`. A `file:` URL fails with the web client.
3. Check mise is loading your variables without printing secrets: `mise env | grep -c DATABASE_URL` should print `1`. #pragma: allowlist secret
4. Test the remote database: `turso db shell banned-books-jeopardy`.
5. Make sure the Turso database is active (not sleeping) and you picked a nearby region.

### Sounds not playing

1. Look in the browser console for an autoplay-policy error. The first sound must follow a user click.
2. Confirm the file exists in `static/sounds/` and the name has no `.mp3` in the `playSound` call.
3. Test in the console: `new Audio('/sounds/tile-click.mp3').play()`.

### Game state not persisting

1. `localStorage` is disabled in private/incognito windows in some browsers.
2. Confirm `gameState.init(boardId)` is called in `onMount`.
3. Look for a storage-quota error in the console.
4. Clear old states: `Object.keys(localStorage).filter((k) => k.startsWith('game-state-')).forEach((k) => localStorage.removeItem(k))`.

### Tiles not flipping

1. Inspect the element and confirm the `flipped` class is added on click.
2. Confirm Tailwind is loaded (`@import 'tailwindcss';` in `src/app.css`).
3. Test the transition in isolation:

   ```css
   .tile {
     transition: transform 0.6s;
   }
   .tile.flipped {
     transform: rotateY(180deg);
   }
   ```

4. Check the console for errors that stop state updates.

### Timer is inaccurate

The timer must compute `remaining` from a fixed end time (see [Timer Component](#4-timer-component)). Counting ticks drifts, especially in background tabs. Also check that only one `Timer` is mounted at a time and that cleanup runs when it unmounts.

---

## Resources and Quick Reference

### Documentation

- [SvelteKit](https://svelte.dev/docs/kit) and [Svelte 5 runes](https://svelte.dev/docs/svelte/what-are-runes)
- [SvelteKit adapter-cloudflare](https://svelte.dev/docs/kit/adapter-cloudflare)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/) · [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) · [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview) · [Turso](https://docs.turso.tech/)
- [Auth0](https://auth0.com/docs) · [jose](https://github.com/panva/jose)
- [mise](https://mise.jdx.dev/)

### Project docs

- [ROADMAP.md](./ROADMAP.md): future features
- [CONTRIBUTING.md](./CONTRIBUTING.md): contribution guidelines
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md): community standards
- [DEPLOYMENT.md](./DEPLOYMENT.md): 🔲 must be rewritten for Cloudflare Pages (it describes Vercel today)

### Which file do I edit?

| Task                         | Files                                                              |
| ---------------------------- | ------------------------------------------------------------------ |
| Add a route                  | `src/routes/<path>/+page.svelte` (+ `+page.server.ts` for data)    |
| Change the database          | `src/lib/server/db/schema.ts`, then `mise run db:generate`         |
| Change login / sessions      | `src/lib/server/auth/`, `src/hooks.server.ts`, `src/routes/auth/`  |
| Change who can do what       | `src/lib/utils/permissions.ts` and the server action that calls it |
| Change styling or colors     | `src/app.css`, component files                                     |
| Add a sound                  | `static/sounds/`, `src/lib/utils/sounds.ts`                        |
| Change game progress logic   | `src/lib/stores/gameStore.ts` (verify name)                        |
| Change hosting config        | `svelte.config.js`, `wrangler.toml`, `src/app.d.ts`                |
| Change tasks / tool versions | `.mise.toml`                                                       |
| Change deploy automation     | `.github/workflows/deploy-cloudflare.yml`                          |

### Command cheat sheet

```bash
# Daily work
mise run dev               # http://localhost:5173
mise run check && mise run lint && mise run test:unit

# Local database
mise run db:serve          # terminal 1, keep running
mise run db:push           # local only
mise run db:studio

# Before deploying
mise run preview:cf        # http://localhost:8788, real Workers runtime

# Deploy
mise run deploy            # production (main only)
mise run deploy:preview    # preview of the current branch

# Production database changes
mise run db:generate
PROD_DATABASE_URL="libsql://..." PROD_DATABASE_AUTH_TOKEN="..." mise run db:migrate:prod

# Tools
mise current               # active tool versions
mise tasks                 # every task
mise exec -- <command>     # run any command with the right tools
```

---

**Last Updated**: 2026-10-28 (document rewritten for Cloudflare Pages; code status last verified 2025-10)
**Maintainer**: Imamiland
**License**: MIT

For questions or issues with this guide, open an issue on GitHub or contact the maintainers.
