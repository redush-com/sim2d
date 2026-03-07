import { Router } from './router';
import { initAuth } from './auth/auth-service';

// Register all simulations (side-effect imports)
import './simulations/apf-swarm/index';
import './simulations/boids/index';
import './simulations/pso/index';
import './simulations/ant-colony/index';
import './simulations/firefly/index';
import './simulations/custom/index';

/**
 * Entry point: initializes auth, creates the router, and handles initial route.
 */
function main(): void {
	const container = document.getElementById('app');
	if (!container) throw new Error('App container not found');

	initAuth();

	const router = new Router(container);
	router.handleRoute();
}

main();
