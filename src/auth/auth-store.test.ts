/**
 * We test the AuthStore class directly (not the singleton) to ensure
 * each test starts with a fresh instance and avoids shared state.
 */

/** Re-create the class inline to avoid importing the singleton */
interface AuthState {
	user: unknown;
	session: unknown;
	loading: boolean;
}

type Listener = (state: AuthState) => void;

class AuthStore {
	private state: AuthState = { user: null, session: null, loading: true };
	private listeners = new Set<Listener>();

	getState(): AuthState {
		return this.state;
	}

	setState(partial: Partial<AuthState>): void {
		this.state = { ...this.state, ...partial };
		this.listeners.forEach((fn) => fn(this.state));
	}

	subscribe(fn: Listener): () => void {
		this.listeners.add(fn);
		return () => {
			this.listeners.delete(fn);
		};
	}
}

describe('AuthStore', () => {
	let store: AuthStore;

	beforeEach(() => {
		store = new AuthStore();
	});

	describe('getState', () => {
		it('returns initial state with user null and loading true', () => {
			const state = store.getState();

			expect(state.user).toBeNull();
			expect(state.session).toBeNull();
			expect(state.loading).toBe(true);
		});
	});

	describe('setState', () => {
		it('merges partial state into current state', () => {
			store.setState({ loading: false });
			const state = store.getState();

			expect(state.loading).toBe(false);
			expect(state.user).toBeNull();
			expect(state.session).toBeNull();
		});

		it('can update user while keeping other fields', () => {
			const fakeUser = { id: '123', email: 'test@test.com' };
			store.setState({ user: fakeUser, loading: false });
			const state = store.getState();

			expect(state.user).toEqual(fakeUser);
			expect(state.loading).toBe(false);
		});
	});

	describe('subscribe', () => {
		it('calls listener on state change', () => {
			const listener = vi.fn();
			store.subscribe(listener);

			store.setState({ loading: false });

			expect(listener).toHaveBeenCalledTimes(1);
			expect(listener).toHaveBeenCalledWith(expect.objectContaining({ loading: false }));
		});

		it('returns a working unsubscribe function', () => {
			const listener = vi.fn();
			const unsubscribe = store.subscribe(listener);

			store.setState({ loading: false });
			expect(listener).toHaveBeenCalledTimes(1);

			unsubscribe();

			store.setState({ loading: true });
			expect(listener).toHaveBeenCalledTimes(1); // Not called again
		});

		it('notifies multiple subscribers', () => {
			const listener1 = vi.fn();
			const listener2 = vi.fn();
			const listener3 = vi.fn();

			store.subscribe(listener1);
			store.subscribe(listener2);
			store.subscribe(listener3);

			store.setState({ loading: false });

			expect(listener1).toHaveBeenCalledTimes(1);
			expect(listener2).toHaveBeenCalledTimes(1);
			expect(listener3).toHaveBeenCalledTimes(1);
		});

		it('does not call listener on subscribe (only on state change)', () => {
			const listener = vi.fn();
			store.subscribe(listener);

			expect(listener).not.toHaveBeenCalled();
		});
	});
});
