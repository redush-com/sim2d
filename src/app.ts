import type { SimulationInstance } from './simulations/types';
import { getAll, getById } from './simulations/registry';
import { renderMainMenu } from './ui/main-menu';

/**
 * Application router that manages navigation between the main menu
 * and individual simulation screens. Handles simulation lifecycle.
 */
export class App {
  private container: HTMLElement;
  private currentSim: SimulationInstance | null = null;

  /**
   * @param container - root DOM element to render into
   */
  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Shows the main menu with simulation cards.
   * Stops and destroys any running simulation first.
   */
  showMenu(): void {
    if (this.currentSim) {
      this.currentSim.stop();
      this.currentSim.destroy();
      this.currentSim = null;
    }

    renderMainMenu(this.container, getAll(), (id) => this.navigate(id));
  }

  /**
   * Navigates to a specific simulation by id.
   * Creates the simulation layout (canvas + panel), instantiates and starts it.
   * @param simId - the simulation identifier to launch
   */
  navigate(simId: string): void {
    const definition = getById(simId);
    if (!definition) return;

    if (this.currentSim) {
      this.currentSim.stop();
      this.currentSim.destroy();
      this.currentSim = null;
    }

    this.container.innerHTML = '';
    const { canvas, panel } = this.createSimulationLayout();

    this.currentSim = definition.create(canvas, panel);
    this.currentSim.start();
  }

  /**
   * Creates the simulation page layout: back button, canvas area, and side panel.
   * @returns references to the canvas and panel elements
   */
  private createSimulationLayout(): {
    canvas: HTMLCanvasElement;
    panel: HTMLElement;
  } {
    const style = document.createElement('style');
    style.textContent = `
      .sim-layout { display: flex; height: 100vh; }
      .sim-canvas-area { flex: 1; position: relative; }
      .sim-canvas-area canvas { width: 100%; height: 100%; display: block; }
      .sim-panel {
        width: 280px;
        background: #0e0e14;
        border-left: 1px solid #1a1a24;
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .sim-back-btn {
        position: absolute;
        top: 12px;
        left: 12px;
        z-index: 10;
        background: rgba(14, 14, 20, 0.8);
        border: 1px solid #2a2a3a;
        border-radius: 6px;
        color: #999;
        padding: 6px 14px;
        font-size: 12px;
        cursor: pointer;
        transition: color 0.15s, border-color 0.15s;
        backdrop-filter: blur(4px);
      }
      .sim-back-btn:hover { color: #ddd; border-color: #4a4a60; }
    `;
    this.container.appendChild(style);

    const layout = document.createElement('div');
    layout.className = 'sim-layout';

    const canvasArea = document.createElement('div');
    canvasArea.className = 'sim-canvas-area';

    const backBtn = document.createElement('button');
    backBtn.className = 'sim-back-btn';
    backBtn.textContent = 'Back';
    backBtn.addEventListener('click', () => this.showMenu());
    canvasArea.appendChild(backBtn);

    const canvas = document.createElement('canvas');
    canvasArea.appendChild(canvas);

    const panel = document.createElement('div');
    panel.className = 'sim-panel';

    layout.appendChild(canvasArea);
    layout.appendChild(panel);
    this.container.appendChild(layout);

    return { canvas, panel };
  }
}
