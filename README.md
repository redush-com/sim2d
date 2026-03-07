# APF Swarm Simulation

A web-based 2D interactive simulation demonstrating **Artificial Potential Fields (APF)** for multi-agent swarm path planning.

10 autonomous agents navigate toward a shared goal, avoid 5 obstacles, and maintain spacing from each other — using only local force calculations. No communication, no central controller, no map. Just physics-inspired math.

## Demo

Run locally:

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## How It Works

Each agent computes a net force from three components:

```
F = F_attractive + F_obstacle_repulsion + F_inter_robot_repulsion
```

- **Attractive force** pulls the agent toward the goal (linear)
- **Obstacle repulsion** pushes the agent away from nearby obstacles (inverse-square with cutoff)
- **Inter-robot repulsion** maintains spacing between agents (inverse-square with cutoff)

The agent follows the resulting gradient — and coordinated swarm behavior emerges.

### Local Minima Escape

APF can trap agents where forces cancel out. The simulation detects stuck agents (low velocity for N frames) and applies random perturbation to break the equilibrium.

## Interaction

- **Drag the goal** (green crosshair) to reposition it — agents redirect in real-time
- **Drag obstacles** (red circles) to create new navigation challenges
- **Tune parameters** via the right-side slider panel
- **Pause / Resume / Reset** with the control buttons

## Tunable Parameters

| Parameter | Default | Effect |
|-----------|---------|--------|
| `k_att` | 1.0 | Attractive force strength |
| `k_rep` | 100.0 | Obstacle repulsion strength |
| `k_rep_robot` | 50.0 | Inter-robot repulsion strength |
| `d0` | 80 px | Obstacle influence radius |
| `d_robot` | 50 px | Inter-robot influence radius |
| `Agent count` | 10 | Number of swarm agents |
| `Max speed` | 200 | Velocity clamp (px/s) |
| `Trail length` | 100 | Trail points per agent |
| `Perturb force` | 50 | Local minima escape strength |

## Tech Stack

- **TypeScript** + **Vite** — zero-framework, minimal overhead
- **HTML5 Canvas** — native 2D rendering
- Pure client-side, no backend

## Project Structure

```
src/
  math/          # Vec2 operations, APF force calculations
  simulation/    # Agent physics, obstacle factory, local minima handling, tick engine
  rendering/     # Canvas renderers (agents, trails, obstacles, goal)
  ui/            # Slider controls, mouse drag interaction
  main.ts        # Composition root
  loop.ts        # Animation loop with delta-time
  types.ts       # Shared interfaces
  config.ts      # Default parameters
```

## References

- Khatib, O. (1986). *Real-time obstacle avoidance for manipulators and mobile robots.* International Journal of Robotics Research.
