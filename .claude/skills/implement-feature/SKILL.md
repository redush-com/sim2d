---
name: implement-feature
description: Execute a scoped feature with TDD and full verification
---

# Implement Feature

Implement the following feature: $ARGUMENTS

## Process

### 1. System-Analyst Review

Read CLAUDE.md. Then review the area being changed:

- Read relevant source files and types
- Identify reuse opportunities (existing helpers, patterns)
- Map the impact surface (files to create/modify)
- If anything is unclear, ask before proceeding

### 2. Create Feature Branch

```bash
git checkout -b feat/<descriptive-name> main
```

### 3. Write Failing Tests (TDD)

- Create `*.test.ts` files for new logic
- Write tests that describe expected behavior
- Run `npm test` — tests should fail (red phase)

### 4. Implement

- Write minimal code to pass all tests (green phase)
- Follow CLAUDE.md conventions (tabs, JSDoc, return types, no any)
- Respect module boundaries (dependency-cruiser enforced)
- Keep functions under 50 lines, files under 250 lines

### 5. Verify

```bash
npm run check    # typecheck + lint + format + architecture
npm test         # all unit tests pass
npm run build    # production build succeeds
```

All three must pass. Do not proceed if any fails.

### 6. Commit & PR

```bash
git add <specific-files>
git commit -m "feat(scope): description

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push origin feat/<name> -u
gh pr create --title "feat(scope): description" --body "..."
```

Include verification checklist in PR body.
