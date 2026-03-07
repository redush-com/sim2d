# Swarm Intelligence Simulator -- Full Platform Plan

## Context

Expand the existing 2D swarm intelligence simulator into a full platform with:
- Multiple built-in swarm models (Boids, ACO, PSO, Firefly + existing APF)
- User authentication via OAuth (Google, GitHub) through Supabase
- Browser-based code editor for custom user simulations (sandboxed)
- Save/load simulation configurations to user profile
- Share simulations with others via link
- Deploy on Vercel (static) + Supabase (auth, DB)

**Current state:** Vanilla TypeScript + Vite, HTML5 Canvas, registry pattern, one APF simulation working. No auth, no backend, no dependencies beyond Vite+TS.

---

## Architecture Decisions

### Routing: Clean URL SPA (History API)

Replace `App` class with a `Router` using History API (`pushState`/`popstate`). Vercel rewrites configured for SPA fallback.

| Route | Screen | Auth required |
|-------|--------|---------------|
| `/` | Main menu (simulation cards) | No |
| `/sim/:id` | Built-in simulation | No |
| `/editor` | New custom simulation | Yes |
| `/editor/:id` | Edit saved simulation | Yes |
| `/shared/:token` | View shared simulation | No |
| `/login` | OAuth login screen | No |
| `/profile` | Saved simulations list | Yes |

### Auth: Supabase OAuth

`@supabase/supabase-js` v2 with Google + GitHub providers. Simple observable `authStore` pattern (value + subscriber list, no library) for reactive UI updates. Auth guard redirects to `/login` for protected routes.

### Code Editor: CodeMirror 6

Lightweight (~200KB tree-shaken), modular, Vite-compatible. Packages:
- `@codemirror/view` -- editor core
- `@codemirror/state` -- state management
- `@codemirror/lang-javascript` -- JS/TS syntax
- `@codemirror/theme-one-dark` -- dark theme matching the app

### Sandboxing: Web Worker

User code runs in a Web Worker via `new Function()`. No DOM access. Draw commands are serialized as `DrawCommand[]` and replayed on the real canvas by the main thread. 100ms timeout per tick -- worker terminated on infinite loop.

**User simulation API:**

```typescript
interface UserSimulationAPI {
  /** Called once when simulation starts. Return initial state. */
  init(params: { width: number; height: number }): unknown;
  /** Called each frame. Update state and draw to ctx. Return new state. */
  tick(state: unknown, dt: number, ctx: DrawProxy): unknown;
}
```

**Communication protocol:**

```
[Main Thread]                         [Web Worker]

postMessage({ type: 'init', code })   --> Compiles user code
                                          Creates init() and tick() functions
                                          Blocks: fetch, XMLHttpRequest, importScripts

postMessage({ type: 'tick', dt,       --> Calls user tick(state, dt, proxyCtx)
  width, height })                        Collects draw commands

<-- postMessage({ type: 'frame',          Returns serialized commands
  commands: DrawCommand[] })

Main thread replays commands
on real Canvas2D context
```

### Database: Supabase (3 tables + RLS)

```sql
-- Auto-created via trigger on auth.users insert
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE saved_simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  sim_type TEXT NOT NULL CHECK (sim_type IN ('builtin', 'custom')),
  builtin_id TEXT,              -- e.g. 'apf-swarm', 'boids'
  params JSONB DEFAULT '{}',    -- parameter values
  source_code TEXT,             -- for custom simulations only
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES saved_simulations(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ -- NULL = never expires
);

-- Indexes
CREATE INDEX idx_shared_links_token ON shared_links(share_token);
CREATE INDEX idx_saved_simulations_user ON saved_simulations(user_id);
```

**RLS policies:**
- `profiles`: Users can read any profile. Users can update only their own.
- `saved_simulations`: Users can CRUD their own. Anyone can read rows where `visibility = 'public'`.
- `shared_links`: Users can create/delete links for their own simulations. Anyone can read (for resolving).

**Auth trigger (auto-create profile on sign-up):**

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## New Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@codemirror/view": "^6.x",
    "@codemirror/state": "^6.x",
    "@codemirror/lang-javascript": "^6.x",
    "@codemirror/theme-one-dark": "^6.x",
    "@codemirror/commands": "^6.x",
    "@codemirror/autocomplete": "^6.x",
    "@codemirror/language": "^6.x"
  }
}
```

---

## Built-in Swarm Models

### 1. APF Swarm (already implemented)

Artificial Potential Fields -- agents navigate toward a goal via force fields.
- `F = F_attractive + F_obstacle_repulsion + F_inter_robot_repulsion`

### 2. Boids (Flocking) -- Reynolds, 1987

Three rules create realistic flocking behavior:
- **Separation** -- avoid collisions with nearest neighbors
- **Alignment** -- match average velocity of neighbors
- **Cohesion** -- steer toward center of mass of neighbors

**Parameters:** separationWeight, alignmentWeight, cohesionWeight, perceptionRadius, maxSpeed, maxForce, agentCount
**Visual:** Agents as directional triangles. No goal, no obstacles -- pure emergent flocking.
**Interaction:** Drag to create a "scare" object (agents scatter). Click to add agent.

### 3. Ant Colony Optimization (ACO) -- Dorigo, 1992

Ants find shortest paths between nest and food sources via pheromone trails.
- Ants explore randomly
- Finding food, they return to nest leaving pheromone trail
- Other ants prefer stronger pheromone paths
- Pheromones evaporate over time

**Parameters:** evaporationRate, pheromoneStrength, explorationBias, antCount, foodSources
**Visual:** Pheromone field as heatmap. Nest and food sources. Ants as small dots.
**Interaction:** Drag food sources. Add/remove walls (maze). Watch optimal paths emerge.

### 4. Particle Swarm Optimization (PSO) -- Kennedy & Eberhart, 1995

Particles search for function optimum, sharing information about best positions found.
- Each particle remembers its personal best (pBest)
- Swarm tracks global best (gBest)
- Velocity = inertia + pull toward pBest + pull toward gBest

**Parameters:** inertiaWeight, cognitiveWeight, socialWeight, particleCount, targetFunction
**Visual:** 2D function landscape (contour/heatmap). Particles searching for minimum. Show pBest markers and gBest.
**Interaction:** Choose function (Rastrigin, Rosenbrock, Ackley). Drag to move optimum.

### 5. Firefly Algorithm -- Yang, 2008

Fireflies attracted to brighter neighbors. Brightness depends on fitness function value.
- Less bright fireflies move toward brighter ones
- Attractiveness decreases with distance (light absorption)
- Random component for exploration

**Parameters:** attractiveness, lightAbsorption, randomness, fireflyCount, targetFunction
**Visual:** Dark background, fireflies as glowing dots (size/brightness = fitness). Attraction lines. Background = function contour.
**Interaction:** Choose function. Observe convergence.

---

## File Structure (target)

```
src/
  main.ts                             # Entry: register sims, init router + auth listener
  router.ts                           # SPA router with History API (clean URLs)
  types.ts                            # Vec2 only (APF types moved out)
  loop.ts

  auth/
    supabase-client.ts                # createClient() singleton
    auth-service.ts                   # signIn/signOut/onAuthStateChange
    auth-store.ts                     # observable { user, session }

  db/
    profiles.ts                       # profile CRUD
    saved-simulations.ts              # save/load/delete configs
    shared-links.ts                   # create/resolve share tokens

  math/
    vector.ts

  rendering/
    canvas-manager.ts
    shared.ts                         # clearCanvas, drawGrid, drawArrow, drawHeatmap

  ui/
    main-menu.ts                      # simulation cards grid
    login-screen.ts                   # OAuth buttons (Google, GitHub)
    profile-screen.ts                 # list saved simulations
    share-modal.ts                    # generate/copy share link
    panel-builder.ts                  # generic slider panel builder
    interaction.ts

  editor/
    editor-view.ts                    # CodeMirror 6 setup and mounting
    templates.ts                      # starter code templates

  simulations/
    types.ts                          # SimulationDefinition, SimulationInstance
    registry.ts

    apf-swarm/                        # APF simulation
      types.ts, index.ts, simulation.ts, config.ts, agent.ts,
      forces.ts, obstacle.ts, panel.ts, local-minima.ts
      renderers/ (renderer.ts, agent-renderer.ts, goal-renderer.ts, obstacle-renderer.ts)

    boids/                            # Boids flocking
      index.ts, types.ts, config.ts, simulation.ts, behaviors.ts
      renderers/ (renderer.ts, agent-renderer.ts)

    ant-colony/                       # Ant Colony Optimization
      index.ts, types.ts, config.ts, simulation.ts, pheromones.ts
      renderers/ (renderer.ts, pheromone-renderer.ts, ant-renderer.ts)

    pso/                              # Particle Swarm Optimization
      index.ts, types.ts, config.ts, simulation.ts, fitness.ts
      renderers/ (renderer.ts, landscape-renderer.ts, particle-renderer.ts)

    firefly/                          # Firefly Algorithm
      index.ts, types.ts, config.ts, simulation.ts
      renderers/ (renderer.ts, glow-renderer.ts)

    custom/                           # Custom user simulations
      index.ts                        # Registers "Custom Simulation" card in menu
      sandbox.ts                      # Sandboxed execution via new Function() + timeout
      draw-proxy.ts                   # DrawCommand protocol + canvas replay
```

---

## Implementation Phases

### Phase 1: Infrastructure + Router + Auth -- DONE

- [x] Create `src/router.ts` -- History API router with route matching, auth guards
- [x] Refactor `src/app.ts` logic into router (app.ts deleted)
- [x] Add `@supabase/supabase-js`, create `auth/` module (client, service, store)
- [x] Build `ui/login-screen.ts` with Google + GitHub OAuth buttons
- [x] Navbar with auth state integrated into router
- [x] Move APF-specific types from `src/types.ts` to `src/simulations/apf-swarm/types.ts`
- [x] Create `src/ui/panel-builder.ts` -- generic panel builder
- [x] Create `src/rendering/shared.ts` -- shared render utilities
- [x] Set up Supabase project (tables, RLS policies, auth trigger) -- schema applied via psql
- [x] Set up Vercel deployment with env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)
- [x] Configure `vercel.json` with SPA rewrites for clean URLs
- [x] Enable Google OAuth provider in Supabase Dashboard
- [x] Enable GitHub OAuth provider in Supabase Dashboard

### Phase 2: Built-in Simulations -- DONE

Each follows the APF pattern: `index.ts` -> `register()`, `simulation.ts` -> pure `tick()`, `config.ts` -> defaults, `renderers/`.

- [x] **Boids** -- separation, alignment, cohesion. Agents as directional triangles.
- [x] **PSO** -- fitness landscape (Rastrigin/Rosenbrock/Ackley/Sphere), personal/global best. Contour map.
- [x] **ACO** -- pheromone grid, evaporation, nest<->food pathfinding. Heatmap.
- [x] **Firefly** -- brightness = fitness, attraction to brighter. Glow rendering. Reuses PSO fitness functions.

### Phase 3: Save Configurations -- DONE

- [x] Create `db/` module (profiles, saved-simulations, shared-links CRUD)
- [x] Build `ui/profile-screen.ts` -- list, load, delete saved configs
- [x] Add "Save" button to simulation panels (visible when authenticated)
- [x] Support loading saved configs via `/editor/:id` route

### Phase 4: Custom Code Editor -- DONE

- [x] Add CodeMirror 6 with JS syntax highlighting + one-dark theme
- [x] Build sandbox with `new Function()` + DrawProxy draw command protocol
- [x] Build custom simulation adapter in `custom/index.ts`
- [x] Add starter templates (empty, bouncing particles, simple flocking)
- [x] Timeout watchdog (100ms/tick), draw command limit (10k/frame)
- [x] Save/load custom code to Supabase

### Phase 5: Sharing -- DONE

- [x] `db/shared-links.ts` -- create/resolve share tokens
- [x] `/shared/:token` route resolves token and loads simulation
- [x] Share modal UI (`ui/share-modal.ts`) -- generate link, copy to clipboard
- [x] Shared custom sims load and run in sandbox
- [x] Shared built-in sims load with saved params

### Phase 6: Polish -- PARTIAL

- [ ] Animated previews on main menu cards (mini canvas)
- [x] Tag-based filtering on main menu
- [x] Responsive layout for mobile

---

## Deployment -- DONE

- [x] `vercel.json` configured (build command, output dir, SPA rewrites)
- [x] Vite `manualChunks` for code-splitting (main ~65KB, supabase ~172KB, codemirror ~402KB)
- [x] GitHub org repo: `redush-com/sim2d` (primary)
- [x] GitHub personal repo: `brnikita/sim2d` (Vercel-connected)
- [x] GitHub Action auto-syncs org -> personal on push to main
- [x] Vercel project created, importing from `brnikita/sim2d`
- [x] Vercel deployment live
- [x] Custom domain `sim2d.com` added in Vercel
- [x] Supabase Site URL set to `https://sim2d.com`

---

## Security

| Threat | Mitigation |
|--------|-----------|
| User code XSS | Web Worker has no DOM access. Draw commands are a whitelist of safe canvas ops. |
| Infinite loops | 100ms timeout per tick. `Worker.terminate()` + error message to user. |
| Resource exhaustion | Max 10k draw commands/frame, 1MB state object size. |
| Data access | Supabase RLS: users modify only own data. Shared links are read-only views. |
| Code injection | No `eval` on main thread. User code only executes inside Web Worker via `new Function()`. |
| Blocked Worker globals | `fetch`, `XMLHttpRequest`, `importScripts`, `eval` overridden to no-ops before user code runs. |

---

## Verification Checklist

### Auth
- [ ] Google OAuth login/logout works
- [ ] GitHub OAuth login/logout works
- [ ] Protected routes (`/editor`, `/profile`) redirect to `/login`
- [ ] Auth state persists on page refresh

### Built-in Simulations (for each model)
- [ ] Card appears on main menu
- [ ] Click -> simulation starts with default parameters
- [ ] Sliders affect behavior in real-time
- [ ] Back -> clean return to menu, no memory leaks
- [ ] Re-enter -> clean start
- [ ] Emergent behavior is visually obvious

### Save/Load
- [ ] Save current config -> appears in profile list
- [ ] Load saved config -> simulation starts with saved params
- [ ] Delete saved config works
- [ ] Saving without auth prompts login

### Custom Code Editor
- [ ] CodeMirror loads with syntax highlighting and dark theme
- [ ] "Run" compiles and executes user code on canvas
- [ ] Infinite loop is caught and reported within 100ms
- [ ] Save/load custom code works
- [ ] Starter templates load correctly

### Sharing
- [ ] Generate share link -> URL is copyable
- [ ] Open shared link (not logged in) -> simulation runs correctly
- [ ] Shared custom simulation runs in sandboxed worker
- [ ] Expired links show appropriate error

### Deployment
- [x] `npm run build` succeeds without errors
- [x] Vercel deploy serves the app correctly
- [x] Supabase env vars are picked up by Vite
- [x] OAuth callback redirects work on production URL
