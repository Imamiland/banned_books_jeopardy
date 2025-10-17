# GitHub Copilot Instructions

## Project Overview

This is a **SvelteKit 2** (Svelte 5) web app for live Jeopardy-style trivia events at University of Toledo's Banned Books Vigil. The app is optimized for **single-game projection** during live events, not multi-user concurrent gaming.

## Architecture & Stack

### Core Technologies

- **Framework**: SvelteKit 2.x with Svelte 5 (runes: `$state`, `$derived`, `$effect`, `$props`)
- **Database**: Turso (libSQL/SQLite) via Drizzle ORM
- **Styling**: Tailwind CSS 4 with native cascade layers
- **Auth**: Auth0 (planned - not yet implemented)
- **Deployment**: Vercel (adapter-Vercel)
- **Version Management**: mise for Node.js 22.20.0 + environment variables

### Database Schema Pattern

Schema in `src/lib/server/db/schema.ts` follows this structure:

- **Boards** (1) → **Categories** (5) → **Questions** (5 each = 25 total)
- Questions have values: 100, 200, 300, 400, 500
- Use Drizzle's `sqliteTable` with `integer`, `text` types
- Timestamps use `integer('created_at', { mode: 'timestamp' })` with `sql\`(unixepoch())\``

Current schema is placeholder - needs expansion per `AI_ONBOARDING.md` design.

## Development Workflow

### Environment Setup

```bash
mise trust && mise install  # Auto-installs Node 22.20.0, loads .env
pnpm install
pnpm db:push                # Sync schema to Turso
pnpm dev                    # Start on :5173
```

**Critical**: Always run `mise trust` after cloning - it manages Node version AND loads `.env` vars.

### Key Commands

- `pnpm check` - Type-check (runs `svelte-check`)
- `pnpm format` - Auto-format with Prettier (runs before releases)
- `pnpm lint` - ESLint + Prettier check
- `pnpm test` - Vitest unit + Playwright E2E
- `pnpm db:studio` - Open Drizzle Studio GUI

### Database Workflow

1. Edit `src/lib/server/db/schema.ts`
2. Run `pnpm db:push` (dev) or `pnpm db:migrate` (prod migrations)
3. Drizzle config in `drizzle.config.ts` requires `DATABASE_URL` + `DATABASE_AUTH_TOKEN`

## Code Conventions

### Svelte 5 Runes (Mandatory)

**Use runes, NOT stores** for component state:

```svelte
<script lang="ts">
  let count = $state(0); // Reactive state
  let doubled = $derived(count * 2); // Derived value
  let { title, onSave } = $props<{ title: string; onSave?: () => void }>();
</script>
```

### TypeScript Standards

- **Strict mode enabled** - No `any`, use `unknown` or proper types
- Props must be typed: `$props<{ title: string }>()`
- Avoid type assertions unless unavoidable

### Tailwind CSS 4 Patterns

- Import in `app.css`: `@import 'tailwindcss';`
- Use `@plugin` for official plugins (typography, forms, etc.)
- Define custom colors by adding CSS variables to the `:root` selector in your CSS:

  ```css
  :root {
    --color-jeopardy-blue: rgb(6, 12, 233);
    --color-jeopardy-gold: rgb(255, 215, 0);
  }
  ```

- Border color compatibility layer exists in `app.css` - preserve it

### File Naming

- Components: `PascalCase.svelte` (e.g., `GameBoard.svelte`)
- Routes: SvelteKit convention (`+page.svelte`, `+layout.svelte`, `+server.ts`)
- Utilities: `camelCase.ts` (e.g., `src/lib/utils/sounds.ts`)

## Commit & Release Process

### Conventional Commits (Required)

Format: `<type>(<scope>): <subject>`

**Types**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `ci`

Examples:

```markdown
feat(game): add countdown timer with sound effects
fix(auth): resolve redirect loop on callback
docs(readme): update setup instructions
chore(deps): upgrade drizzle-orm to 0.44.6
```

**Why**: Semantic Release auto-generates changelogs and versions based on commit types.

### Pre-commit Hooks

- **Formatting**: Auto-runs on commit (via pre-commit framework)
- **Protected Branches**: Cannot commit directly to `main` or `next`
- Linting runs on pre-push

### Branch Strategy

- `main` → Production (banned-books-jeopardy on Vercel)
- `next` → Staging with pre-releases (versions like `1.0.0-next.1`)
- Feature branches → Merge to `next` → Eventually merge to `main`

## GitHub Project Management

### Issue Templates (YAML Forms)

**Location**: `.github/ISSUE_TEMPLATE/`

The project uses modern GitHub Form templates (YAML format) with structured fields and validation:

1. **Bug Report** (`bug_report.yml`):

   - Structured fields: description, reproduction steps, expected/actual behavior
   - Dropdowns: severity (Critical/High/Medium/Low), browser, OS
   - Version fields: browser version, Node.js version
   - Console logs section with syntax highlighting
   - Screenshot/video upload area
   - Required pre-submission checklist

2. **Feature Request** (`feature_request.yml`):

   - Structured fields: description, problem statement, proposed solution
   - Feature area dropdown: Backend, Frontend, Testing, Documentation, Infrastructure, Auth & Security, Game Mechanics, Admin Dashboard, Board Creation/Editing, Sound/Audio, Animations/UI
   - Priority dropdown (P0-P4)
   - User type dropdown: Player, Creator, Administrator, All users
   - Impact areas checkboxes: UX, Performance, Accessibility, Security, Database Schema, API/Backend, UI/Frontend, Documentation
   - Mockups/examples upload area

3. **Documentation Update** (`documentation.yml`):

   - Documentation location checkboxes
   - Issue type dropdown: Missing, Incorrect/outdated, Unclear, Broken links, Typo/grammar, etc.
   - Current content and proposed changes sections (markdown rendered)
   - Target audience dropdown
   - Documentation scope checkboxes

4. **Template Configuration** (`config.yml`):
   - Disables blank issues
   - Links to GitHub Discussions and Security Advisories

**Key Benefits**:

- Structured data collection (no free-form text)
- Dropdown validation (standardized values)
- Required field enforcement
- Better data quality for automation
- Improved user experience with form controls

### GitHub Projects Structure

**Setup Guide**: `.github/PROJECT_SETUP.md`

The repository uses GitHub Projects (v2) for issue tracking with custom fields:

**Custom Fields**:

- **Priority**: P0 (Critical) / P1 (High) / P2 (Medium) / P3 (Low) / P4 (Nice to have)
- **Size**: XS (< 1 day) / S (1-2 days) / M (3-5 days) / L (1-2 weeks) / XL (> 2 weeks)
- **Type**: Conventional Commit types (feat, fix, docs, chore, refactor, test, perf, ci)
- **Feature Area**: Backend, Frontend, Testing, Documentation, Infrastructure, Auth & Security
- **Milestone**: MVP, Alpha, Beta, Release Candidate, Release 1.0
- **Sprint**: Sprint number for agile planning

**Project Views** (10 views total):

1. Kanban Board (default)
2. Feature Area Board (grouped by area)
3. Priority Matrix (P0-P4 columns)
4. Bug Tracker (bugs only)
5. Feature Backlog (enhancements only)
6. Documentation Tasks
7. Current Sprint
8. Roadmap Timeline (by milestone)
9. Size Estimate View
10. All Issues Table

**Automation** (`.github/workflows/project-automation.yml`):

- Auto-labeling based on issue type
- Priority triage (P0 issues trigger alerts)
- PR status sync to project board
- Welcome messages for first-time contributors
- Auto-assignment based on feature area

**Label System** (`.github/LABELS.md`):

- Type labels: bug, enhancement, documentation, chore, etc.
- Priority labels: P0, P1, P2, P3, P4
- Size labels: XS, S, M, L, XL
- Feature area labels: backend, frontend, testing, documentation, infrastructure, auth-security
- Status labels: needs triage, in progress, blocked, ready for review
- Milestone labels: MVP, alpha, beta, RC, release-1.0
- Workflow labels: good first issue, help wanted, breaking change, security

**Creating Issues**:

- Use YAML form templates (auto-fills labels)
- Maintainers set Priority, Size, Feature Area, Milestone fields
- Automation adds issues to project board
- Labels applied based on template selection

### Project Automation Workflow

The `project-automation.yml` workflow provides 5 automation jobs:

1. **Auto-Label**: Applies type labels (bug, enhancement, docs) based on template selection
2. **Triage Priority**: Alerts on P0 (Critical) issues, auto-assigns based on feature area
3. **Sync PR Status**: Updates project board when PRs are opened/merged/closed
4. **Welcome**: Welcomes first-time contributors
5. **Auto-Assign**: Assigns issues to team members based on feature area expertise

**Configuration Requirements**:

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- Project board must be created manually via GitHub web UI (cannot be automated via API)
- Labels created via GitHub CLI script in `.github/LABELS.md`

## Project-Specific Patterns

### Game State Management

**Local Storage Pattern** - Game progress stored in `localStorage` (browser-side only):

```typescript
// src/lib/stores/gameState.ts
interface GameState {
  boardId: number;
  revealedTiles: number[]; // Array of question IDs
  currentQuestion: number | null;
  startedAt: number;
  score?: number; // Optional scoring
}

// Key format
const key = `game-state-${boardId}`;

// Initialize on mount
gameState.init(boardId);

// Persist on changes
gameState.revealTile(questionId);

// Clear on reset
gameState.reset(boardId);
```

**Implementation Pattern**:

```svelte
<!-- src/routes/game/[boardId]/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState } from '$lib/stores/gameState';

  let { data } = $props();

  onMount(() => {
    gameState.init(data.boardId);
  });
</script>
```

### Sound Effects Architecture

**Required Sound Files** (`static/sounds/`):

| File                 | Purpose             | Duration | Loop |
| -------------------- | ------------------- | -------- | ---- |
| `tile-click.mp3`     | Tile click feedback | 0.1-0.3s | No   |
| `tile-flip.mp3`      | Flip animation      | 0.5-0.8s | No   |
| `timer-tick.mp3`     | Countdown ticking   | 1s       | Yes  |
| `timer-expire.mp3`   | Time's up buzzer    | 1-2s     | No   |
| `answer-reveal.mp3`  | Answer reveal       | 1-3s     | No   |
| `board-complete.mp3` | Game completion     | 3-5s     | No   |

**Utility Implementation** (`src/lib/utils/sounds.ts`):

```typescript
const soundCache = new Map<string, HTMLAudioElement>();

export function playSound(soundName: string, loop = false): HTMLAudioElement {
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

export function stopSound(soundName: string): void {
  const audio = soundCache.get(soundName);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
```

**Usage Example**:

```svelte
<script lang="ts">
  import { playSound, stopSound } from '$lib/utils/sounds';

  function handleTileClick() {
    playSound('tile-click');
    // ... reveal tile logic
  }

  function startTimer() {
    const tickAudio = playSound('timer-tick', true);

    // Stop when timer expires
    setTimeout(() => {
      stopSound('timer-tick');
      playSound('timer-expire');
    }, 30000);
  }
</script>

<button onclick={handleTileClick}>Click Tile</button>
```

**Browser Autoplay Policy**: First sound MUST play after user interaction. Pre-initialize audio context on first click.

### Auth0 Integration

**Setup Configuration**:

1. **Auth0 Application Settings**:

   - Application Type: Regular Web Application
   - Allowed Callback URLs: `http://localhost:5173/auth/callback`, `https://your-domain.vercel.app/auth/callback`
   - Allowed Logout URLs: `http://localhost:5173`, `https://your-domain.vercel.app`
   - Token Endpoint Authentication Method: Post

2. **Environment Variables** (`.env`):

```bash
AUTH0_DOMAIN="your-tenant.auth0.com"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret" # pragma: allowlist secret
AUTH0_CALLBACK_URL="http://localhost:5173/auth/callback"
AUTH0_LOGOUT_URL="http://localhost:5173"
AUTH0_AUDIENCE="https://your-api-audience"  # Optional
AUTH0_SCOPE="openid profile email"
```

1. **Role Configuration** (Auth0 Dashboard → User Management → Roles):

```json
// Define three roles
{
  "roles": [
    {
      "name": "administrator",
      "description": "Full access - manage all boards and users"
    },
    {
      "name": "creator",
      "description": "Create and edit own boards"
    },
    {
      "name": "player",
      "description": "View and play games only"
    }
  ]
}
```

1. **Auth0 Action** (to add roles to tokens):

```javascript
// Auth0 Dashboard → Actions → Library → Create Action
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://banned-books-jeopardy.app';

  if (event.authorization) {
    // Add roles to ID token
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);

    // Add roles to access token
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
};
```

**Implementation Pattern**:

```typescript
// src/hooks.server.ts
import { SvelteKitAuth } from '@auth0/sveltekit-auth0';
import { AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_DOMAIN } from '$env/static/private';

export const handle = SvelteKitAuth({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
  clientSecret: AUTH0_CLIENT_SECRET,
  authorizationParams: {
    redirect_uri: AUTH0_CALLBACK_URL,
    scope: AUTH0_SCOPE
  }
});
```

```typescript
// src/lib/stores/auth.ts
import { writable } from 'svelte/store';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'administrator' | 'creator' | 'player';
}

export const user = writable<User | null>(null);

export function isAuthenticated(): boolean {
  let currentUser: User | null = null;
  user.subscribe((u) => (currentUser = u))();
  return currentUser !== null;
}
```

**RBAC Helper** (`src/lib/utils/permissions.ts`):

```typescript
export type Role = 'administrator' | 'creator' | 'player';

export interface User {
  id: string;
  role: Role;
}

export interface Board {
  id: number;
  createdBy: string;
  published: boolean;
}

export function canViewBoard(user: User | null, board: Board): boolean {
  // Anyone can view published boards
  if (board.published) return true;

  // Must be authenticated to view unpublished
  if (!user) return false;

  // Admins can view any board
  if (user.role === 'administrator') return true;

  // Creators can view their own boards
  if (user.role === 'creator' && board.createdBy === user.id) return true;

  return false;
}

export function canEditBoard(user: User | null, board: Board): boolean {
  if (!user) return false;

  // Admins can edit any board
  if (user.role === 'administrator') return true;

  // Creators can edit their own boards
  if (user.role === 'creator' && board.createdBy === user.id) return true;

  return false;
}

export function canDeleteBoard(user: User | null, board: Board): boolean {
  if (!user) return false;

  // Only admins can delete boards
  if (user.role === 'administrator') return true;

  return false;
}

export function canManageUsers(user: User | null): boolean {
  return user?.role === 'administrator';
}
```

**Usage in Routes**:

```typescript
// src/routes/admin/boards/[id]/edit/+page.server.ts
import { error } from '@sveltejs/kit';
import { canEditBoard } from '$lib/utils/permissions';
import { db } from '$lib/server/db';

export async function load({ params, locals }) {
  const user = locals.user;
  const board = await db.boards.findUnique({ where: { id: params.id } });

  if (!board) {
    throw error(404, 'Board not found');
  }

  if (!canEditBoard(user, board)) {
    throw error(403, 'You do not have permission to edit this board');
  }

  return { board };
}
```

## Testing Strategy

### Unit Tests (Vitest)

**Location**: `src/**/*.{test,spec}.ts` (co-located with source files)

**Configuration** (`vite.config.ts`):

```typescript
export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}']
  }
});
```

**Test Patterns**:

```typescript
// src/lib/utils/sounds.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playSound, stopSound } from './sounds';

describe('Sound utilities', () => {
  beforeEach(() => {
    // Mock HTMLAudioElement
    global.HTMLAudioElement = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      currentTime: 0,
      loop: false
    }));
  });

  it('should create and cache audio elements', () => {
    const audio1 = playSound('tile-click');
    const audio2 = playSound('tile-click');

    expect(audio1).toBe(audio2); // Same cached instance
  });

  it('should enable looping when specified', () => {
    const audio = playSound('timer-tick', true);
    expect(audio.loop).toBe(true);
  });

  it('should stop and reset audio', () => {
    const audio = playSound('tile-click');
    stopSound('tile-click');

    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });
});
```

```typescript
// src/lib/utils/permissions.test.ts
import { describe, it, expect } from 'vitest';
import { canEditBoard, canDeleteBoard, canViewBoard } from './permissions';

describe('Permission checks', () => {
  const adminUser = { id: '1', role: 'administrator' as const };
  const creatorUser = { id: '2', role: 'creator' as const };
  const playerUser = { id: '3', role: 'player' as const };

  const publicBoard = { id: 1, createdBy: '2', published: true };
  const draftBoard = { id: 2, createdBy: '2', published: false };

  describe('canViewBoard', () => {
    it('allows anyone to view published boards', () => {
      expect(canViewBoard(null, publicBoard)).toBe(true);
      expect(canViewBoard(playerUser, publicBoard)).toBe(true);
    });

    it('allows creator to view their own draft', () => {
      expect(canViewBoard(creatorUser, draftBoard)).toBe(true);
    });

    it('allows admin to view any draft', () => {
      expect(canViewBoard(adminUser, draftBoard)).toBe(true);
    });

    it('denies player viewing others drafts', () => {
      expect(canViewBoard(playerUser, draftBoard)).toBe(false);
    });
  });

  describe('canEditBoard', () => {
    it('allows admin to edit any board', () => {
      expect(canEditBoard(adminUser, publicBoard)).toBe(true);
      expect(canEditBoard(adminUser, draftBoard)).toBe(true);
    });

    it('allows creator to edit own boards', () => {
      expect(canEditBoard(creatorUser, draftBoard)).toBe(true);
    });

    it('denies creator editing others boards', () => {
      const otherBoard = { ...draftBoard, createdBy: '999' };
      expect(canEditBoard(creatorUser, otherBoard)).toBe(false);
    });

    it('denies player editing any board', () => {
      expect(canEditBoard(playerUser, publicBoard)).toBe(false);
    });
  });

  describe('canDeleteBoard', () => {
    it('allows only admins to delete', () => {
      expect(canDeleteBoard(adminUser, publicBoard)).toBe(true);
      expect(canDeleteBoard(creatorUser, draftBoard)).toBe(false);
      expect(canDeleteBoard(playerUser, publicBoard)).toBe(false);
    });
  });
});
```

```typescript
// src/lib/stores/gameState.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gameState } from './gameState';

describe('Game state management', () => {
  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };
  });

  it('initializes with empty state', () => {
    gameState.init(1);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'game-state-1',
      expect.stringContaining('"revealedTiles":[]')
    );
  });

  it('persists revealed tiles', () => {
    gameState.init(1);
    gameState.revealTile(5);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'game-state-1',
      expect.stringContaining('"revealedTiles":[5]')
    );
  });

  it('clears state on reset', () => {
    gameState.reset(1);
    expect(localStorage.removeItem).toHaveBeenCalledWith('game-state-1');
  });
});
```

**Run Commands**:

```bash
pnpm test:unit              # Run all unit tests
pnpm test:unit -- --watch   # Watch mode
pnpm test:unit -- --coverage # With coverage report
```

### E2E Tests (Playwright)

**Location**: `e2e/*.test.ts`

**Configuration** (`playwright.config.ts`):

```typescript
export default defineConfig({
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173
  },
  testDir: 'e2e',
  use: {
    baseURL: 'http://localhost:4173'
  }
});
```

**Test Patterns**:

```typescript
// e2e/game-board.test.ts
import { expect, test } from '@playwright/test';

test.describe('Game Board Display', () => {
  test('displays 5 categories and 25 tiles', async ({ page }) => {
    await page.goto('/game/1');

    // Check categories
    const categories = page.locator('.category-header');
    await expect(categories).toHaveCount(5);

    // Check question tiles
    const tiles = page.locator('.question-tile');
    await expect(tiles).toHaveCount(25);
  });

  test('shows correct point values', async ({ page }) => {
    await page.goto('/game/1');

    // Values: 100, 200, 300, 400, 500 per category
    const values = [100, 200, 300, 400, 500];
    for (const value of values) {
      const tiles = page.locator(`.question-tile:has-text("${value}")`);
      await expect(tiles).toHaveCount(5); // One per category
    }
  });
});

test.describe('Tile Interaction', () => {
  test('flips tile on click and shows question', async ({ page }) => {
    await page.goto('/game/1');

    const firstTile = page.locator('.question-tile').first();
    await firstTile.click();

    // Wait for flip animation
    await expect(firstTile).toHaveClass(/flipped/);

    // Question should be visible
    const question = page.locator('.question-text');
    await expect(question).toBeVisible();
  });

  test('starts countdown timer after tile click', async ({ page }) => {
    await page.goto('/game/1');

    await page.locator('.question-tile').first().click();

    // Timer should appear
    const timer = page.locator('.timer');
    await expect(timer).toBeVisible();

    // Should show 30 seconds
    await expect(timer).toContainText('30');

    // Wait and verify countdown
    await page.waitForTimeout(2000);
    await expect(timer).not.toContainText('30');
  });

  test('reveals answer after timeout', async ({ page }) => {
    // Set short timeout for testing
    await page.goto('/game/1');

    await page.locator('.question-tile').first().click();

    // Wait for timeout (use test-specific short timeout)
    await page.waitForTimeout(3000);

    // Answer should be revealed
    const answer = page.locator('.answer-text');
    await expect(answer).toBeVisible();
  });

  test('marks tile as answered', async ({ page }) => {
    await page.goto('/game/1');

    const tile = page.locator('.question-tile').first();
    await tile.click();

    // Wait for answer reveal
    await page.waitForTimeout(3000);

    // Tile should be marked as answered
    await expect(tile).toHaveClass(/answered/);
  });
});

test.describe('Game State Persistence', () => {
  test('persists progress in localStorage', async ({ page }) => {
    await page.goto('/game/1');

    // Click a tile
    await page.locator('.question-tile').first().click();
    await page.waitForTimeout(3000);

    // Reload page
    await page.reload();

    // Tile should still be marked as answered
    const tile = page.locator('.question-tile').first();
    await expect(tile).toHaveClass(/answered/);
  });

  test('resets game when reset button clicked', async ({ page }) => {
    await page.goto('/game/1');

    // Answer a tile
    await page.locator('.question-tile').first().click();
    await page.waitForTimeout(3000);

    // Click reset
    await page.locator('button:has-text("Reset Game")').click();

    // Confirm dialog (if present)
    page.on('dialog', (dialog) => dialog.accept());

    // All tiles should be reset
    const answeredTiles = page.locator('.question-tile.answered');
    await expect(answeredTiles).toHaveCount(0);
  });
});

test.describe('Admin Features', () => {
  test.skip('allows admin to edit boards', async ({ page }) => {
    // Login as admin (Auth0 integration needed)
    // await page.goto('/auth/login');
    // ... auth flow ...

    await page.goto('/admin/boards/1/edit');

    // Should see edit form
    await expect(page.locator('form')).toBeVisible();
  });

  test.skip('denies non-admin access to edit', async ({ page }) => {
    // Login as player
    await page.goto('/admin/boards/1/edit');

    // Should redirect or show error
    await expect(page.locator('text=403')).toBeVisible();
  });
});
```

```typescript
// e2e/sound-effects.test.ts
import { expect, test } from '@playwright/test';

test.describe('Sound Effects', () => {
  test('plays click sound when tile clicked', async ({ page }) => {
    await page.goto('/game/1');

    // Listen for audio play events
    const audioPromise = page.waitForEvent('console', (msg) =>
      msg.text().includes('Playing sound: tile-click')
    );

    await page.locator('.question-tile').first().click();

    // Verify sound was triggered (implementation-dependent)
    // This assumes you log sound plays in development
  });

  test('loops timer tick sound during countdown', async ({ page }) => {
    await page.goto('/game/1');

    await page.locator('.question-tile').first().click();

    // Verify looping audio element exists
    const audio = await page.locator('audio[loop]').count();
    expect(audio).toBeGreaterThan(0);
  });
});
```

**Run Commands**:

```bash
pnpm test:e2e              # Run all E2E tests
pnpm test:e2e --ui         # Interactive UI mode
pnpm test:e2e --debug      # Debug mode
pnpm test:e2e --project=chromium  # Specific browser
```

**Critical Test Coverage**:

1. **Game Board Display**: Categories, tiles, values
2. **Tile Interactions**: Click, flip, reveal
3. **Timer Functionality**: Countdown, expiration
4. **State Persistence**: localStorage, reset
5. **Auth & Permissions**: Login, RBAC checks
6. **Sound Effects**: Play, loop, stop
7. **Error Handling**: 404, 403, network errors
8. **Accessibility**: Keyboard navigation, screen readers

## Integration Points

### Turso Database

- Connection via `@libsql/client` with `DATABASE_URL` + `DATABASE_AUTH_TOKEN`
- Local dev: Use `DATABASE_URL="file:local.db"` (no token needed)
- Schema driver: `turso` (libSQL), dialect: `sqlite`

### Vercel Deployment

- Auto-deploys on push via GitHub integration
- Environment vars set in Vercel dashboard
- Adapter: `@sveltejs/adapter-vercel` (configured in `svelte.config.js`)

### mise Tool Management

- `.mise.toml` locks Node 22.20.0, Python 3.12 (for pre-commit), pre-commit 4.3.0
- Loads `.env` file automatically when in project directory
- Run `mise doctor` to verify setup

## Common Pitfalls

1. **Forgetting `mise trust`**: Leads to wrong Node version or missing env vars
2. **Using stores instead of runes**: Svelte 5 prefers runes for local state
3. **Direct commits to `main`/`next`**: Pre-commit hook blocks this
4. **Missing Conventional Commit format**: Breaks semantic versioning
5. **Tailwind v3 patterns**: This uses v4 - no `@tailwind` directives, use `@import`

## Current Development Stage

**Status**: Early development - basic SvelteKit scaffold exists

### ✅ Completed

- SvelteKit 2 + Svelte 5 (runes) configured
- Tailwind CSS 4 integrated with plugins
- Drizzle ORM + Turso database connection
- mise environment management (Node 22.20.0)
- pre-commit hooks (formatting, linting, branch protection)
- Semantic Release with Conventional Commits
- CI/CD pipelines (GitHub Actions)
- Sound effect file structure (`static/sounds/` with placeholders)
- **GitHub Projects structure** (`.github/PROJECT_SETUP.md` with 10 views, custom fields)
- **YAML-based issue templates** (bug report, feature request, documentation)
- **Project automation workflow** (auto-labeling, triage, PR sync, welcome, auto-assign)
- **Label system** (comprehensive labels with CLI creation script)

### 🚧 In Progress

- Database schema design (boards, categories, questions)
- Game state management patterns
- Testing infrastructure setup

### ❌ Not Yet Implemented

- Game board UI (5×5 grid layout)
- Tile flip animations
- Countdown timer component
- Sound effect integration
- Auth0 authentication
- RBAC permission system
- Admin dashboard
- Board creation/editing UI
- Question curation (need 25 questions)

**Next Steps** (Priority Order):

1. **Database Schema** (`src/lib/server/db/schema.ts`):

   - Implement boards, categories, questions tables
   - Add foreign key relationships
   - Run `pnpm db:push` to sync

2. **Question Curation**:

   - Research banned books trivia
   - Create 5 categories with 5 questions each
   - Store in database or seed script

3. **Game Board UI** (`src/routes/game/[boardId]/+page.svelte`):

   - 5×5 grid layout with Tailwind
   - Category headers (top row)
   - Question tiles with point values

4. **Tile Component** (`src/lib/components/QuestionTile.svelte`):

   - Click handler
   - Flip animation (CSS 3D transform)
   - State management (unplayed/playing/answered)

5. **Timer Component** (`src/lib/components/Timer.svelte`):

   - Countdown from 30 seconds
   - Visual display
   - Sound integration

6. **Sound Utilities** (`src/lib/utils/sounds.ts`):

   - Audio caching
   - Play/stop functions
   - Replace placeholder MP3s with actual sounds

7. **Auth0 Integration**:

   - Install `@auth0/sveltekit-auth0`
   - Configure hooks.server.ts
   - Implement login/logout routes

8. **Admin UI**:
   - Board creation form
   - Board editing form
   - Permission checks

**Reference**: See `ROADMAP.md` for full feature timeline and `AI_ONBOARDING.md` for detailed implementation guides.

## Reference Documentation

- **AI_ONBOARDING.md**: Comprehensive guide with architecture, schemas, and workflows
- **ROADMAP.md**: Feature priorities (short/medium/long term)
- **CONTRIBUTING.md**: Commit conventions, bug reporting, PR process
- **package.json scripts**: All available commands

When in doubt, reference `AI_ONBOARDING.md` first - it contains detailed implementation patterns and examples.
