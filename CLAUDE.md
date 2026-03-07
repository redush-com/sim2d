## Workflow

### Context First — System-Analyst Review

Before writing any code, perform a **system-analyst review** of the area being changed. This is mandatory when starting a new feature, refactor, or bug fix — especially when prior conversational context is missing or insufficient.

The review must cover, in order:

1. **Data required** — Which database tables, RPCs, API endpoints, or external data sources does this feature need? Read their schemas/types.
2. **Existing connections** — Which hooks, services, utilities, and components already fetch or transform this data? Trace the data flow end-to-end (DB → service → UI).
3. **Reuse opportunities** — Identify existing types, helpers, UI components, and patterns that can be reused instead of duplicated (respect DRY).
4. **Impact surface** — List every file and module that the change will touch or that depends on the code being changed.
5. **Gaps & questions** — If anything is ambiguous, incomplete, or unclear after this review — **stop and ask clarifying questions** before writing any code.

Never assume the current structure or conventions from memory alone; always read the actual code first.

### Test-Driven Development (TDD)

- **Red-Green-Refactor cycle**: Write a failing test first, write minimal code to pass it, then refactor.
- New logic (utilities, math, simulation algorithms, data transformations) **must** have tests before implementation.
- UI/DOM code is exempt from unit tests but should be manually verified.
- Test files live next to their source: `foo.ts` → `foo.test.ts`.
- Use `vitest` as the test runner. Tests run with `npm test` (single run) or `npm run test:watch` (watch mode).
- Aim for tests that verify **behavior**, not implementation details. Test public APIs, not private internals.
- Each test should be independent — no shared mutable state between tests.
- Use descriptive test names: `it('returns empty array when no agents are in range')`.

## Code Style

### Formatting

- **Indentation**: Tabs (not spaces). **Line endings**: LF. **Encoding**: UTF-8.
- **Max line width**: 100 characters. **Quotes**: Single. **Semicolons**: Always. **Trailing commas**: Always.
- Formatting is enforced by **Prettier** (`.prettierrc`). Run `npm run format` to auto-fix.

### Linting

- **ESLint** with `typescript-eslint` strict + stylistic configs.
- **No `any`**: Use `unknown` + type guards. **Consistent type imports**: `import type { X }`.
- **Explicit return types** on exported functions. **No `var`**. **Strict equality** (`===`/`!==`).
- Run `npm run lint` to check, `npm run lint:fix` to auto-fix.

### Documentation

- Every new function/method must have a JSDoc comment with `@param` and `@returns`.

### Types

- **Supabase**: Use inferred types from `.select()`, never `as unknown as X`.
- **No `any`**: Use `unknown` + type guards or generics.
- **Prefer interfaces** for object shapes, `type` for unions/intersections/mapped types.

## Architecture

### Project Structure

```
src/
  auth/           # Supabase auth (client, service, store)
  db/             # Database CRUD (profiles, saved-simulations, shared-links)
  editor/         # CodeMirror 6 editor setup + templates
  math/           # Pure math utilities (vector ops)
  rendering/      # Canvas rendering utilities
  simulations/    # All simulation modules (registry pattern)
    <name>/       # Each sim: types, config, simulation, renderers/, index
    custom/       # User code sandbox + draw proxy
  ui/             # DOM-based UI components (menu, panels, modals)
```

### Module Boundaries (enforced by `dependency-cruiser`)

- **Simulations are self-contained**: No cross-simulation imports (except `pso/fitness.ts` whitelist).
- **Auth module**: Only `auth-store.ts` and `auth-service.ts` are imported by UI. Never import `supabase-client` from UI.
- **DB module**: Provides async CRUD. UI calls these, never constructs Supabase queries directly.
- **Navigation**: Use `navigateTo()` from `src/navigation.ts` (not from router directly).

### Adding a New Simulation

1. Create `src/simulations/<name>/` with `types.ts`, `config.ts`, `simulation.ts`, `renderers/`, `index.ts`
2. In `index.ts`: `register({ id, title, description, tags, create })`
3. In `src/main.ts`: add `import './simulations/<name>/index';`
4. Write tests for simulation logic in `simulation.test.ts`
5. Run `npm run check` and `npm test`

### Adding Any Feature

1. System-analyst review (read existing code first)
2. Create feature branch: `feat/<name>`
3. Write failing tests (TDD)
4. Implement minimal code to pass tests
5. Run `npm run check` + `npm test` + `npm run build`
6. Commit with conventional format, push, create PR

## Design Principles

### DRY — If logic appears >2 times, extract to a shared helper.

### SOLID

- **Single Responsibility**: One reason to change per module/function.
- **Open/Closed**: Extend via new simulations/renderers, don't modify existing.
- **Liskov Substitution**: Subtypes fully interchangeable with base types.
- **Interface Segregation**: Small, focused interfaces.
- **Dependency Inversion**: Depend on abstractions (types, interfaces).

## Size & Complexity Limits

- **Function**: max **50 lines** of logic.
- **File**: max **250 lines**.
- **SQL function**: max **80 lines**.
- **Folder**: max **15 files** (split into sub-folders).
- **Cyclomatic complexity**: max **10** per function (use early returns, guard clauses).

## Quality Gates (Pre-commit)

Husky + lint-staged runs on every commit: **Prettier** → **ESLint** → staged files only.

Manual full check: `npm run check` (typecheck + lint + format + architecture).

### CI/CD (GitHub Actions on every PR)

- `quality`: typecheck + eslint + prettier + dependency-cruiser
- `test`: vitest (145+ unit tests)
- `build`: production build
- `e2e`: Playwright chromium tests

## Agentic Workflows

### Task Scoping

- Tasks must reference **exact files** and **expected behavior**: not "fix auth" but "fix login redirect in `src/auth/auth-service.ts` — after OAuth, user should land on `/` instead of staying on `/login`".
- Every task must include a **verification step**: tests pass, build succeeds, behavior confirmed.
- If a task takes >40k tokens, it's too broad — break it down.

### Commit Format

```
type(scope): brief description

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `perf`. Scope: module or feature name.

### PR Workflow

1. Create feature branch from `main`
2. Implement with TDD (tests first)
3. Verify: `npm run check && npm test && npm run build`
4. Push branch, create PR with verification checklist
5. CI must pass before merge

### Context Management

- Use subagents for investigation to keep main context clean.
- Use `/compact` between unrelated tasks.
- CLAUDE.md = universal rules. `.claude/rules/` = path-specific rules. Auto memory = learned patterns.
