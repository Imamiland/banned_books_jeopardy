# VS Code Configuration

This directory contains VS Code workspace settings, tasks, launch configurations, and recommended extensions for the Banned Books Jeopardy project.

## 📦 Recommended Extensions

When you open this workspace, VS Code will prompt you to install recommended extensions. Click "Install All" to get:

### Core Development

- **Svelte for VS Code** - Svelte 5 syntax highlighting, IntelliSense, and formatting
- **Tailwind CSS IntelliSense** - Autocomplete, syntax highlighting for Tailwind classes
- **ESLint** - JavaScript/TypeScript linting integration
- **Prettier** - Code formatting

### Database & ORM

- **Drizzle ORM** - Schema visualization and IntelliSense for Drizzle

### Testing

- **Playwright Test for VS Code** - Run and debug E2E tests
- **Vitest** - Unit test explorer

### Git & Collaboration

- **GitHub Pull Requests** - Manage PRs directly in VS Code
- **GitLens** - Enhanced Git capabilities

### Code Quality

- **Code Spell Checker** - Catch typos in code and comments
- **markdownlint** - Markdown linting
- **YAML** - YAML validation and formatting
- **Error Lens** - Inline error/warning highlighting

### Productivity

- **TODO Tree** - Track TODO, FIXME, etc. comments
- **Better Comments** - Colored comment annotations
- **TODO Highlight** - Highlight TODO comments

### Tooling

- **mise** - Environment and tool version management

## 🎯 Available Tasks

Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) and type "Tasks: Run Task" to see all available tasks.

**Note**: All tasks use `mise run` commands for consistency with CI/CD workflows. This ensures:

- ✅ Same commands work in VS Code, terminal, and GitHub Actions
- ✅ Correct tool versions from `.mise.toml` are used
- ✅ Environment variables from `.env` are automatically loaded

### Development

- **Dev Server** - Start development server (`mise run dev`) - default build task
- **Build** - Build for production (`mise run build`)
- **Preview** - Preview production build (`mise run preview`)
- **Type Check** - Run svelte-check once (`mise run check`)
- **Type Check (Watch)** - Run svelte-check in watch mode (`mise run watch`)

### Code Quality

- **Format** - Format all files with Prettier (`mise run format`)
- **Lint** - Run ESLint + Prettier check (`mise run lint`)
- **Pre-commit (All Files)** - Run all pre-commit hooks (`mise run precommit`)
- **Browserslist: Lint** - Validate browserslist configuration

### Testing

- **Unit Tests** - Run Vitest tests once (`mise run test:unit`)
- **Unit Tests (Watch)** - Run Vitest in watch mode (`mise run test:unit:watch`)
- **E2E Tests** - Run Playwright tests (`mise run test:e2e`)
- **E2E Tests (UI)** - Run Playwright with UI (`mise run test:e2e:ui`)
- **E2E Tests (Debug)** - Run Playwright in debug mode (`mise run test:e2e:debug`)
- **All Tests** - Run unit + E2E tests (`mise run test`) - default test task

### Database

- **DB: Push Schema** - Push schema changes to database (`mise run db:push`)
- **DB: Generate Migration** - Generate migration files (`mise run db:migrate`)
- **DB: Studio** - Open Drizzle Studio GUI (`mise run db:studio`)

### Utilities

- **Clean** - Remove build artifacts (`mise run clean`)
- **Install Dependencies** - Install npm packages (`mise run _install`)
- **Setup Pre-commit Hooks** - Install pre-commit hooks (`mise run _precommit-install`)

**Alternative**: You can also run these commands directly in the terminal:

```bash
mise run dev              # Start dev server
mise run test             # Run all tests
mise tasks                # List all available mise tasks
```

## 🐛 Debug Configurations

Press `F5` to start debugging with these configurations:

### Node Debugging

- **Debug SvelteKit Dev Server** - Debug server-side code in dev mode (uses `pnpm dev`)
- **Debug SvelteKit Preview** - Debug server-side code in production build (uses `pnpm preview`)

### Browser Debugging

- **Debug Chrome (Dev Server)** - Debug client-side code in Chrome
- **Full Stack Debug** (compound) - Debug both server and client simultaneously

### Test Debugging

- **Debug Current Test File** - Debug the currently open test file (Vitest)
- **Debug All Unit Tests** - Debug all Vitest tests
- **Debug Playwright Tests** - Debug all E2E tests
- **Debug Current Playwright Test File** - Debug currently open E2E test

**Note**: All debug configurations use `pnpm` as the runtime executable to properly handle package manager scripts and avoid shell script execution issues.

## ⚙️ Workspace Settings

The workspace settings configure:

### Editor Behavior

- Format on save enabled (Prettier)
- Auto-fix ESLint errors on save
- Auto-organize imports on save
- Rulers at 100 and 120 characters
- 4-space indentation (project standard)
- Trim trailing space
- Insert final newline
- Unix line endings (LF)

### Language-Specific

- **Svelte** - Formatted by Svelte extension, accessibility warnings enabled
- **TypeScript/JavaScript** - Formatted by Prettier, non-relative imports preferred
- **JSON/YAML** - Formatted by Prettier, 4-space indent for YAML
- **Markdown** - Word wrap enabled, Prettier formatting

### Tooling Integration

- ESLint using flat config (ESLint 9+)
- Tailwind CSS with Svelte support
- TypeScript workspace version
- Drizzle config file path
- mise environment variables

### File Exclusions

Build artifacts and dependencies hidden from:

- File explorer (`.svelte-kit`, `node_modules`, `dist`, `build`)
- Search results (same as above + `.vercel`, `coverage`, lock files)

## 🚀 Quick Start

1. **Install recommended extensions**:

   ```bash
   Cmd+Shift+P → Extensions: Show Recommended Extensions → Install All
   ```

2. **Start dev server**:

   ```bash
   Cmd+Shift+B (or Ctrl+Shift+B on Windows/Linux)
   ```

   This runs the default build task (Dev Server).

3. **Run tests**:

   ```bash
   Cmd+Shift+P → Tasks: Run Test Task
   ```

   This runs the default test task (All Tests).

4. **Debug in browser**:
   - Press `F5`
   - Select "Full Stack Debug" to debug both server and client

## 💡 Tips

- **Quick Task Access**: `Cmd+Shift+P` → "Tasks: Run Task"
- **Background Tasks**: Dev server, test watchers, and DB studio run in background
- **Problem Matcher**: Build and lint tasks automatically parse errors into Problems panel
- **Terminal Reuse**: Most tasks share a terminal panel; background tasks get dedicated terminals
- **Format on Save**: Files auto-format when you save (Prettier + ESLint)
- **Spell Checking**: Code Spell Checker runs automatically; right-click underlined words to add to dictionary

## 🔧 Customization

### User vs Workspace Settings

- **Workspace settings** (`.vscode/settings.json`) - Project-specific, committed to repo
- **User settings** - Global to all projects, stored in `~/Library/Application Support/Code/User/settings.json`

To override workspace settings locally:

1. Open settings: `Cmd+,`
2. Switch to "Workspace" tab
3. Edit settings (these override workspace defaults)

### Adding Custom Tasks

Edit `.vscode/tasks.json` to add project-specific tasks. See [VS Code Tasks documentation](https://code.visualstudio.com/docs/editor/tasks).

### Custom Keybindings

Set keybindings for frequently-used tasks:

1. `Cmd+Shift+P` → "Preferences: Open Keyboard Shortcuts"
2. Search for "Tasks: Run Task"
3. Assign keybinding

Example: Bind `Cmd+Shift+T` to "Run Test Task".

## 📚 Resources

- [VS Code Tasks](https://code.visualstudio.com/docs/editor/tasks)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [Project Contributing Guide](../CONTRIBUTING.md)
