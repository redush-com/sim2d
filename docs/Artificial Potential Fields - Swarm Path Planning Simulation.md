# Artificial Potential Fields - Swarm Path Planning Simulation

## Overview

A web-based 2D interactive simulation demonstrating **Artificial Potential Fields (APF)** for multi-agent swarm path planning. The simulation shows how 10 autonomous agents navigate toward a shared goal, avoid obstacles, and maintain spacing from each other -- using only local force calculations with zero communication between agents.

## The Core Idea

Every obstacle repels agents like a magnetic field. The goal attracts them. Agents repel each other. Each agent simply follows the net force -- and what emerges is coordinated swarm behavior from nothing but physics-inspired math.

```
F_total = F_attractive + F_obstacle_repulsion + F_inter_robot_repulsion
```

**No map. No messages. No central controller. Just gradients.**

## Force Equations

### Attractive Force (Linear)
Pulls each agent toward the goal with strength proportional to distance.
```
F_att = k_att * (goal_pos - agent_pos)
```

### Obstacle Repulsive Force (Inverse-Square with Cutoff)
Each obstacle repels nearby agents. Force drops to zero beyond influence distance `d0`.
```
d = ||agent_pos - obstacle_pos|| - obstacle_radius
if d > d0:  F_rep = 0
else:       F_rep = k_rep * (1/d - 1/d0) * (1/d^2) * unit_vector_away
```

### Inter-Robot Repulsive Force
Same formulation as obstacle repulsion, but between agents to maintain spacing.
```
d = ||agent_pos - other_agent_pos||
if d > d_robot:  F_rep = 0
else:            F_rep = k_rep_robot * (1/d - 1/d_robot) * (1/d^2) * unit_vector_away
```

## Tunable Parameters

| Parameter        | Default | Description                                       |
|------------------|---------|---------------------------------------------------|
| `kAtt`           | 1.0     | Attractive force gain                              |
| `kRep`           | 100.0   | Obstacle repulsion gain                            |
| `kRepRobot`      | 50.0    | Inter-robot repulsion gain                         |
| `d0`             | 80 px   | Obstacle influence distance threshold              |
| `dRobot`         | 50 px   | Inter-robot influence distance threshold           |
| `agentCount`     | 10      | Number of swarm agents                             |
| `maxSpeed`       | 200     | Velocity clamp (px/s)                              |
| `trailLength`    | 100     | Max trail points per agent                         |
| `perturbStrength`| 50      | Random perturbation magnitude for local minima     |
| `stuckThreshold` | 0.5     | Velocity threshold for stuck detection             |
| `stuckFrames`    | 60      | Consecutive low-velocity frames before perturbation|

**The tuning is where the art lives** -- `kRepRobot = 100` vs `kRep = 1.0`, and the swarm collapses or explodes if you get it wrong.

## Tech Stack

- **Vite + vanilla TypeScript** -- minimal setup, zero framework overhead
- **HTML5 Canvas** -- native 2D rendering, no dependencies
- Pure client-side, no backend

## Architecture

```
src/
  main.ts                          # Composition root: wires all modules together
  types.ts                         # Shared interfaces (Vec2, SimulationParams, AgentState, Obstacle)
  config.ts                        # Default parameters & canvas constants
  math/
    vector.ts                      # Pure Vec2 operations (add, sub, scale, normalize, etc.)
    forces.ts                      # APF force calculations (attractive, repulsive, inter-robot, total)
  simulation/
    agent.ts                       # Agent creation & update (apply force, clamp velocity, maintain trail)
    obstacle.ts                    # Obstacle factory + 5 default obstacle positions
    local-minima.ts                # Stuck detection + random perturbation escape
    simulation-engine.ts           # Tick orchestrator: compute forces, detect/escape minima, update state
  rendering/
    renderer.ts                    # Main renderer: clear canvas, compose sub-renderers
    agent-renderer.ts              # Draw agents as glowing circles + fading color trails
    obstacle-renderer.ts           # Draw obstacles with translucent repulsion-zone halos
    goal-renderer.ts               # Draw goal as pulsing crosshair marker
  ui/
    controls.ts                    # Bind HTML sliders to simulation params with live value display
    interaction.ts                 # Mouse drag: move goal and obstacles interactively
  loop.ts                          # requestAnimationFrame loop with delta-time capping + pause/resume
```

### Design Decisions

- **Functional state** -- `tick(state, dt) -> newState`. No mutation, deterministic, debuggable.
- **Dependency inversion** -- `main.ts` is the composition root. Simulation doesn't know about rendering. UI doesn't know about the engine.
- **Pure force functions** -- trivially testable, new force types added by extension (Open/Closed).
- **Trail as capped array** -- push + shift at limit, bounded memory.

## Visual Design

- **Theme:** Dark (near-black `#0a0a0f` background) with subtle grid lines
- **Agents:** Small glowing circles (6px) with HSL colors evenly distributed, directional velocity indicator
- **Trails:** Per-agent fading polylines (comet effect -- opacity and width decrease toward tail)
- **Obstacles:** Red filled circles at actual radius, translucent red halo at `d0` showing influence zone
- **Goal:** Pulsing green crosshair with glowing halo animation

## Interaction

- **Drag goal** -- click and drag the goal marker to reposition it; agents redirect in real-time
- **Drag obstacles** -- click and drag any obstacle to create new navigation challenges
- **Parameter sliders** -- right-side panel with labeled sliders for all tunable parameters
- **Pause/Resume** -- toggle simulation
- **Reset** -- respawn agents at random positions

## Local Minima Handling

APF has a known limitation: agents can get trapped where repulsive and attractive forces perfectly cancel. The simulation handles this with:

1. **Detection** -- when an agent's velocity stays below `stuckThreshold` for `stuckFrames` consecutive frames
2. **Escape** -- apply a random perturbation vector of magnitude `perturbStrength` to break the equilibrium

Production systems typically use hybrid methods (switching to RRT near minima, adding vortex fields), but random perturbation is effective for demonstration purposes.

## Implementation Phases

### Phase 1: Scaffolding
- [x] Initialize Vite + TypeScript project (`package.json`, `tsconfig.json`, `vite.config.ts`)
- [x] Create `index.html` with canvas and dark-themed control panel
- [x] Set up directory structure (`src/math/`, `src/simulation/`, `src/rendering/`, `src/ui/`)

### Phase 2: Core Math
- [x] Vec2 pure functions -- `src/math/vector.ts` (add, sub, scale, normalize, distance, clamp, randomUnit, ZERO)
- [x] APF force calculations -- `src/math/forces.ts` (attractive, obstacle repulsive, inter-robot repulsive, total)
- [x] Default parameter constants -- `src/config.ts`

### Phase 3: Simulation Engine
- [x] Agent creation and physics update -- `src/simulation/agent.ts` (force -> acceleration -> velocity -> position)
- [x] Obstacle factory with 5 default positions -- `src/simulation/obstacle.ts`
- [x] Local minima detection and perturbation escape -- `src/simulation/local-minima.ts`
- [x] Tick orchestrator that ties it all together -- `src/simulation/simulation-engine.ts`

### Phase 4: Rendering
- [x] Goal renderer (pulsing crosshair) -- `src/rendering/goal-renderer.ts`
- [x] Obstacle renderer (bodies + influence halos) -- `src/rendering/obstacle-renderer.ts`
- [x] Agent renderer (glowing bodies + fading trails) -- `src/rendering/agent-renderer.ts`
- [x] Main renderer composing all sub-renderers with dark theme -- `src/rendering/renderer.ts`

### Phase 5: UI & Interaction
- [x] Slider bindings for all tunable parameters -- `src/ui/controls.ts`
- [x] Mouse drag interaction for goal and obstacles -- `src/ui/interaction.ts`
- [x] Animation loop with delta-time capping and pause/resume -- `src/loop.ts`

### Phase 6: Integration & Polish
- [x] Wire all modules in `main.ts` -- `src/main.ts`
- [x] Tune default parameters for visually appealing emergent behavior
- [x] Final CSS styling and layout (inline in `index.html`)

## Verification Checklist

- [ ] `npm run dev` -- 10 agents converge on goal while avoiding 5 obstacles (needs manual verification)
- [ ] Drag goal to new position -- agents redirect smoothly (needs manual verification)
- [ ] Drag obstacle into agent path -- agents route around it (needs manual verification)
- [ ] High `kRepRobot` -- agents spread far apart; low value -- agents cluster (needs manual verification)
- [ ] Obstacle between agents and goal -- perturbation kicks in, no permanent trapping (needs manual verification)
- [ ] Change `agentCount` slider -- agents added/removed dynamically (needs manual verification)
- [ ] Trails fade correctly, creating the "hypnotic" visual effect (needs manual verification)

## References

- Khatib, O. (1986). "Real-time obstacle avoidance for manipulators and mobile robots." *International Journal of Robotics Research.*
- The classic APF formulation with attractive + repulsive potential functions
- Extension to multi-agent systems via inter-robot repulsion fields
