/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed',
      from: {},
      to: { circular: true },
    },
    /* --- Cross-simulation isolation rules ---
     * Each simulation folder may only import from its own folder,
     * src/simulations/types.ts, src/simulations/registry.ts,
     * and the whitelisted src/simulations/pso/fitness.ts (for firefly).
     * One rule per simulation folder forbids imports from other sim folders.
     */
    {
      name: 'no-cross-sim-ant-colony',
      severity: 'error',
      comment: 'ant-colony must not import from other simulation folders',
      from: { path: '^src/simulations/ant-colony/' },
      to: {
        path: '^src/simulations/(apf-swarm|boids|custom|firefly|pso)/',
      },
    },
    {
      name: 'no-cross-sim-apf-swarm',
      severity: 'error',
      comment: 'apf-swarm must not import from other simulation folders',
      from: { path: '^src/simulations/apf-swarm/' },
      to: {
        path: '^src/simulations/(ant-colony|boids|custom|firefly|pso)/',
      },
    },
    {
      name: 'no-cross-sim-boids',
      severity: 'error',
      comment: 'boids must not import from other simulation folders',
      from: { path: '^src/simulations/boids/' },
      to: {
        path: '^src/simulations/(ant-colony|apf-swarm|custom|firefly|pso)/',
      },
    },
    {
      name: 'no-cross-sim-custom',
      severity: 'error',
      comment: 'custom must not import from other simulation folders',
      from: { path: '^src/simulations/custom/' },
      to: {
        path: '^src/simulations/(ant-colony|apf-swarm|boids|firefly|pso)/',
      },
    },
    {
      name: 'no-cross-sim-firefly',
      severity: 'error',
      comment:
        'firefly must not import from other simulation folders (except pso/fitness.ts)',
      from: { path: '^src/simulations/firefly/' },
      to: {
        path: '^src/simulations/(ant-colony|apf-swarm|boids|custom|pso)/',
        pathNot: '^src/simulations/pso/fitness\\.ts$',
      },
    },
    {
      name: 'no-cross-sim-pso',
      severity: 'error',
      comment: 'pso must not import from other simulation folders',
      from: { path: '^src/simulations/pso/' },
      to: {
        path: '^src/simulations/(ant-colony|apf-swarm|boids|custom|firefly)/',
      },
    },
    /* --- Layer isolation rules --- */
    {
      name: 'no-ui-imports-simulation-internals',
      severity: 'error',
      comment: 'UI may only import simulation types and registry, not internals',
      from: { path: '^src/ui/' },
      to: {
        path: '^src/simulations/',
        pathNot: [
          '^src/simulations/types\\.ts$',
          '^src/simulations/registry\\.ts$',
        ],
      },
    },
    {
      name: 'no-db-imports-ui-or-simulations',
      severity: 'error',
      comment: 'DB module must not import from UI or simulations',
      from: { path: '^src/db/' },
      to: { path: '^src/(ui|simulations)/' },
    },
    {
      name: 'no-auth-imports-ui-or-sims-or-db',
      severity: 'error',
      comment: 'Auth module must not import UI, simulations, or DB',
      from: { path: '^src/auth/' },
      to: { path: '^src/(ui|simulations|db)/' },
    },
    {
      name: 'no-direct-supabase-client',
      severity: 'error',
      comment: 'Only auth/ and db/ may import supabase-client directly',
      from: { pathNot: '^src/(auth|db)/' },
      to: { path: '^src/auth/supabase-client\\.ts$' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
};
