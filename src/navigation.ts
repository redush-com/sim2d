/**
 * Navigates to a path using the History API without a full page reload.
 * Extracted into its own module to avoid circular dependencies between
 * the router and UI/simulation modules that need programmatic navigation.
 * @param path - the URL path to navigate to (e.g. '/sim/boids')
 */
export function navigateTo(path: string): void {
	history.pushState(null, '', path);
	window.dispatchEvent(new PopStateEvent('popstate'));
}
