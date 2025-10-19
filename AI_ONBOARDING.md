# AI Assistant Onboarding Guide

**Project**: Banned Books Jeopardy  
**Repository**: <https://github.com/Imamiland/banned_books_jeopardy>  
**Purpose**: Interactive Jeopardy game for live Banned Books Coalition events at University of Toledo

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Database Schema](#database-schema)
- [Authentication & Authorization](#authentication--authorization)
- [Environment Variables](#environment-variables)
- [Development Setup](#development-setup)
- [Key Features & Functionality](#key-features--functionality)
- [File Structure](#file-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Deployment](#deployment)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

Banned Books Jeopardy is a web application designed for live events where a Jeopardy-style game board is projected onto a screen. The application allows:

- **Public View**: Browse published Jeopardy boards and play games
- **Admin View**: Create, edit, and manage Jeopardy boards (authentication required)
- **Live Gameplay**: Interactive board with animations, countdown timers, and sound effects
- **Single-Game Focus**: Optimized for one live game at a time (not a multi-user concurrent gaming platform)

**Key Use Case**: During a live Banned Books Coalition event, an administrator logs in, selects a published board, projects it on a screen, and moderates the game with the live audience. Questions are revealed with animations, a countdown timer plays with ticking sounds, and answers are revealed after interaction or timeout.

---

## Tech Stack

### Frontend

- **Framework**: [SvelteKit 2](https://kit.svelte.dev/) (Svelte 5)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
  - Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`, `@tailwindcss/aspect-ratio`, `@tailwindcss/container-queries`
- **Language**: TypeScript

### Backend

- **Database**: [Turso](https://turso.tech/) (libSQL/SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Auth0](https://auth0.com/)

### DevOps & Tools

- **Package Manager**: pnpm (v9.15.2+)
- **Deployment**: [Vercel](https://vercel.com/)
- **Testing**: Playwright (E2E), Vitest (Unit)
- **Linting/Formatting**: ESLint, Prettier
- **CI/CD**: GitHub Actions, Semantic Release
- **Version Management**: [mise](https://mise.jdx.dev/) - Tool version, env vars, and task management

### Additional Tools

- Drizzle Kit for database migrations
- mise for managing Node.js versions, environment variables, and development tasks

---

## Project Architecture

### Application Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                      Public Landing Page                     │
│              (Browse Published Jeopardy Boards)              │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐         ┌───────▼────────┐
        │  Login (Auth0) │         │  Select Board  │
        │  [Admin View]  │         │   [Play Game]  │
        └───────┬────────┘         └───────┬────────┘
                │                           │
    ┌───────────┴────────────┐             │
    │                        │             │
┌───▼──────┐         ┌──────▼─────┐       │
│  Create  │         │Edit Boards │       │
│  Boards  │         │(Own/Admin) │       │
└──────────┘         └────────────┘       │
                                           │
                              ┌────────────▼────────────┐
                              │   Game Board Display    │
                              │  (5x5 Grid w/ Values)   │
                              └────────────┬────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │   Click Tile → Flip &   │
                              │   Show Question + Timer │
                              └────────────┬────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │   Timeout/Click →       │
                              │   Reveal Answer         │
                              └─────────────────────────┘
```

### State Management

- **Server State**: Persisted in Turso database (boards, categories, questions, users)
- **Session State**: Stored in browser localStorage (current game state, revealed tiles, timer state)
- **Authentication State**: Managed by Auth0 (session tokens, user profile)

---

## Database Schema

The database uses Turso (libSQL/SQLite) with Drizzle ORM. Below is the recommended schema:

### Schema Definition

```typescript
// src/lib/server/db/schema.ts

import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Auth0 user ID
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').notNull().default('player'), // 'administrator', 'creator', 'player'
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Boards Table
export const boards = sqliteTable('boards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Categories Table (5 per board)
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  boardId: integer('board_id')
    .notNull()
    .references(() => boards.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  order: integer('order').notNull(), // 0-4 for display order
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Questions Table (5 per category = 25 per board)
export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(), // 100, 200, 300, 400, 500
  question: text('question').notNull(), // The "answer" in Jeopardy format
  answer: text('answer').notNull(), // The "question" in Jeopardy format
  timeLimit: integer('time_limit').notNull().default(30), // seconds
  order: integer('order').notNull(), // 0-4 for display order
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
});

// Game Sessions Table (optional - for analytics/history)
export const gameSessions = sqliteTable('game_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  boardId: integer('board_id')
    .notNull()
    .references(() => boards.id),
  startedBy: text('started_by').references(() => users.id),
  startedAt: integer('started_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  completedAt: integer('completed_at', { mode: 'timestamp' })
});
```

### Key Schema Notes

1. **Users**: Synchronized with Auth0 on first login
2. **Boards**: Can be draft (`published: false`) or published (`published: true`)
3. **Categories**: Always 5 per board, ordered 0-4
4. **Questions**: Always 5 per category (values: 100, 200, 300, 400, 500)
5. **Cascade Deletes**: Deleting a board deletes all categories and questions
6. **Game Sessions**: Optional table for tracking when boards are played (analytics)

### Database Commands

```bash
# Push schema changes to Turso
pnpm db:push

# Generate migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

---

## Authentication & Authorization

### Auth0 Integration

The application uses Auth0 for authentication with role-based access control (RBAC).

#### Auth0 Setup

1. **Create Auth0 Application**
   - Type: Regular Web Application
   - Allowed Callback URLs: `http://localhost:5173/auth/callback`, `https://your-domain.vercel.app/auth/callback`
   - Allowed Logout URLs: `http://localhost:5173`, `https://your-domain.vercel.app`

2. **Configure Auth0 Roles** (in Auth0 Dashboard → User Management → Roles)
   - `administrator`: Full access (create, edit any board, manage users)
   - `creator`: Create new boards, edit own boards
   - `player`: View and play games only

3. **Add Roles to User Metadata**
   - Use Auth0 Actions or Rules to add `roles` to user tokens
   - Example Action:

     ```javascript
     exports.onExecutePostLogin = async (event, api) => {
       const namespace = 'https://your-domain.com';
       if (event.authorization) {
         api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
         api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
       }
     };
     ```

#### SvelteKit Auth Integration

Install Auth0 SDK:

```bash
pnpm add @auth0/auth0-spa-js
```

Create auth hooks in `src/hooks.server.ts`:

```typescript
// Verify Auth0 JWT, attach user to locals
// Check user role for protected routes
```

Create auth stores in `src/lib/stores/auth.ts`:

```typescript
// Writable store for user session
// Helper functions: login(), logout(), isAuthenticated()
```

#### Role-Based Access Control (RBAC)

| Role              | Permissions                                                |
| ----------------- | ---------------------------------------------------------- |
| **administrator** | Create boards, edit ANY board, delete boards, manage users |
| **creator**       | Create boards, edit OWN boards, view all published boards  |
| **player**        | View published boards, play games (no editing)             |

Implement RBAC in:

- Server-side load functions (`+page.server.ts`)
- API routes (`src/routes/api/+server.ts`)
- Client-side UI (show/hide admin buttons)

---

## Environment Variables

### Required Variables

Create a `.env` file in the project root (see `.env.example`):

```bash
# Database (Turso)
DATABASE_URL="libsql://your-database-name.turso.io"
DATABASE_AUTH_TOKEN="your-turso-auth-token"

# Auth0
AUTH0_DOMAIN="your-tenant.auth0.com"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret" # pragma: allowlist secret
AUTH0_CALLBACK_URL="http://localhost:5173/auth/callback"
AUTH0_LOGOUT_URL="http://localhost:5173"
AUTH0_AUDIENCE="https://your-api-audience" # Optional, for API access
AUTH0_SCOPE="openid profile email"

# Application
PUBLIC_APP_URL="http://localhost:5173"
SECRET_SESSION_KEY="generate-a-secure-random-string-here" # pragma: allowlist secret

# Vercel (for deployment)
VERCEL_URL="auto-provided-by-vercel"
VERCEL_ENV="production" # or "preview" or "development"
```

### Obtaining Credentials

#### Turso Database

```bash
# Install Turso CLI
brew install tursodatabase/tap/turso  # macOS
# or
curl -sSfL https://get.tur.so/install.sh | bash  # Linux/WSL

# Login
turso auth login

# Create database
turso db create banned-books-jeopardy

# Get database URL
turso db show banned-books-jeopardy --url

# Create auth token
turso db tokens create banned-books-jeopardy
```

#### Auth0

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create new application (Regular Web Application)
3. Copy Domain, Client ID, Client Secret from Settings tab
4. Configure Allowed Callback URLs and Logout URLs

#### Vercel

- Most Vercel variables are auto-configured on deployment
- Set environment variables in Vercel Dashboard → Project Settings → Environment Variables
- Add all above variables (except `PUBLIC_APP_URL` - use `VERCEL_URL` instead)

### Local Development

For local development, you can use a local SQLite database:

```bash
DATABASE_URL="file:local.db"
# No DATABASE_AUTH_TOKEN needed for local file
```

### Using mise for Environment Management

This project uses **mise** (formerly rtx) to manage:

1. **Tool Versions** (`.mise.toml`):
   - Node.js 22.20.0
   - Python 3.12 (for pre-commit hooks)
   - pre-commit 4.3.0

2. **Environment Variables**:
   - mise automatically loads variables from `.env` file
   - No need to manually source environment files
   - Variables are scoped to the project directory

3. **Benefits**:
   - Automatic tool version switching when entering the project directory
   - Team-wide consistency (everyone uses the same versions)
   - Simplified onboarding (mise handles tool installation)
   - Environment variables are automatically available

4. **Common mise Commands**:

   ```bash
   mise trust                 # Trust the .mise.toml configuration
   mise install              # Install all tools defined in .mise.toml
   mise current              # Show currently active tool versions
   mise ls                   # List all installed tools
   mise env                  # Show environment variables
   mise doctor               # Check mise setup and configuration
   ```

5. **Checking Your Setup**:

   ```bash
   # Verify Node.js version (should be 22.20.0)
   node --version

   # Verify mise is loading environment
   mise env | grep DATABASE_URL
   ```

---

## Development Setup

### Prerequisites

- **mise**: For managing tool versions and environment variables
  - Install: `curl https://mise.run | sh` (or see [mise installation guide](https://mise.jdx.dev/getting-started.html))
  - This will automatically install the correct Node.js version and other tools
- **Node.js**: 22.20.0 (automatically managed by mise)
- **pnpm**: >= 9.15.2 (install with `npm install -g pnpm` or use `corepack enable`)
- **Git**: For version control
- **Turso CLI**: For database management (optional for local dev)

### Initial Setup

```bash
# 1. Clone the repository
git clone https://github.com/Imamiland/banned_books_jeopardy.git
cd banned_books_jeopardy

# 2. Install mise (if not already installed)
curl https://mise.run | sh
# Follow the instructions to add mise to your shell

# 3. Trust and activate mise configuration
mise trust
mise install

# 4. Install dependencies
pnpm install

# 5. Copy environment variables
cp .env.example .env
# Edit .env with your credentials
# Note: mise will automatically load variables from .env

# 6. Set up database schema
pnpm db:push

# 7. Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

**Note**: `mise` automatically:

- Installs Node.js 22.20.0 (specified in `.mise.toml`)
- Loads environment variables from `.env` file
- Sets up pre-commit hooks (Python 3.12 for pre-commit tools)
- Ensures consistent tool versions across the team

### Development Commands

```bash
# Start dev server with hot reload
pnpm dev

# Type checking
pnpm check
pnpm check:watch  # Watch mode

# Linting & Formatting
pnpm lint         # Check for issues
pnpm format       # Auto-fix formatting

# Testing
pnpm test         # Run all tests
pnpm test:unit    # Unit tests only
pnpm test:e2e     # E2E tests only

# Database
pnpm db:push      # Push schema changes
pnpm db:migrate   # Generate migrations
pnpm db:studio    # Open database GUI

# Build
pnpm build        # Production build
pnpm preview      # Preview production build

# mise commands (for version/env management)
mise trust        # Trust configuration
mise install      # Install required tools
mise current      # Show active versions
mise doctor       # Verify setup
```

---

## Key Features & Functionality

### 1. Game Board Display

**Location**: `src/routes/game/[boardId]/+page.svelte`

- **Layout**: 5 columns (categories) × 5 rows (values: 100, 200, 300, 400, 500)
- **Styling**: Tailwind CSS with dark blue background, gold text (classic Jeopardy colors)
- **Animations**: CSS transitions for tile flips and rotations

#### Tile States

- **Unplayed**: Shows category name (top row) or point value
- **Playing**: Flips to show question text + countdown timer
- **Answered**: Flips to show answer text
- **Completed**: Grays out or marks as used

### 2. Question Flow

```markdown
┌──────────────┐
│ Click Tile │
└──────┬───────┘
│
▼
┌──────────────────────────────┐
│ Flip Animation (3D rotate) │
│ Play "whoosh" sound │
└──────┬───────────────────────┘
│
▼
┌──────────────────────────────┐
│ Display Question │
│ Start Countdown Timer │
│ Play "tick-tock" sound loop │
└──────┬───────────────────────┘
│
├─────────────┬──────────────┐
│ │ │
▼ ▼ ▼
┌─────────┐ ┌─────────┐ ┌──────────┐
│ Timeout │ │ Click │ │ Reset │
└────┬────┘ └────┬────┘ └────┬─────┘
│ │ │
└────────────┴────────────┘
│
▼
┌─────────────────────────┐
│ Stop Timer & Sound │
│ Flip to Show Answer │
│ Play "reveal" sound │
└─────────────────────────┘
```

### 3. Sound Effects

**Location**: `static/sounds/`

#### Required Sound Files

| File Name            | Description                  | Trigger                 |
| -------------------- | ---------------------------- | ----------------------- |
| `tile-click.mp3`     | Quick click/pop sound        | When tile is clicked    |
| `tile-flip.mp3`      | Whoosh/swoosh sound          | During flip animation   |
| `timer-tick.mp3`     | Clock ticking sound (looped) | While timer is running  |
| `timer-expire.mp3`   | Buzzer/bell sound            | When time runs out      |
| `answer-reveal.mp3`  | Dramatic reveal sound        | When answer is shown    |
| `board-complete.mp3` | Victory/completion sound     | When all tiles answered |

#### Sound Implementation

```typescript
// src/lib/utils/sounds.ts

const soundCache = new Map<string, HTMLAudioElement>();

export function playSound(soundName: string, loop = false) {
  if (!soundCache.has(soundName)) {
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    soundCache.set(soundName, audio);
  }

  const audio = soundCache.get(soundName)!;
  audio.loop = loop;
  audio.currentTime = 0;
  audio.play().catch((err) => console.error('Sound play failed:', err));

  return audio; // Return for stopping later
}

export function stopSound(soundName: string) {
  const audio = soundCache.get(soundName);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
```

**Note**: Browser autoplay policies may require user interaction before playing sounds. Ensure first sound plays after a user click.

### 4. Timer Component

**Location**: `src/lib/components/Timer.svelte`

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { playSound, stopSound } from '$lib/utils/sounds';

  let { timeLimit = 30, onExpire } = $props();
  let timeRemaining = $state(timeLimit);
  let intervalId: number;

  onMount(() => {
    const tickAudio = playSound('timer-tick', true);

    intervalId = setInterval(() => {
      timeRemaining--;

      if (timeRemaining <= 0) {
        stopSound('timer-tick');
        playSound('timer-expire');
        onExpire?.();
        clearInterval(intervalId);
      }
    }, 1000);
  });

  onDestroy(() => {
    stopSound('timer-tick');
    clearInterval(intervalId);
  });
</script>

<div class="timer text-4xl font-bold text-red-500">
  {timeRemaining}s
</div>
```

### 5. Local Storage Game State

**Location**: `src/lib/stores/gameState.ts`

Store game progress in localStorage to allow:

- Refreshing without losing progress
- Mid-game resets
- Resuming after accidental close

```typescript
import { writable } from 'svelte/store';

interface GameState {
  boardId: number;
  revealedTiles: number[]; // Array of question IDs
  currentQuestion: number | null;
  startedAt: number;
}

function createGameStateStore() {
  const { subscribe, set, update } = writable<GameState | null>(null);

  return {
    subscribe,
    init: (boardId: number) => {
      const key = `game-state-${boardId}`;
      const saved = localStorage.getItem(key);

      if (saved) {
        set(JSON.parse(saved));
      } else {
        const newState = {
          boardId,
          revealedTiles: [],
          currentQuestion: null,
          startedAt: Date.now()
        };
        set(newState);
        localStorage.setItem(key, JSON.stringify(newState));
      }
    },
    revealTile: (questionId: number) => {
      update((state) => {
        if (!state) return state;
        const newState = {
          ...state,
          revealedTiles: [...state.revealedTiles, questionId],
          currentQuestion: questionId
        };
        localStorage.setItem(`game-state-${state.boardId}`, JSON.stringify(newState));
        return newState;
      });
    },
    reset: (boardId: number) => {
      localStorage.removeItem(`game-state-${boardId}`);
      set(null);
    }
  };
}

export const gameState = createGameStateStore();
```

### 6. Admin Board Editor

**Location**: `src/routes/admin/boards/[id]/edit/+page.svelte`

Features:

- Form with 5 category inputs
- Each category has 5 question/answer pairs
- Value automatically assigned (100, 200, 300, 400, 500)
- Time limit per question (default 30s)
- Draft/Publish toggle
- Save button (validates all 25 questions filled)

**Permission Check**: Only `creator` (own boards) or `administrator` (any board) can edit.

---

## File Structure

```bash
banned_books_jeopardy/
├── .github/
│   └── workflows/           # GitHub Actions (CI/CD)
├── e2e/                     # Playwright E2E tests
├── src/
│   ├── lib/
│   │   ├── components/      # Reusable Svelte components
│   │   │   ├── Timer.svelte
│   │   │   ├── GameBoard.svelte
│   │   │   ├── QuestionTile.svelte
│   │   │   └── AdminNav.svelte
│   │   ├── server/
│   │   │   ├── db/
│   │   │   │   ├── index.ts      # Drizzle client
│   │   │   │   └── schema.ts     # Database schema
│   │   │   └── auth/
│   │   │       └── auth0.ts      # Auth0 integration
│   │   ├── stores/
│   │   │   ├── auth.ts           # Auth state
│   │   │   └── gameState.ts      # Game state
│   │   └── utils/
│   │       ├── sounds.ts         # Sound utilities
│   │       └── permissions.ts    # RBAC helpers
│   ├── routes/
│   │   ├── +layout.svelte        # Root layout
│   │   ├── +layout.server.ts     # Server layout (auth)
│   │   ├── +page.svelte          # Homepage (board list)
│   │   ├── admin/
│   │   │   ├── +layout.svelte    # Admin layout
│   │   │   └── boards/
│   │   │       ├── new/
│   │   │       │   └── +page.svelte   # Create board
│   │   │       └── [id]/
│   │   │           └── edit/
│   │   │               └── +page.svelte # Edit board
│   │   ├── game/
│   │   │   └── [boardId]/
│   │   │       └── +page.svelte  # Game board display
│   │   ├── auth/
│   │   │   ├── callback/         # Auth0 callback
│   │   │   └── logout/           # Logout handler
│   │   └── api/
│   │       └── boards/           # API endpoints
│   ├── app.css                   # Global styles
│   ├── app.html                  # HTML template
│   └── hooks.server.ts           # SvelteKit hooks
├── static/
│   ├── sounds/                   # MP3 sound effects
│   │   ├── tile-click.mp3
│   │   ├── tile-flip.mp3
│   │   ├── timer-tick.mp3
│   │   ├── timer-expire.mp3
│   │   ├── answer-reveal.mp3
│   │   └── board-complete.mp3
│   └── favicon.png
├── .env.example                  # Environment template
├── drizzle.config.ts             # Drizzle ORM config
├── svelte.config.js              # SvelteKit config
├── tailwind.config.js            # Tailwind CSS config
├── vite.config.ts                # Vite config
└── package.json
```

---

## Coding Standards

### TypeScript

- **Strict mode enabled**: All type errors must be resolved
- **Avoid `any`**: Use proper types or `unknown`
- **Use Svelte 5 runes**: `$state`, `$derived`, `$effect`, `$props`

### Svelte

- **Runes over stores** (Svelte 5): Prefer runes for local state
- **Component naming**: PascalCase (e.g., `GameBoard.svelte`)
- **Props**: Use `$props()` rune with TypeScript types

Example:

```svelte
<script lang="ts">
  interface Props {
    title: string;
    onSave?: () => void;
  }

  let { title, onSave } = $props<Props>();
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>
```

### Tailwind CSS

- **Use Tailwind 4 features**: Native cascade layers, `@theme`
- **Avoid inline styles**: Use Tailwind classes
- **Custom colors**: Define in `app.css` with `@theme`

Example:

```css
/* app.css */
@import 'tailwindcss';

@theme {
  --color-jeopardy-blue: #060ce9;
  --color-jeopardy-gold: #ffd700;
}
```

### Formatting

- **Prettier**: Auto-format on save
- **ESLint**: Fix linting errors before committing
- **Run before commit**:

  ```bash
  pnpm format && pnpm lint
  ```

### Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```markdown
feat: add countdown timer to game board
fix: resolve auth redirect loop
docs: update onboarding guide
chore: upgrade dependencies
```

This enables automatic changelog generation via Semantic Release.

---

## Testing

### Unit Tests (Vitest)

**Location**: `src/**/*.test.ts` or `src/**/*.spec.ts`

```typescript
// src/lib/utils/sounds.test.ts
import { describe, it, expect, vi } from 'vitest';
import { playSound } from './sounds';

describe('playSound', () => {
  it('should create and play audio', () => {
    const audio = playSound('tile-click');
    expect(audio).toBeInstanceOf(HTMLAudioElement);
  });
});
```

Run:

```bash
pnpm test:unit
```

### E2E Tests (Playwright)

**Location**: `e2e/**/*.test.ts`

```typescript
// e2e/game-board.test.ts
import { expect, test } from '@playwright/test';

test('should display game board with 5 categories', async ({ page }) => {
  await page.goto('/game/1');

  const categories = page.locator('.category');
  await expect(categories).toHaveCount(5);
});

test('should flip tile on click', async ({ page }) => {
  await page.goto('/game/1');

  const tile = page.locator('.tile').first();
  await tile.click();

  await expect(tile).toHaveClass(/flipped/);
});
```

Run:

```bash
pnpm test:e2e
```

### Test Coverage

Aim for:

- **Unit tests**: Utilities, stores, permissions logic
- **E2E tests**: User flows (login, create board, play game)
- **Critical paths**: Authentication, game state persistence

---

## Deployment

### Vercel Deployment

The project auto-deploys via GitHub integration:

- **Production**: `main` branch → `https://banned-books-jeopardy.vercel.app`
- **Preview**: Pull requests → `https://banned-books-jeopardy-<pr>.vercel.app`
- **Development**: `next` branch → `https://banned-books-jeopardy-git-next.vercel.app`

#### Manual Deployment

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Environment Variables on Vercel

1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add all variables from `.env` file
3. Set scope: Production, Preview, Development (as needed)
4. Redeploy after adding variables

---

## Common Tasks

### Task 1: Add a New Sound Effect

1. **Obtain MP3 file** (royalty-free or licensed)
2. **Rename** following convention: `action-description.mp3` (e.g., `correct-answer.mp3`)
3. **Place in** `static/sounds/`
4. **Update** `src/lib/utils/sounds.ts` if needed
5. **Use in component**:

   ```svelte
   <script>
     import { playSound } from '$lib/utils/sounds';
   </script>

   <button onclick={() => playSound('correct-answer')}> Correct! </button>
   ```

### Task 2: Create a New Board (via UI)

1. **Login** as `creator` or `administrator`
2. **Navigate** to `/admin/boards/new`
3. **Fill in**:
   - Board title
   - Description
   - 5 categories (with names)
   - 25 questions (5 per category)
4. **Set time limits** (default 30s)
5. **Save as draft** or **Publish**
6. Board appears in public list if published

### Task 3: Modify Database Schema

1. **Edit** `src/lib/server/db/schema.ts`
2. **Add/modify** table definitions
3. **Push changes**:

   ```bash
   pnpm db:push
   ```

4. **Generate migration** (for production):

   ```bash
   pnpm db:migrate
   ```

5. **Commit** migration files to git

### Task 4: Add a New Role

1. **Update** `users` table schema (if `role` enum needs expansion)
2. **Add role** in Auth0 Dashboard → User Management → Roles
3. **Update** permission checks in `src/lib/utils/permissions.ts`:

   ```typescript
   export function canEditBoard(user: User, board: Board): boolean {
     if (user.role === 'administrator') return true;
     if (user.role === 'moderator' && board.createdBy === user.id) return true;
     return false;
   }
   ```

4. **Update UI** to show/hide features based on role

### Task 5: Reset Game State

**In-game reset button**:

```svelte
<script>
  import { gameState } from '$lib/stores/gameState';
  let { boardId } = $props();
</script>

<button onclick={() => gameState.reset(boardId)}> Reset Game </button>
```

**Manual localStorage clear** (browser console):

```javascript
localStorage.removeItem('game-state-1'); // Replace 1 with boardId
```

---

## Troubleshooting

### Issue: Auth0 Redirect Loop

**Symptoms**: Browser keeps redirecting between app and Auth0

**Solutions**:

1. Check `AUTH0_CALLBACK_URL` matches exactly (including http/https)
2. Verify callback URL is added to the allowlist in Auth0 Dashboard
3. Clear browser cookies/cache
4. Check `hooks.server.ts` for infinite redirect logic

### Issue: Database Connection Failed

**Symptoms**: `Error: Failed to connect to database`

**Solutions**:

1. Verify `DATABASE_URL` and `DATABASE_AUTH_TOKEN` are correct
2. Check that mise is loading environment variables:

   ```bash
   mise env | grep DATABASE_URL
   ```

3. Test connection with Turso CLI:

   ```bash
   turso db shell banned-books-jeopardy
   ```

4. Check Turso database is active (not sleeping)
5. For local dev, use `DATABASE_URL="file:local.db"`

### Issue: Sounds Not Playing

**Symptoms**: Click events fire but no sound

**Solutions**:

1. Check browser console for autoplay policy errors
2. Ensure first sound plays after user interaction (click)
3. Verify MP3 files exist in `static/sounds/`
4. Check file paths are correct (`/sounds/filename.mp3`)
5. Test with:

   ```javascript
   new Audio('/sounds/tile-click.mp3').play();
   ```

### Issue: Game State Not Persisting

**Symptoms**: Refresh loses progress

**Solutions**:

1. Check localStorage is enabled (not in private/incognito mode)
2. Verify `gameState.init()` is called on mount
3. Check browser console for localStorage quota errors
4. Clear old game states:

   ```javascript
   Object.keys(localStorage)
     .filter((key) => key.startsWith('game-state-'))
     .forEach((key) => localStorage.removeItem(key));
   ```

### Issue: Tiles Not Flipping

**Symptoms**: Click works but no animation

**Solutions**:

1. Check CSS classes are applied (inspect element)
2. Verify Tailwind is properly configured
3. Test with simple CSS transition:

   ```css
   .tile {
     transition: transform 0.6s;
   }
   .tile.flipped {
     transform: rotateY(180deg);
   }
   ```

4. Check for JavaScript errors blocking state updates

### Issue: Timer Countdown Inaccurate

**Symptoms**: Timer skips seconds or runs too fast/slow

**Solutions**:

1. Use `setInterval` with 1000ms, not `setTimeout` recursion
2. Account for execution time if needed
3. Clear interval on component destroy
4. Check for multiple timers running simultaneously

---

## Additional Resources

### Documentation

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Turso Docs](https://docs.turso.tech/)
- [Auth0 Docs](https://auth0.com/docs)
- [mise Documentation](https://mise.jdx.dev/) - Version and environment management

### Project-Specific Docs

- [ROADMAP.md](./ROADMAP.md) - Future features and timeline
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community standards
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guides

### Community

- GitHub Issues: Report bugs or request features
- GitHub Discussions: Ask questions, share ideas

---

## Quick Reference

### Key Files to Edit

| Task              | Files                                         |
| ----------------- | --------------------------------------------- |
| Add new route     | `src/routes/[path]/+page.svelte`              |
| Modify database   | `src/lib/server/db/schema.ts`                 |
| Update auth logic | `src/hooks.server.ts`, `src/lib/server/auth/` |
| Change styling    | `src/app.css`, component files                |
| Add sound effect  | `static/sounds/`, `src/lib/utils/sounds.ts`   |
| Update game state | `src/lib/stores/gameState.ts`                 |

### Environment Quick Start

```bash
# Minimal .env for local dev
DATABASE_URL="file:local.db" # pragma: allowlist secret
AUTH0_DOMAIN="dev-xxx.auth0.com"
AUTH0_CLIENT_ID="your-client-id"
AUTH0_CLIENT_SECRET="your-secret" # pragma: allowlist secret
AUTH0_CALLBACK_URL="http://localhost:5173/auth/callback"
SECRET_SESSION_KEY="any-random-string-for-local" # pragma: allowlist secret
```

### Commands Cheat Sheet

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm lint             # Check code quality
pnpm format           # Format code
pnpm test             # Run all tests

# Database
pnpm db:studio        # Open database GUI
pnpm db:push          # Update database schema

# mise (Version & Environment Management)
mise trust            # Trust .mise.toml config
mise install          # Install all required tools
mise current          # Show active tool versions
mise env              # Show environment variables
mise doctor           # Verify mise configuration
```

---

**Last Updated**: 2025-10-11  
**Maintainer**: Imamiland  
**License**: MIT

For questions or issues with this onboarding guide, please open an issue on GitHub or contact the maintainers.
