import type { SimulationInstance } from './simulations/types';
import { getAll, getById } from './simulations/registry';
import { renderMainMenu } from './ui/main-menu';
import { renderLoginScreen } from './ui/login-screen';
import { renderProfileScreen } from './ui/profile-screen';
import { authStore } from './auth/auth-store';

/** Parsed route with name and optional parameters */
interface Route {
  name: string;
  params: Record<string, string>;
}

/**
 * Navigates to a path using the History API without a full page reload.
 * @param path - the URL path to navigate to (e.g. '/sim/boids')
 */
export function navigateTo(path: string): void {
  history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * SPA router using the History API for clean URLs.
 * Handles simulation lifecycle and auth-guarded routes.
 */
export class Router {
  private container: HTMLElement;
  private currentSim: SimulationInstance | null = null;

  /**
   * @param container - root DOM element to render into
   */
  constructor(container: HTMLElement) {
    this.container = container;
    window.addEventListener('popstate', () => this.handleRoute());
    authStore.subscribe(() => this.updateNavbar());
  }

  /** Parses the current URL path and navigates to the matching screen */
  handleRoute(): void {
    const route = this.parsePath();

    this.destroyCurrentSim();

    switch (route.name) {
      case 'login':
        this.showLogin();
        break;
      case 'profile':
        if (!this.requireAuth()) return;
        this.showProfile();
        break;
      case 'sim':
        this.showSimulation(route.params['id']);
        break;
      case 'editor':
        if (!this.requireAuth()) return;
        this.showSimulation('custom', route.params['id']);
        break;
      case 'shared':
        this.showShared(route.params['token']);
        break;
      default:
        this.showMenu();
        break;
    }
  }

  /**
   * Parses window.location.pathname into a Route object.
   * @returns parsed route with name and params
   */
  private parsePath(): Route {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const parts = path.split('/').filter(Boolean);

    if (parts[0] === 'sim' && parts[1]) return { name: 'sim', params: { id: parts[1] } };
    if (parts[0] === 'editor') return { name: 'editor', params: { id: parts[1] || '' } };
    if (parts[0] === 'shared' && parts[1]) return { name: 'shared', params: { token: parts[1] } };
    if (parts[0] === 'login') return { name: 'login', params: {} };
    if (parts[0] === 'profile') return { name: 'profile', params: {} };
    return { name: 'home', params: {} };
  }

  /**
   * Checks if user is authenticated. Redirects to login if not.
   * @returns true if authenticated
   */
  private requireAuth(): boolean {
    if (authStore.getState().user) return true;
    navigateTo('/login');
    return false;
  }

  /** Updates the navbar auth state without re-rendering the whole page */
  private updateNavbar(): void {
    const navbar = this.container.querySelector('.app-navbar');
    if (navbar) {
      const authArea = navbar.querySelector('.navbar-auth');
      if (authArea) {
        authArea.innerHTML = '';
        authArea.appendChild(this.createAuthButton());
      }
    }
  }

  /** Renders the main menu with simulation cards */
  private showMenu(): void {
    this.container.innerHTML = '';
    this.container.appendChild(this.createNavbar());
    const content = document.createElement('div');
    content.className = 'app-content';
    this.container.appendChild(content);
    renderMainMenu(content, getAll(), (id) => {
      navigateTo(`/sim/${id}`);
    });
  }

  /** Renders the login screen */
  private showLogin(): void {
    this.container.innerHTML = '';
    this.container.appendChild(this.createNavbar());
    const content = document.createElement('div');
    content.className = 'app-content';
    this.container.appendChild(content);
    renderLoginScreen(content);
  }

  /** Renders the user profile screen */
  private showProfile(): void {
    this.container.innerHTML = '';
    this.container.appendChild(this.createNavbar());
    const content = document.createElement('div');
    content.className = 'app-content';
    this.container.appendChild(content);
    renderProfileScreen(content);
  }

  /**
   * Navigates to a simulation by id. Creates layout and starts the sim.
   * @param simId - simulation identifier
   * @param savedConfigId - optional saved config to load
   */
  private showSimulation(simId: string, savedConfigId?: string): void {
    const definition = getById(simId);
    if (!definition) {
      navigateTo('/');
      return;
    }

    this.container.innerHTML = '';
    const { canvas, panel } = this.createSimulationLayout();

    this.currentSim = definition.create(canvas, panel);
    this.currentSim.start();
  }

  /**
   * Shows a shared simulation by resolving the share token.
   * @param token - share link token
   */
  private showShared(token: string): void {
    // Phase 5: resolve token from Supabase and load simulation
    // For now, redirect to home
    navigateTo('/');
  }

  /** Stops and destroys the current simulation if running */
  private destroyCurrentSim(): void {
    if (this.currentSim) {
      this.currentSim.stop();
      this.currentSim.destroy();
      this.currentSim = null;
    }
  }

  /**
   * Creates the top navigation bar with logo and auth controls.
   * @returns navbar DOM element
   */
  private createNavbar(): HTMLElement {
    const style = document.createElement('style');
    style.textContent = `
      .app-navbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 20px; height: 48px;
        background: #0a0a10; border-bottom: 1px solid #1a1a24;
        position: sticky; top: 0; z-index: 100;
      }
      .navbar-logo {
        font-size: 14px; font-weight: 600; color: #c0c0cc;
        cursor: pointer; text-decoration: none;
      }
      .navbar-auth { display: flex; align-items: center; gap: 10px; }
      .navbar-btn {
        padding: 5px 14px; border-radius: 6px; font-size: 12px;
        cursor: pointer; border: 1px solid #2a2a3a; background: #14141e;
        color: #999; transition: all 0.15s;
      }
      .navbar-btn:hover { border-color: #3a3a50; color: #ddd; }
      .navbar-avatar {
        width: 28px; height: 28px; border-radius: 50%;
        border: 1px solid #2a2a3a; cursor: pointer;
      }
      .app-content { height: calc(100vh - 48px); overflow-y: auto; }
    `;
    this.container.appendChild(style);

    const nav = document.createElement('nav');
    nav.className = 'app-navbar';

    const logo = document.createElement('a');
    logo.className = 'navbar-logo';
    logo.href = '/';
    logo.textContent = 'sim2d';
    logo.addEventListener('click', (e) => { e.preventDefault(); navigateTo('/'); });
    nav.appendChild(logo);

    const authArea = document.createElement('div');
    authArea.className = 'navbar-auth';
    authArea.appendChild(this.createAuthButton());
    nav.appendChild(authArea);

    return nav;
  }

  /**
   * Creates the auth button (login or avatar+menu) based on auth state.
   * @returns DOM element for auth controls
   */
  private createAuthButton(): HTMLElement {
    const { user } = authStore.getState();

    if (user) {
      const profileBtn = document.createElement('button');
      profileBtn.className = 'navbar-btn';
      profileBtn.textContent = 'My Simulations';
      profileBtn.addEventListener('click', () => { navigateTo('/profile'); });

      const avatar = document.createElement('img');
      avatar.className = 'navbar-avatar';
      avatar.src = user.user_metadata?.['avatar_url'] || '';
      avatar.alt = user.user_metadata?.['full_name'] || 'User';
      avatar.onerror = () => { avatar.style.display = 'none'; };

      const container = document.createElement('div');
      container.className = 'navbar-auth';
      container.appendChild(profileBtn);
      container.appendChild(avatar);
      return container;
    }

    const loginBtn = document.createElement('button');
    loginBtn.className = 'navbar-btn';
    loginBtn.textContent = 'Sign In';
    loginBtn.addEventListener('click', () => { navigateTo('/login'); });
    return loginBtn;
  }

  /**
   * Creates the simulation page layout: back button, canvas, and side panel.
   * @returns references to canvas and panel elements
   */
  private createSimulationLayout(): { canvas: HTMLCanvasElement; panel: HTMLElement } {
    const style = document.createElement('style');
    style.textContent = `
      .sim-layout { display: flex; height: 100vh; }
      .sim-canvas-area { flex: 1; position: relative; }
      .sim-canvas-area canvas { width: 100%; height: 100%; display: block; }
      .sim-panel {
        width: 280px; background: #0e0e14; border-left: 1px solid #1a1a24;
        padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
      }
      .sim-back-btn {
        position: absolute; top: 12px; left: 12px; z-index: 10;
        background: rgba(14, 14, 20, 0.8); border: 1px solid #2a2a3a; border-radius: 6px;
        color: #999; padding: 6px 14px; font-size: 12px; cursor: pointer;
        transition: color 0.15s, border-color 0.15s; backdrop-filter: blur(4px);
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
    backBtn.addEventListener('click', () => { navigateTo('/'); });
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
