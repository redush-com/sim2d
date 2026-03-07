## Workflow

### Context First — System-Analyst Review

Before writing any code, perform a **system-analyst review** of the area being changed. This is mandatory when starting a new feature, refactor, or bug fix — especially when prior conversational context is missing or insufficient.

The review must cover, in order:

1. **Data required** — Which database tables, RPCs, API endpoints, or external data sources does this feature need? Read their schemas/types.
2. **Existing connections** — Which hooks, services, utilities, and components already fetch or transform this data? Trace the data flow end-to-end (DB → hook → component).
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

- **Indentation**: Tabs (not spaces).
- **Line endings**: LF (`\n`), never CRLF.
- **Encoding**: UTF-8, no BOM.
- **Max line width**: 100 characters.
- **Quotes**: Single quotes for strings.
- **Semicolons**: Always.
- **Trailing commas**: Always (ES5+).
- **Final newline**: Every file ends with a newline.
- Formatting is enforced by **Prettier** (`.prettierrc`). Run `npm run format` to auto-fix.

### Linting

- **ESLint** with `typescript-eslint` strict + stylistic configs.
- **No `any`**: Use `unknown` and narrow with type guards.
- **Explicit return types**: All exported functions must declare return types. Internal helpers may rely on inference.
- **Consistent type imports**: Use `import type { X }` for type-only imports.
- **No `var`**: Use `const` by default, `let` only when reassignment is needed.
- **Strict equality**: Always `===` / `!==`, never `==` / `!=`.
- Run `npm run lint` to check, `npm run lint:fix` to auto-fix.

### Documentation

- **TypeScript/JavaScript:** Every new function/method must have a JSDoc comment describing why it exists, its `@param` entries, and `@returns`.

### Types

- **Supabase query results:** `@supabase/supabase-js` v2 automatically infers return types from `.select()` strings based on the `Database` type. Do **not** cast query results with `as unknown as X` or `as Record<string, unknown>` — this breaks the type link between the schema and the code. Instead, use the Supabase-inferred types directly. If the inferred type is insufficient, narrow it with a type guard or a single safe `as` cast to a `Pick`/`Omit`-derived type.
- **No `any`**: Use `unknown` + type guards, or generic type parameters.
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

### Module Boundaries

- **Simulations are self-contained**: Each simulation folder registers itself via side-effect import. No cross-simulation imports except shared utilities (fitness functions reuse is OK).
- **Auth module**: Only `auth-store.ts` is imported by UI code. Never import `supabase-client` directly from UI — go through service/store layers.
- **DB module**: Provides async CRUD functions. UI calls these, never constructs Supabase queries directly.
- **Rendering**: Shared utilities (`clearCanvas`, `drawGrid`, etc.) live in `rendering/shared.ts`. Simulation-specific renderers live in their own `renderers/` folder.

### Adding a New Simulation

1. Create folder `src/simulations/<name>/`
2. Create `types.ts`, `config.ts`, `simulation.ts`, `renderers/`, `index.ts`
3. In `index.ts`: import `register` from `../registry`, call `register({ id, title, description, tags, create })`
4. In `src/main.ts`: add `import './simulations/<name>/index';`
5. The simulation card appears automatically on the main menu.

## Design Principles

### DRY (Don't Repeat Yourself)

- If a piece of logic, markup, or configuration appears **more than 2 times**, extract it into a shared helper, utility function, or constant.
- Before writing new code, search the codebase for existing abstractions that already solve the same problem.

### SOLID

- **Single Responsibility:** Each module, class, function, or component must have exactly one reason to change. If a description requires "and", split it.
- **Open/Closed:** Design modules so new behavior can be added via extension (new simulations, new renderers) rather than modifying existing code.
- **Liskov Substitution:** Subtypes and interface implementations must be fully interchangeable with their base types without breaking callers.
- **Interface Segregation:** Keep interfaces and prop types small and focused. No consumer should depend on methods or props it does not use.
- **Dependency Inversion:** High-level modules must not import low-level modules directly. Depend on abstractions (types, interfaces) instead.

## Size & Complexity Limits

### Function / Method Length

- A single function or method must not exceed **50 lines** of logic (excluding blank lines and comments). If it does, refactor into smaller, well-named helper functions.

### File Length

- A single TypeScript file should not exceed **250 lines**. If it grows beyond this, extract into multiple files with clear responsibilities.

### SQL Function Length

- A single SQL function / RPC must not exceed **80 lines** of body logic. Extract reusable CTEs or split into helper functions when approaching this limit.

### Files Per Folder

- A single folder must not contain more than **15 files**. When a folder exceeds this limit, group related files into sub-folders with clear, descriptive names.

### Cyclomatic Complexity

- A single function should not exceed **10** cyclomatic complexity (branches). Flatten deeply nested conditionals with early returns, guard clauses, or strategy patterns.

## Quality Gates (Pre-commit)

All checks run automatically via **Husky** + **lint-staged** on every commit:

1. **Prettier** — formats staged `.ts`, `.js`, `.json`, `.md`, `.yml`, `.css`, `.html` files
2. **ESLint** — lints and auto-fixes staged `.ts`, `.js` files
3. **TypeScript** — `tsc --noEmit` (type-check only, no output)

Manual full check: `npm run check` (runs typecheck + lint + format check).

### CI/CD Expectations

- Every PR must pass `npm run check` before merge.
- Tests must pass: `npm test`.
- Build must succeed: `npm run build`.
