import type { User, Session } from '@supabase/supabase-js';

/** Auth state containing current user and session */
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

type Listener = (state: AuthState) => void;

/**
 * Simple observable store for authentication state.
 * Components subscribe to receive auth state changes.
 */
class AuthStore {
  private state: AuthState = { user: null, session: null, loading: true };
  private listeners: Set<Listener> = new Set();

  /** @returns current auth state snapshot */
  getState(): AuthState {
    return this.state;
  }

  /**
   * Updates the auth state and notifies all subscribers.
   * @param partial - partial state to merge
   */
  setState(partial: Partial<AuthState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((fn) => fn(this.state));
  }

  /**
   * Subscribes to auth state changes.
   * @param fn - callback invoked with new state on each change
   * @returns unsubscribe function
   */
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }
}

export const authStore = new AuthStore();
