# sim2d

An interactive web platform for exploring **swarm intelligence** algorithms through real-time 2D simulations. Built with TypeScript, HTML5 Canvas, Supabase, and deployed on Vercel.

**[sim2d.com](https://sim2d.com)**

## Simulations

| Model | Year | Core Idea |
|-------|------|-----------|
| **Artificial Potential Fields** | 1986 | Agents navigate via attractive/repulsive force fields |
| **Boids (Flocking)** | 1987 | Separation + alignment + cohesion create realistic flocking |
| **Ant Colony Optimization** | 1992 | Pheromone trails guide ants to shortest paths |
| **Particle Swarm Optimization** | 1995 | Particles search for optima sharing personal/global bests |
| **Firefly Algorithm** | 2008 | Dimmer fireflies move toward brighter ones |
| **Custom Simulation** | -- | Write your own in JavaScript with a built-in code editor |

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### With Supabase (optional, for auth/saving/sharing)

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. Enable Google and/or GitHub OAuth providers
4. Copy `.env.example` to `.env` and fill in your keys:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Without Supabase configured, all simulations work locally -- auth and saving are disabled.

## Features

- **6 interactive simulations** with real-time parameter tuning via sliders
- **Custom code editor** -- write `init()` and `tick()` functions, runs in a sandboxed environment
- **OAuth authentication** (Google, GitHub) via Supabase
- **Save & load** simulation configurations to your profile
- **Share** simulations with others via link
- **Dark theme**, responsive, no framework dependencies

## Interaction

- **Drag** goals, obstacles, and food sources directly on the canvas
- **Tune parameters** via the side panel sliders
- **Pause / Resume / Reset** with control buttons
- **Switch functions** in PSO and Firefly (Rastrigin, Rosenbrock, Ackley, Sphere)

## Tech Stack

- **TypeScript** + **Vite** -- zero-framework, minimal overhead
- **HTML5 Canvas** -- native 2D rendering
- **Supabase** -- auth (OAuth), database (Postgres + RLS), share links
- **CodeMirror 6** -- browser-based code editor for custom simulations
- **Vercel** -- static deployment with SPA rewrites

## Project Structure

```
src/
  main.ts                    # Entry point, registers simulations
  router.ts                  # SPA router (History API, clean URLs)
  types.ts                   # Shared Vec2 type
  loop.ts                    # Animation loop with delta-time

  auth/                      # Supabase OAuth (Google, GitHub)
  db/                        # Database services (profiles, saved sims, share links)
  editor/                    # CodeMirror 6 setup, starter templates
  math/                      # Vec2 operations
  rendering/                 # Shared canvas utilities (grid, heatmap, arrows)
  ui/                        # Main menu, panel builder, login, profile screens

  simulations/
    registry.ts              # Plugin registry (register/getAll/getById)
    apf-swarm/               # Artificial Potential Fields
    boids/                   # Reynolds flocking (separation, alignment, cohesion)
    pso/                     # Particle Swarm Optimization (4 fitness functions)
    ant-colony/              # Ant Colony Optimization (pheromone trails)
    firefly/                 # Firefly Algorithm (brightness-based attraction)
    custom/                  # User code editor with sandboxed execution
```

Each simulation follows the same plugin pattern: `types.ts`, `config.ts`, `simulation.ts`, `renderers/`, and `index.ts` that self-registers via side-effect import.

## URLs

| Path | Screen |
|------|--------|
| `/` | Main menu with simulation cards |
| `/sim/:id` | Run a built-in simulation |
| `/editor` | Custom simulation code editor |
| `/profile` | Saved simulations list |
| `/login` | OAuth sign-in |
| `/shared/:token` | View a shared simulation |

## Deployment

```bash
npm run build    # TypeScript check + Vite production build
```

Deploy the `dist/` folder to Vercel (or any static host with SPA rewrite support).

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your hosting dashboard.

## References

- Khatib, O. (1986). *Real-time obstacle avoidance for manipulators and mobile robots.*
- Reynolds, C. (1987). *Flocks, herds and schools: A distributed behavioral model.*
- Dorigo, M. (1992). *Optimization, learning and natural algorithms.*
- Kennedy, J. & Eberhart, R. (1995). *Particle swarm optimization.*
- Yang, X-S. (2008). *Nature-inspired metaheuristic algorithms.*
