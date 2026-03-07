import type { SimulationDefinition } from '../simulations/types';

/** Set of currently active tag filters */
const activeTags = new Set<string>();

/**
 * Renders the main menu screen with tag filters and simulation cards.
 * Cards are generated from the registry and clicking navigates to the simulation.
 * @param container - the DOM element to render into
 * @param simulations - registered simulation definitions
 * @param onSelect - callback when a simulation card is clicked
 */
export function renderMainMenu(
	container: HTMLElement,
	simulations: SimulationDefinition[],
	onSelect: (id: string) => void,
): void {
	container.innerHTML = '';
	activeTags.clear();
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

	const allTags = extractUniqueTags(simulations);
	const filterBar = createTagFilterBar(allTags, simulations, onSelect);
	wrapper.appendChild(filterBar);

	const grid = document.createElement('div');
	grid.className = 'menu-grid';

	for (const sim of simulations) {
		grid.appendChild(createCard(sim, onSelect));
	}

	wrapper.appendChild(grid);
	container.appendChild(wrapper);
}

/**
 * Extracts all unique tags from an array of simulation definitions.
 * @param simulations - array of simulation definitions
 * @returns sorted array of unique tag strings
 */
function extractUniqueTags(simulations: SimulationDefinition[]): string[] {
	const tagSet = new Set<string>();
	for (const sim of simulations) {
		for (const tag of sim.tags) {
			tagSet.add(tag);
		}
	}
	return Array.from(tagSet).sort();
}

/**
 * Creates the tag filter bar with an "All" button and one pill per tag.
 * @param tags - unique tag strings to render
 * @param simulations - all simulation definitions (for filtering)
 * @param onSelect - card click handler passed through to re-rendered cards
 * @returns container element with filter pill buttons
 */
function createTagFilterBar(
	tags: string[],
	simulations: SimulationDefinition[],
	onSelect: (id: string) => void,
): HTMLElement {
	const bar = document.createElement('div');
	bar.className = 'tag-filter-bar';

	const allBtn = document.createElement('button');
	allBtn.className = 'tag-filter-pill tag-filter-pill--active';
	allBtn.textContent = 'All';
	allBtn.addEventListener('click', () => {
		activeTags.clear();
		updateFilterUI(bar, simulations, onSelect);
	});
	bar.appendChild(allBtn);

	for (const tag of tags) {
		const pill = document.createElement('button');
		pill.className = 'tag-filter-pill';
		pill.dataset['tag'] = tag;
		pill.textContent = `#${tag}`;
		pill.addEventListener('click', () => {
			toggleTag(tag, bar, simulations, onSelect);
		});
		bar.appendChild(pill);
	}

	return bar;
}

/**
 * Toggles a tag in the active set and refreshes the filter UI and grid.
 * @param tag - the tag to toggle
 * @param bar - the filter bar element (to update pill styles)
 * @param simulations - all simulation definitions
 * @param onSelect - card click handler
 */
function toggleTag(
	tag: string,
	bar: HTMLElement,
	simulations: SimulationDefinition[],
	onSelect: (id: string) => void,
): void {
	if (activeTags.has(tag)) {
		activeTags.delete(tag);
	} else {
		activeTags.add(tag);
	}
	updateFilterUI(bar, simulations, onSelect);
}

/**
 * Updates filter pill styles and re-renders the simulation grid
 * based on the current active tags.
 * @param bar - the filter bar element
 * @param simulations - all simulation definitions
 * @param onSelect - card click handler
 */
function updateFilterUI(
	bar: HTMLElement,
	simulations: SimulationDefinition[],
	onSelect: (id: string) => void,
): void {
	updatePillStyles(bar);
	const filtered = filterSimulations(simulations);
	rerenderGrid(bar, filtered, onSelect);
}

/**
 * Updates the active/inactive CSS classes on all filter pills.
 * @param bar - the filter bar containing pill buttons
 */
function updatePillStyles(bar: HTMLElement): void {
	const pills = bar.querySelectorAll('.tag-filter-pill');
	for (const pill of pills) {
		const btn = pill as HTMLElement;
		const tag = btn.dataset['tag'];
		const isAll = !tag;
		const isActive = isAll ? activeTags.size === 0 : tag !== null && activeTags.has(tag);
		btn.classList.toggle('tag-filter-pill--active', isActive);
	}
}

/**
 * Filters simulations by active tags using OR logic.
 * Returns all simulations if no tags are active.
 * @param simulations - all simulation definitions
 * @returns filtered array of simulations
 */
function filterSimulations(simulations: SimulationDefinition[]): SimulationDefinition[] {
	if (activeTags.size === 0) return simulations;
	return simulations.filter((sim) => sim.tags.some((tag) => activeTags.has(tag)));
}

/**
 * Clears and re-renders the simulation card grid.
 * @param bar - the filter bar (used to find sibling grid)
 * @param simulations - simulations to display
 * @param onSelect - card click handler
 */
function rerenderGrid(
	bar: HTMLElement,
	simulations: SimulationDefinition[],
	onSelect: (id: string) => void,
): void {
	const grid = bar.parentElement?.querySelector('.menu-grid');
	if (!grid) return;
	grid.innerHTML = '';
	for (const sim of simulations) {
		grid.appendChild(createCard(sim, onSelect));
	}
}

/**
 * Creates a clickable card element for a simulation.
 * @param sim - simulation definition
 * @param onSelect - click handler
 * @returns the card DOM element
 */
function createCard(sim: SimulationDefinition, onSelect: (id: string) => void): HTMLElement {
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
    .tag-filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 24px;
    }
    .tag-filter-pill {
      font-size: 12px;
      color: #888;
      background: #14141e;
      border: 1px solid #1e1e2a;
      padding: 4px 12px;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }
    .tag-filter-pill:hover {
      border-color: #3a3a55;
      color: #bbb;
    }
    .tag-filter-pill--active {
      color: #5588ff;
      background: rgba(85, 136, 255, 0.12);
      border-color: #5588ff;
    }
    @media (max-width: 600px) {
      .menu-wrapper {
        padding: 32px 14px;
      }
      .menu-title {
        font-size: 22px;
      }
      .menu-subtitle {
        font-size: 12px;
        margin-bottom: 24px;
      }
      .menu-grid {
        grid-template-columns: 1fr;
        gap: 14px;
      }
      .sim-card {
        padding: 18px;
      }
      .sim-card-title {
        font-size: 14px;
      }
      .sim-card-desc {
        font-size: 12px;
      }
      .tag-filter-pill {
        font-size: 11px;
        padding: 3px 10px;
      }
    }
  `;
	return style;
}
