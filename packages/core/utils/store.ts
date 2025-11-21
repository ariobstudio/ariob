/**
 * Zustand-powered Store
 *
 * Simple, fast state management using Zustand.
 * Works seamlessly with React, React Native, and LynxJS.
 *
 * Follows Convex/React Query naming patterns:
 * - `define` for creating stores (like Convex's `defineTable`)
 * - Direct selector usage (like React Query's selectors)
 *
 * @example Basic usage
 * ```typescript
 * import { define } from '@ariob/core';
 *
 * // Define a store
 * const useCountStore = define({ count: 0, user: null });
 *
 * // Use in component with selector
 * function Counter() {
 *   const count = useCountStore((s) => s.count);
 *   const increment = () => useCountStore.setState({ count: count + 1 });
 *
 *   return <button onClick={increment}>{count}</button>;
 * }
 *
 * // Or get entire state
 * function App() {
 *   const { count, user } = useCountStore();
 *   return <div>{count}</div>;
 * }
 * ```
 *
 * @example With actions (Convex pattern)
 * ```typescript
 * import { define } from '@ariob/core';
 *
 * const useAuthStore = define({
 *   user: null,
 *   isAuthenticated: false
 * });
 *
 * // Define actions separately for clarity
 * export const authActions = {
 *   login: (user) => useAuthStore.setState({ user, isAuthenticated: true }),
 *   logout: () => useAuthStore.setState({ user: null, isAuthenticated: false }),
 * };
 *
 * // Use in component
 * function LoginButton() {
 *   const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
 *
 *   return (
 *     <button onClick={() => authActions.login({ name: 'Alice' })}>
 *       {isAuthenticated ? 'Logout' : 'Login'}
 *     </button>
 *   );
 * }
 * ```
 */

import { create, StoreApi, UseBoundStore } from 'zustand';

/**
 * Store type - a Zustand store hook
 *
 * Can be used as a hook with optional selector:
 * - `const state = useStore()` - Get full state
 * - `const count = useStore((s) => s.count)` - Select specific value
 */
export type Store<T> = UseBoundStore<StoreApi<T>>;

/**
 * Create a Zustand store (internal)
 *
 * Internal function for creating Zustand stores.
 * Prefer using `define()` for public API.
 *
 * @param initialState - Initial state object
 * @returns Zustand store hook that can be used with selectors
 *
 * @example
 * ```typescript
 * const useTodoStore = store({
 *   todos: [],
 *   filter: 'all'
 * });
 *
 * // In component - select specific values
 * function TodoList() {
 *   const todos = useTodoStore((s) => s.todos);
 *   const filter = useTodoStore((s) => s.filter);
 *
 *   return <div>{todos.length} todos</div>;
 * }
 *
 * // Update state
 * function addTodo(text) {
 *   useTodoStore.setState((state) => ({
 *     todos: [...state.todos, { id: Date.now(), text }]
 *   }));
 * }
 * ```
 */
export function store<T extends object>(initialState: T): Store<T> {
  return create<T>()(() => initialState);
}

/**
 * Define a store - Convex-style naming
 *
 * Alias for `store()` that follows Convex naming conventions.
 * Use this for a more declarative, schema-like feel.
 *
 * @example
 * ```typescript
 * import { define } from '@ariob/core';
 *
 * // Define stores like you define schemas
 * const useUserStore = define({
 *   name: '',
 *   email: '',
 *   age: 0
 * });
 *
 * const useSettingsStore = define({
 *   theme: 'light',
 *   notifications: true
 * });
 *
 * // Use with selectors (auto-optimized by Zustand)
 * function Profile() {
 *   const name = useUserStore((s) => s.name);
 *   const theme = useSettingsStore((s) => s.theme);
 *
 *   return <div className={theme}>{name}</div>;
 * }
 *
 * // Update state
 * const updateName = (name) => useUserStore.setState({ name });
 * ```
 */
export const define = store;
