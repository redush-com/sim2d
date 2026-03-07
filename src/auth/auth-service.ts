import { supabase, isSupabaseConfigured } from './supabase-client';
import { authStore } from './auth-store';
import type { Provider } from '@supabase/supabase-js';

/**
 * Initializes the auth listener that syncs Supabase auth events to the store.
 * Should be called once at app startup.
 */
export function initAuth(): void {
  if (!isSupabaseConfigured()) {
    authStore.setState({ loading: false });
    return;
  }

  supabase.auth.getSession().then(({ data: { session } }) => {
    authStore.setState({
      user: session?.user ?? null,
      session,
      loading: false,
    });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    authStore.setState({
      user: session?.user ?? null,
      session,
      loading: false,
    });
  });
}

/**
 * Signs in with an OAuth provider (Google or GitHub).
 * Redirects the user to the provider's login page.
 * @param provider - OAuth provider name
 */
export async function signInWithProvider(provider: Provider): Promise<void> {
  await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin + '/' },
  });
}

/**
 * Signs the current user out and clears the session.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
