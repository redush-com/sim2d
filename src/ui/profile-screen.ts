import { authStore } from '../auth/auth-store';
import { signOut } from '../auth/auth-service';
import { getUserSimulations, deleteSimulation, type SavedSimulation } from '../db/saved-simulations';
import { createShareLink, buildShareUrl } from '../db/shared-links';

/**
 * Renders the user profile screen with saved simulations list.
 * @param container - DOM element to render into
 */
export function renderProfileScreen(container: HTMLElement): void {
  container.innerHTML = '';
  container.appendChild(createProfileStyles());

  const wrapper = document.createElement('div');
  wrapper.className = 'profile-wrapper';

  const { user } = authStore.getState();
  if (!user) return;

  wrapper.appendChild(buildHeader(user));

  const sectionTitle = document.createElement('div');
  sectionTitle.className = 'profile-section-title';
  sectionTitle.textContent = 'Saved Simulations';
  wrapper.appendChild(sectionTitle);

  const listContainer = document.createElement('div');
  listContainer.className = 'profile-list';
  wrapper.appendChild(listContainer);

  container.appendChild(wrapper);

  loadSimulations(listContainer);
}

/**
 * Loads and renders the list of saved simulations.
 * @param container - list container element
 */
async function loadSimulations(container: HTMLElement): Promise<void> {
  container.innerHTML = '<div class="profile-loading">Loading...</div>';

  const sims = await getUserSimulations();

  if (sims.length === 0) {
    container.innerHTML = '<div class="profile-empty">No saved simulations yet. Run a simulation and click Save to keep your configuration.</div>';
    return;
  }

  container.innerHTML = '';
  for (const sim of sims) {
    container.appendChild(createSimCard(sim, container));
  }
}

/**
 * Creates a card for a saved simulation with load, share, and delete actions.
 * @param sim - saved simulation data
 * @param listContainer - parent list for refresh after delete
 * @returns card DOM element
 */
function createSimCard(sim: SavedSimulation, listContainer: HTMLElement): HTMLElement {
  const card = document.createElement('div');
  card.className = 'saved-sim-card';

  const info = document.createElement('div');
  info.className = 'saved-sim-info';

  const titleRow = document.createElement('div');
  titleRow.className = 'saved-sim-title-row';
  const title = document.createElement('span');
  title.className = 'saved-sim-title';
  title.textContent = sim.title;
  const type = document.createElement('span');
  type.className = 'saved-sim-type';
  type.textContent = sim.sim_type === 'custom' ? 'Custom' : sim.builtin_id || 'Built-in';
  titleRow.appendChild(title);
  titleRow.appendChild(type);

  const date = document.createElement('div');
  date.className = 'saved-sim-date';
  date.textContent = new Date(sim.updated_at).toLocaleDateString();

  info.appendChild(titleRow);
  info.appendChild(date);

  const actions = document.createElement('div');
  actions.className = 'saved-sim-actions';

  const loadBtn = document.createElement('button');
  loadBtn.className = 'saved-sim-btn';
  loadBtn.textContent = 'Load';
  loadBtn.addEventListener('click', () => {
    if (sim.sim_type === 'custom') {
      window.location.hash = `#/editor/${sim.id}`;
    } else {
      window.location.hash = `#/sim/${sim.builtin_id}`;
    }
  });

  const shareBtn = document.createElement('button');
  shareBtn.className = 'saved-sim-btn';
  shareBtn.textContent = 'Share';
  shareBtn.addEventListener('click', async () => {
    const link = await createShareLink(sim.id);
    if (link) {
      const url = buildShareUrl(link.share_token);
      await navigator.clipboard.writeText(url);
      shareBtn.textContent = 'Copied!';
      setTimeout(() => { shareBtn.textContent = 'Share'; }, 2000);
    }
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'saved-sim-btn saved-sim-btn-danger';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', async () => {
    if (await deleteSimulation(sim.id)) {
      loadSimulations(listContainer);
    }
  });

  actions.appendChild(loadBtn);
  actions.appendChild(shareBtn);
  actions.appendChild(deleteBtn);

  card.appendChild(info);
  card.appendChild(actions);
  return card;
}

/**
 * Builds the profile header with avatar, name, and sign-out button.
 * @param user - Supabase auth user
 * @returns header DOM element
 */
function buildHeader(user: { email?: string; user_metadata?: Record<string, unknown> }): HTMLElement {
  const header = document.createElement('div');
  header.className = 'profile-header';

  const avatar = document.createElement('img');
  avatar.className = 'profile-avatar';
  avatar.src = (user.user_metadata?.['avatar_url'] as string) || '';
  avatar.onerror = () => { avatar.style.display = 'none'; };

  const info = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'profile-name';
  name.textContent = (user.user_metadata?.['full_name'] as string) || user.email || 'User';
  const email = document.createElement('div');
  email.className = 'profile-email';
  email.textContent = user.email || '';
  info.appendChild(name);
  info.appendChild(email);

  const signOutBtn = document.createElement('button');
  signOutBtn.className = 'profile-signout';
  signOutBtn.textContent = 'Sign Out';
  signOutBtn.addEventListener('click', async () => {
    await signOut();
    window.location.hash = '#/';
  });

  header.appendChild(avatar);
  header.appendChild(info);
  header.appendChild(signOutBtn);
  return header;
}

/**
 * Creates the profile screen stylesheet.
 * @returns style element
 */
function createProfileStyles(): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = `
    .profile-wrapper { max-width: 700px; margin: 40px auto; padding: 0 24px; }
    .profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .profile-avatar { width: 48px; height: 48px; border-radius: 50%; border: 2px solid #2a2a3a; }
    .profile-name { font-size: 20px; font-weight: 600; color: #e0e0e8; }
    .profile-email { font-size: 12px; color: #666; }
    .profile-signout {
      margin-left: auto; padding: 6px 16px; border: 1px solid #2a2a3a;
      border-radius: 6px; background: #14141e; color: #999; font-size: 12px;
      cursor: pointer; transition: all 0.15s;
    }
    .profile-signout:hover { border-color: #4a4a60; color: #ddd; }
    .profile-section-title {
      font-size: 14px; font-weight: 600; color: #999;
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;
    }
    .profile-loading { font-size: 13px; color: #555; padding: 24px; text-align: center; }
    .profile-empty { font-size: 13px; color: #555; padding: 24px; text-align: center; }
    .saved-sim-card {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; background: #12121a; border: 1px solid #1e1e2a;
      border-radius: 8px; margin-bottom: 8px;
    }
    .saved-sim-info { flex: 1; }
    .saved-sim-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .saved-sim-title { font-size: 14px; color: #c0c0cc; }
    .saved-sim-type { font-size: 11px; color: #5588ff; background: rgba(85,136,255,0.08); padding: 1px 6px; border-radius: 3px; }
    .saved-sim-date { font-size: 11px; color: #555; }
    .saved-sim-actions { display: flex; gap: 6px; }
    .saved-sim-btn {
      padding: 5px 12px; border: 1px solid #2a2a3a; border-radius: 5px;
      background: #14141e; color: #888; font-size: 11px; cursor: pointer;
      transition: all 0.15s;
    }
    .saved-sim-btn:hover { border-color: #4a4a60; color: #ccc; }
    .saved-sim-btn-danger:hover { border-color: #5a2a2a; color: #cc6666; }
  `;
  return style;
}
