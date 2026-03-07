---
paths:
  - '**/*.test.ts'
---

# Testing Rules

## Framework

- **Vitest** with `globals: true` (describe, it, expect, vi available without import).
- Test files live next to source: `foo.ts` → `foo.test.ts`.

## Structure

- One `describe` block per function or class being tested.
- Descriptive `it` names: `it('returns zero vector when no neighbors in range')`.
- Group related tests with nested `describe` blocks.

## Practices

- **Independence**: Each test must be independent. No shared mutable state between tests.
- **Behavior over implementation**: Test what functions do, not how they do it internally.
- **Floating point**: Use `toBeCloseTo(expected, precision)` for float comparisons.
- **Edge cases**: Always test: empty inputs, boundary values, zero/null cases.
- **No network calls**: Mock Supabase and external APIs. Test pure logic directly.
- **Fresh state**: If testing singletons (auth store, registry), create fresh instances per test or use beforeEach cleanup.

## ESLint Relaxations (auto-applied)

- `explicit-function-return-type`: off (test callbacks don't need return types)
- `no-empty-function`: off (stubs/mocks may be empty)
