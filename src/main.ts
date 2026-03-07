import { App } from './app';

// Register all simulations (side-effect imports)
import './simulations/apf-swarm/index';

/**
 * Entry point: creates the app and shows the main menu.
 */
function main(): void {
  const container = document.getElementById('app');
  if (!container) throw new Error('App container not found');

  const app = new App(container);
  app.showMenu();
}

main();
