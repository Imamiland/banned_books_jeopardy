# Testing Guide

This document provides comprehensive testing patterns and examples for the Banned Books Jeopardy project.

## Table of Contents

- [Unit Testing with Vitest](#unit-testing-with-vitest)
- [E2E Testing with Playwright](#e2e-testing-with-playwright)
- [Testing Best Practices](#testing-best-practices)
- [Running Tests](#running-tests)

## Unit Testing with Vitest

### Configuration

Tests are configured in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true
  }
});
```

### Test File Structure

Place test files next to the code they test:

```text
src/
├── lib/
│   ├── utils/
│   │   ├── sounds.ts
│   │   ├── sounds.test.ts          ← Test file
│   │   ├── permissions.ts
│   │   └── permissions.test.ts     ← Test file
│   └── stores/
│       ├── gameState.ts
│       └── gameState.test.ts       ← Test file
```

### Example: Testing Sound Utilities

```typescript
// src/lib/utils/sounds.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { playSound, stopSound, preloadSound, clearSoundCache } from './sounds';

describe('Sound utilities', () => {
  beforeEach(() => {
    // Mock HTMLAudioElement
    global.HTMLAudioElement = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      currentTime: 0,
      loop: false,
      src: ''
    }));
  });

  afterEach(() => {
    clearSoundCache();
  });

  it('should create and cache audio elements', () => {
    const audio1 = playSound('tile-click');
    const audio2 = playSound('tile-click');

    // Same cached instance
    expect(audio1).toBe(audio2);
  });

  it('should enable looping when specified', () => {
    const audio = playSound('timer-tick', true);
    expect(audio.loop).toBe(true);
  });

  it('should not loop by default', () => {
    const audio = playSound('tile-click');
    expect(audio.loop).toBe(false);
  });

  it('should reset audio to start when playing', () => {
    const audio = playSound('tile-click');
    audio.currentTime = 5;

    playSound('tile-click');
    expect(audio.currentTime).toBe(0);
  });

  it('should stop and reset audio', () => {
    const audio = playSound('tile-click');
    stopSound('tile-click');

    expect(audio.pause).toHaveBeenCalled();
    expect(audio.currentTime).toBe(0);
  });

  it('should handle stopping non-existent sound gracefully', () => {
    expect(() => stopSound('non-existent')).not.toThrow();
  });

  it('should preload sound without playing', () => {
    preloadSound('tile-click');

    const audio = playSound('tile-click');
    expect(audio).toBeDefined();
  });

  it('should handle play errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.HTMLAudioElement = vi.fn().mockImplementation(() => ({
      play: vi.fn().mockRejectedValue(new Error('Autoplay blocked')),
      pause: vi.fn(),
      currentTime: 0,
      loop: false
    }));

    playSound('tile-click');

    // Wait for promise to reject
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should clear all cached sounds', () => {
    playSound('tile-click');
    playSound('tile-flip');

    clearSoundCache();

    // Cache should be empty - new audio element created
    const audio = playSound('tile-click');
    expect(audio).toBeDefined();
  });
});
```

### Example: Testing Permission Functions

```typescript
// src/lib/utils/permissions.test.ts
import { describe, it, expect } from 'vitest';
import {
  canViewBoard,
  canEditBoard,
  canDeleteBoard,
  canCreateBoard,
  canManageUsers,
  canPublishBoard
} from './permissions';
import type { User, Board } from './permissions';

describe('Permission checks', () => {
  const adminUser: User = { id: '1', role: 'administrator' };
  const creatorUser: User = { id: '2', role: 'creator' };
  const playerUser: User = { id: '3', role: 'player' };

  const publicBoard: Board = { id: 1, createdBy: '2', published: true };
  const draftBoard: Board = { id: 2, createdBy: '2', published: false };
  const otherUserBoard: Board = { id: 3, createdBy: '999', published: false };

  describe('canViewBoard', () => {
    it('allows anyone to view published boards', () => {
      expect(canViewBoard(null, publicBoard)).toBe(true);
      expect(canViewBoard(playerUser, publicBoard)).toBe(true);
      expect(canViewBoard(creatorUser, publicBoard)).toBe(true);
      expect(canViewBoard(adminUser, publicBoard)).toBe(true);
    });

    it('denies unauthenticated users viewing unpublished boards', () => {
      expect(canViewBoard(null, draftBoard)).toBe(false);
    });

    it('allows creator to view their own draft', () => {
      expect(canViewBoard(creatorUser, draftBoard)).toBe(true);
    });

    it('allows admin to view any draft', () => {
      expect(canViewBoard(adminUser, draftBoard)).toBe(true);
      expect(canViewBoard(adminUser, otherUserBoard)).toBe(true);
    });

    it('denies player viewing others drafts', () => {
      expect(canViewBoard(playerUser, draftBoard)).toBe(false);
      expect(canViewBoard(playerUser, otherUserBoard)).toBe(false);
    });

    it('denies creator viewing others drafts', () => {
      expect(canViewBoard(creatorUser, otherUserBoard)).toBe(false);
    });
  });

  describe('canEditBoard', () => {
    it('denies unauthenticated users', () => {
      expect(canEditBoard(null, publicBoard)).toBe(false);
      expect(canEditBoard(null, draftBoard)).toBe(false);
    });

    it('allows admin to edit any board', () => {
      expect(canEditBoard(adminUser, publicBoard)).toBe(true);
      expect(canEditBoard(adminUser, draftBoard)).toBe(true);
      expect(canEditBoard(adminUser, otherUserBoard)).toBe(true);
    });

    it('allows creator to edit own boards', () => {
      expect(canEditBoard(creatorUser, publicBoard)).toBe(true);
      expect(canEditBoard(creatorUser, draftBoard)).toBe(true);
    });

    it('denies creator editing others boards', () => {
      expect(canEditBoard(creatorUser, otherUserBoard)).toBe(false);
    });

    it('denies player editing any board', () => {
      expect(canEditBoard(playerUser, publicBoard)).toBe(false);
      expect(canEditBoard(playerUser, draftBoard)).toBe(false);
      expect(canEditBoard(playerUser, otherUserBoard)).toBe(false);
    });
  });

  describe('canDeleteBoard', () => {
    it('allows only admins to delete', () => {
      expect(canDeleteBoard(adminUser, publicBoard)).toBe(true);
      expect(canDeleteBoard(adminUser, draftBoard)).toBe(true);

      expect(canDeleteBoard(creatorUser, publicBoard)).toBe(false);
      expect(canDeleteBoard(creatorUser, draftBoard)).toBe(false);

      expect(canDeleteBoard(playerUser, publicBoard)).toBe(false);
      expect(canDeleteBoard(playerUser, draftBoard)).toBe(false);

      expect(canDeleteBoard(null, publicBoard)).toBe(false);
    });
  });

  describe('canCreateBoard', () => {
    it('allows admins and creators', () => {
      expect(canCreateBoard(adminUser)).toBe(true);
      expect(canCreateBoard(creatorUser)).toBe(true);
    });

    it('denies players and unauthenticated users', () => {
      expect(canCreateBoard(playerUser)).toBe(false);
      expect(canCreateBoard(null)).toBe(false);
    });
  });

  describe('canManageUsers', () => {
    it('allows only admins', () => {
      expect(canManageUsers(adminUser)).toBe(true);
      expect(canManageUsers(creatorUser)).toBe(false);
      expect(canManageUsers(playerUser)).toBe(false);
      expect(canManageUsers(null)).toBe(false);
    });
  });

  describe('canPublishBoard', () => {
    it('allows users who can edit the board', () => {
      expect(canPublishBoard(adminUser, draftBoard)).toBe(true);
      expect(canPublishBoard(creatorUser, draftBoard)).toBe(true);
      expect(canPublishBoard(creatorUser, otherUserBoard)).toBe(false);
      expect(canPublishBoard(playerUser, draftBoard)).toBe(false);
    });
  });
});
```

### Example: Testing Game State Store

```typescript
// src/lib/stores/gameState.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gameState } from './gameState';
import { get } from 'svelte/store';

describe('Game state management', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock: Storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Clear the store
    gameState.reset(1);
  });

  it('initializes with empty state', () => {
    gameState.init(1);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'game-state-1',
      expect.stringContaining('"revealedTiles":[]')
    );
  });

  it('creates new state if none exists', () => {
    (localStorage.getItem as any).mockReturnValue(null);

    gameState.init(1);

    const state = gameState.getState();
    expect(state).toEqual({
      boardId: 1,
      revealedTiles: [],
      currentQuestion: null,
      startedAt: expect.any(Number)
    });
  });

  it('loads existing state from localStorage', () => {
    const existingState = {
      boardId: 1,
      revealedTiles: [1, 2, 3],
      currentQuestion: 3,
      startedAt: Date.now() - 10000
    };

    (localStorage.getItem as any).mockReturnValue(JSON.stringify(existingState));

    gameState.init(1);

    const state = gameState.getState();
    expect(state).toEqual(existingState);
  });

  it('persists revealed tiles', () => {
    gameState.init(1);
    gameState.revealTile(5);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'game-state-1',
      expect.stringContaining('"revealedTiles":[5]')
    );
  });

  it('does not add duplicate tiles', () => {
    gameState.init(1);
    gameState.revealTile(5);
    gameState.revealTile(5);

    const state = gameState.getState();
    expect(state?.revealedTiles).toEqual([5]);
  });

  it('sets current question', () => {
    gameState.init(1);
    gameState.setCurrentQuestion(10);

    const state = gameState.getState();
    expect(state?.currentQuestion).toBe(10);
  });

  it('clears current question', () => {
    gameState.init(1);
    gameState.setCurrentQuestion(10);
    gameState.setCurrentQuestion(null);

    const state = gameState.getState();
    expect(state?.currentQuestion).toBeNull();
  });

  it('marks game as completed', () => {
    gameState.init(1);
    gameState.complete();

    const state = gameState.getState();
    expect(state?.completedAt).toBeDefined();
    expect(state?.currentQuestion).toBeNull();
  });

  it('clears state on reset', () => {
    gameState.init(1);
    gameState.revealTile(5);
    gameState.reset(1);

    expect(localStorage.removeItem).toHaveBeenCalledWith('game-state-1');

    const state = gameState.getState();
    expect(state).toBeNull();
  });

  it('clears all game states', () => {
    (localStorage.getItem as any).mockImplementation((key: string) => {
      if (key === 'game-state-1') return '{"boardId":1}';
      if (key === 'game-state-2') return '{"boardId":2}';
      return null;
    });

    Object.keys = vi.fn().mockReturnValue(['game-state-1', 'game-state-2', 'other-key']);

    gameState.clearAll();

    expect(localStorage.removeItem).toHaveBeenCalledWith('game-state-1');
    expect(localStorage.removeItem).toHaveBeenCalledWith('game-state-2');
    expect(localStorage.removeItem).not.toHaveBeenCalledWith('other-key');
  });

  it('handles corrupted localStorage data', () => {
    (localStorage.getItem as any).mockReturnValue('invalid json{');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    gameState.init(1);

    expect(consoleSpy).toHaveBeenCalledWith('Failed to parse saved game state:', expect.any(Error));

    const state = gameState.getState();
    expect(state?.revealedTiles).toEqual([]);

    consoleSpy.mockRestore();
  });
});
```

## E2E Testing with Playwright

### Configuration

Tests are configured in `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run build && npm run preview',
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
  testDir: 'e2e',
  use: {
    baseURL: 'http://localhost:4173'
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' }
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' }
    }
  ]
});
```

### Test File Structure

```text
e2e/
├── game-board.test.ts        # Game board display and interaction
├── sound-effects.test.ts     # Sound effect integration
├── auth.test.ts              # Authentication flows
└── admin.test.ts             # Admin dashboard
```

### Example: Game Board Tests

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

  test('displays category names', async ({ page }) => {
    await page.goto('/game/1');

    const firstCategory = page.locator('.category-header').first();
    await expect(firstCategory).toBeVisible();
    await expect(firstCategory).not.toBeEmpty();
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

    // Should show time remaining
    await expect(timer).toContainText(/\d+s/);

    // Wait and verify countdown
    await page.waitForTimeout(2000);
    // Timer value should have changed
  });

  test('reveals answer after timeout', async ({ page }) => {
    await page.goto('/game/1');

    await page.locator('.question-tile').first().click();

    // Wait for timeout (adjust based on actual timer settings)
    await page.waitForTimeout(32000);

    // Answer should be revealed
    const answer = page.locator('.answer-text');
    await expect(answer).toBeVisible();
  });

  test('marks tile as answered', async ({ page }) => {
    await page.goto('/game/1');

    const tile = page.locator('.question-tile').first();
    await tile.click();

    // Wait for answer reveal
    await page.waitForTimeout(32000);

    // Tile should be marked as answered
    await expect(tile).toHaveClass(/answered/);
  });

  test('prevents clicking already answered tiles', async ({ page }) => {
    await page.goto('/game/1');

    const tile = page.locator('.question-tile').first();
    await tile.click();
    await page.waitForTimeout(32000);

    // Try clicking again
    await tile.click();

    // Should not show question again
    // (Implementation specific - check your actual behavior)
  });
});

test.describe('Game State Persistence', () => {
  test('persists progress in localStorage', async ({ page }) => {
    await page.goto('/game/1');

    // Click a tile
    await page.locator('.question-tile').first().click();
    await page.waitForTimeout(32000);

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
    await page.waitForTimeout(32000);

    // Click reset
    await page.locator('button:has-text("Reset")').click();

    // Confirm dialog if present
    page.on('dialog', (dialog) => dialog.accept());

    // Wait for reset
    await page.waitForTimeout(500);

    // All tiles should be reset
    const answeredTiles = page.locator('.question-tile.answered');
    await expect(answeredTiles).toHaveCount(0);
  });
});

test.describe('Keyboard Navigation', () => {
  test('can navigate tiles with arrow keys', async ({ page }) => {
    await page.goto('/game/1');

    // Focus first tile
    await page.keyboard.press('Tab');

    // Navigate with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');

    // Press Enter to select
    await page.keyboard.press('Enter');

    // Question should be visible
    const question = page.locator('.question-text');
    await expect(question).toBeVisible();
  });
});
```

## Testing Best Practices

### 1. Test Organization

- Group related tests with `describe` blocks
- Use clear, descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

### 2. Mocking

- Mock external dependencies (APIs, localStorage, audio)
- Use `vi.fn()` for function mocks
- Reset mocks between tests with `beforeEach`

### 3. Assertions

- Use specific assertions (`toBe`, `toEqual`, `toContain`)
- Test both positive and negative cases
- Check edge cases (null, undefined, empty arrays)

### 4. Coverage Goals

- **Unit tests**: Utilities, stores, business logic (>80% coverage)
- **E2E tests**: Critical user flows (authentication, game play)
- **Integration tests**: Component interactions

### 5. Performance

- Use `beforeEach` for setup, `afterEach` for cleanup
- Avoid unnecessary waits in E2E tests
- Use `waitFor` instead of fixed timeouts when possible

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test:unit

# Watch mode
pnpm test:unit -- --watch

# Coverage report
pnpm test:unit -- --coverage

# Run specific test file
pnpm test:unit src/lib/utils/sounds.test.ts

# Run tests matching pattern
pnpm test:unit -- --grep "sound"
```

### E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Interactive UI mode
pnpm test:e2e --ui

# Debug mode
pnpm test:e2e --debug

# Specific browser
pnpm test:e2e --project=chromium

# Headed mode (see browser)
pnpm test:e2e --headed

# Run specific test file
pnpm test:e2e e2e/game-board.test.ts
```

### All Tests

```bash
# Run both unit and E2E tests
pnpm test
```

### Continuous Integration

Tests run automatically on:

- Pull requests (unit tests + E2E tests)
- Pushes to `main` and `next` branches
- Before deployments

See `.github/workflows/` for CI configuration.
