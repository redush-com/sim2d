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

## Code Style

### Documentation
- **TypeScript/JavaScript:** Every new function/method must have a JSDoc comment describing why it exists, its `@param` entries, and `@returns`.
- **Python:** Every new function/method must have a docstring describing why it exists, its parameters, and return value.

### Types
- **Supabase query results:** `@supabase/supabase-js` v2 automatically infers return types from `.select()` strings based on the `Database` type. Do **not** cast query results with `as unknown as X` or `as Record<string, unknown>` — this breaks the type link between the schema and the code. Instead, use the Supabase-inferred types directly. If the inferred type is insufficient, narrow it with a type guard or a single safe `as` cast to a `Pick`/`Omit`-derived type.
- **Frontend-Dashboard:** When defining TypeScript types/interfaces that represent database table rows, always derive them from the Supabase-generated types (`Database["public"]["Tables"]["<table>"]["Row"]`) using `Pick`, `Omit`, or `extends` instead of manually redeclaring fields. This keeps types in sync with the schema automatically. The generated types live at `src/integrations/supabase/types.ts`.


## Design Principles

### DRY (Don't Repeat Yourself)
- If a piece of logic, markup, or configuration appears **more than 2 times**, extract it into a shared helper, component, hook, utility function, or constant.
- Before writing new code, search the codebase for existing abstractions that already solve the same problem.

### SOLID
- **Single Responsibility:** Each module, class, function, or component must have exactly one reason to change. If a description requires "and", split it.
- **Open/Closed:** Design modules so new behavior can be added via extension (new components, strategy objects, config entries) rather than modifying existing code.
- **Liskov Substitution:** Subtypes and interface implementations must be fully interchangeable with their base types without breaking callers.
- **Interface Segregation:** Keep interfaces and prop types small and focused. No consumer should depend on methods or props it does not use.
- **Dependency Inversion:** High-level modules must not import low-level modules directly. Depend on abstractions (types, interfaces, injection tokens) instead.

## Size & Complexity Limits

### Function / Method Length
- A single function or method must not exceed **50 lines** of logic (excluding blank lines and comments). If it does, refactor into smaller, well-named helper functions.

### React Component Length
- A single React component file must not exceed **200 lines** (including imports, types, and JSX). If it grows beyond this, extract sub-components, hooks, or utility functions into separate files.

### Python Function / Method Length
- A single Python function or method must not exceed **50 lines** of logic. Break larger functions into well-named private helpers.

### SQL Function Length
- A single SQL function / RPC must not exceed **80 lines** of body logic. Extract reusable CTEs or split into helper functions when approaching this limit.

### Files Per Folder
- A single folder must not contain more than **15 files**. When a folder exceeds this limit, group related files into sub-folders with clear, descriptive names.
