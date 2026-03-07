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
