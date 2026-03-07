# Modular Architecture - Main Menu & Simulation Registry

## Context

The app is currently a single hardcoded APF simulation. We need a main menu screen for selecting simulations and a plugin-like architecture where each simulation is isolated and adding new ones doesn't break existing ones.

## Problem

- `index.html` contains APF-specific markup (sliders, buttons)
- `main.ts` directly creates APF simulation, renderer, controls
- Adding a second simulation = rewrite everything

## Solution: Simulation Registry + Router

### Simulation Interface

Every simulation implements a single contract:

```typescript
// src/simulations/types.ts
interface SimulationDefinition {
  id: string;                    // 'apf-swarm'
  title: string;                 // 'Artificial Potential Fields'
  description: string;           // short description for the card
  tags: string[];                // ['swarm', 'path-planning', 'potential-fields']
  create: (canvas: HTMLCanvasElement, panel: HTMLElement) => SimulationInstance;
}

interface SimulationInstance {
  start: () => void;             // start animation
  stop: () => void;              // stop (when navigating to menu)
  destroy: () => void;           // clean up resources, listeners
}
```

### Simulation Registry

```typescript
// src/simulations/registry.ts
const SIMULATIONS: SimulationDefinition[] = [];

function register(def: SimulationDefinition): void { ... }
function getAll(): SimulationDefinition[] { ... }
function getById(id: string): SimulationDefinition | undefined { ... }
```

Each simulation registers itself on import:
```typescript
// src/simulations/apf-swarm/index.ts
register({ id: 'apf-swarm', title: '...', create: ... });
```

### File Structure

```
src/
  app.ts                              # Router: main menu <-> simulation
  simulations/
    types.ts                          # SimulationDefinition, SimulationInstance
    registry.ts                       # register(), getAll(), getById()
    apf-swarm/                        # Current APF simulation (relocated)
      index.ts                        # register + create function
      simulation.ts                   # former simulation-engine.ts
      agent.ts                        # unchanged
      obstacle.ts                     # unchanged
      local-minima.ts                 # unchanged
      forces.ts                       # former math/forces.ts
      config.ts                       # APF-specific parameters
      panel.ts                        # creates APF sliders dynamically
      renderers/
        renderer.ts                   # compose sub-renderers
        agent-renderer.ts
        obstacle-renderer.ts
        goal-renderer.ts
  math/
    vector.ts                         # shared, used by all simulations
  rendering/
    canvas-manager.ts                 # canvas creation/resize, DPI handling
  ui/
    main-menu.ts                      # render main screen (cards grid)
    interaction.ts                    # drag logic (shared)
  loop.ts                             # shared animation loop
  types.ts                            # shared types (Vec2)
  main.ts                             # entry point: register sims + start app
index.html                            # minimal: just a container div
```

### Main Menu Screen (main-menu.ts)

Dark page with simulation cards in a grid:

```
+---------------------------------------------+
|  Swarm Intelligence Simulations             |
|                                             |
|  +--------------+  +--------------+         |
|  |  o o    o    |  |              |         |
|  |    o  *  o   |  |    Coming    |         |
|  |  o    o   o  |  |     Soon     |         |
|  |              |  |              |         |
|  | APF Swarm    |  | Predictive   |         |
|  | Path Planning|  | Coding       |         |
|  |              |  |              |         |
|  | #swarm #apf  |  | #prediction  |         |
|  +--------------+  +--------------+         |
+---------------------------------------------+
```

- Cards generated from `registry.getAll()`
- Click on card -> `app.navigate(simId)`
- Dark theme consistent with simulations

### Router (app.ts)

```typescript
// src/app.ts
class App {
  private currentSim: SimulationInstance | null = null;

  showMenu(): void {
    // stop current simulation
    // show main menu screen
  }

  navigate(simId: string): void {
    // hide menu
    // create canvas + panel
    // sim = definition.create(canvas, panel)
    // sim.start()
  }
}
```

### index.html (minimal)

```html
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
```

All markup is generated dynamically.

### APF Simulation Migration

Current code moves to `src/simulations/apf-swarm/`:
- `simulation-engine.ts` -> `simulation.ts`
- `math/forces.ts` -> `forces.ts` (APF-specific force formulas)
- `math/vector.ts` stays shared at `src/math/`
- Renderers -> `renderers/`
- Sliders from `index.html` -> `panel.ts` (created programmatically)
- `config.ts` -> local to APF

"Back" button in every simulation -> returns to main menu.

## Implementation Order

1. Create `src/simulations/types.ts` and `registry.ts`
2. Create `src/ui/main-menu.ts` -- card grid rendering
3. Create `src/app.ts` -- router (menu <-> simulation)
4. Create `src/rendering/canvas-manager.ts` -- shared canvas setup
5. Move APF code to `src/simulations/apf-swarm/`
6. Create `src/simulations/apf-swarm/panel.ts` -- dynamic sliders
7. Create `src/simulations/apf-swarm/index.ts` -- register + create
8. Update `index.html` -- minimal container
9. Update `src/main.ts` -- import registry + start app

## What Does NOT Change

- `src/math/vector.ts` -- shared utility
- `src/loop.ts` -- shared animation loop
- APF logic (forces, agent, obstacle, local-minima) -- only relocated

## Verification

- [ ] `npm run dev` -> main menu opens with APF card
- [ ] Click APF card -> simulation runs (all sliders, drag, pause/reset work)
- [ ] "Back" button -> returns to main menu
- [ ] Re-enter simulation -> clean fresh start
- [ ] Adding a new simulation = create folder + register, nothing else changes
