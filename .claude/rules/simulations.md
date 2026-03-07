---
paths:
  - 'src/simulations/**/*'
---

# Simulation Module Rules

## Structure

Every simulation lives in `src/simulations/<name>/` with these files:

- `types.ts` — simulation-specific types and state interfaces
- `config.ts` — default parameter values and panel slider definitions
- `simulation.ts` — pure tick function (no DOM, no canvas, no side effects)
- `index.ts` — factory function + `register()` call (self-registering side-effect import)
- `renderers/` — canvas rendering functions (renderer.ts + specialized renderers)

## Rules

- **Self-contained**: No imports from other simulation folders (enforced by dependency-cruiser). Exception: `pso/fitness.ts` may be imported by firefly.
- **Pure simulation logic**: `simulation.ts` must export a pure `tick(state, dt)` function. No DOM access, no canvas calls, no global state.
- **Config defaults**: `config.ts` must export default parameter values. All parameters must have sensible defaults.
- **Panel builder**: Use `buildPanel()` from `src/ui/panel-builder.ts` for slider panels. Don't build custom panel DOM.
- **Registration**: `index.ts` must call `register()` from `../registry` with `{ id, title, description, tags, create }`.
- **Tests required**: `simulation.ts` logic must have corresponding `simulation.test.ts`.
- **Shared rendering**: Use utilities from `src/rendering/shared.ts` (`clearCanvas`, `drawGrid`, etc.) where applicable.
