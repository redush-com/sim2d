import type { SimulationDefinition } from '../simulations/types';

/**
 * Renders the main menu screen with simulation cards.
 * Cards are generated from the registry and clicking navigates to the simulation.
 * @param container - the DOM element to render into
 * @param simulations - registered simulation definitions
 * @param onSelect - callback when a simulation card is clicked
 */
export function renderMainMenu(
  container: HTMLElement,
  simulations: SimulationDefinition[],
  onSelect: (id: string) => void
): void {
  container.innerHTML = '';
  container.appendChild(createMenuStyles());

  const wrapper = document.createElement('div');
  wrapper.className = 'menu-wrapper';

  const header = document.createElement('h1');
  header.className = 'menu-title';
  header.textContent = 'sim2d';
  wrapper.appendChild(header);

  const subtitle = document.createElement('p');
  subtitle.className = 'menu-subtitle';
  subtitle.textContent = 'Interactive 2D swarm intelligence simulations';
  wrapper.appendChild(subtitle);

  const grid = document.createElement('div');
  grid.className = 'menu-grid';

  for (const sim of simulations) {
    grid.appendChild(createCard(sim, onSelect));
  }

  wrapper.appendChild(grid);
  container.appendChild(wrapper);
}

/**
 * Creates a clickable card element for a simulation.
 * @param sim - simulation definition
 * @param onSelect - click handler
 * @returns the card DOM element
 */
function createCard(
  sim: SimulationDefinition,
  onSelect: (id: string) => void
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'sim-card';
  card.addEventListener('click', () => onSelect(sim.id));

  const title = document.createElement('h2');
  title.className = 'sim-card-title';
  title.textContent = sim.title;

  const desc = document.createElement('p');
  desc.className = 'sim-card-desc';
  desc.textContent = sim.description;

  const tags = document.createElement('div');
  tags.className = 'sim-card-tags';
  for (const tag of sim.tags) {
    const span = document.createElement('span');
    span.className = 'sim-card-tag';
    span.textContent = `#${tag}`;
    tags.appendChild(span);
  }

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(tags);
  return card;
}

/**
 * Creates and returns a style element for the main menu.
 * @returns style element with menu CSS
 */
function createMenuStyles(): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = `
    .menu-wrapper {
      max-width: 900px;
      margin: 0 auto;
      padding: 60px 24px;
    }
    .menu-title {
      font-size: 28px;
      font-weight: 700;
      color: #e0e0e8;
      margin-bottom: 8px;
      letter-spacing: 0.3px;
    }
    .menu-subtitle {
      font-size: 14px;
      color: #666;
      margin-bottom: 40px;
    }
    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }
    .sim-card {
      background: #12121a;
      border: 1px solid #1e1e2a;
      border-radius: 12px;
      padding: 24px;
      cursor: pointer;
      transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .sim-card:hover {
      border-color: #3a3a55;
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
    .sim-card-title {
      font-size: 16px;
      font-weight: 600;
      color: #d0d0d8;
      margin-bottom: 8px;
    }
    .sim-card-desc {
      font-size: 13px;
      color: #888;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .sim-card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .sim-card-tag {
      font-size: 11px;
      color: #5588ff;
      background: rgba(85, 136, 255, 0.08);
      padding: 2px 8px;
      border-radius: 4px;
    }
  `;
  return style;
}
