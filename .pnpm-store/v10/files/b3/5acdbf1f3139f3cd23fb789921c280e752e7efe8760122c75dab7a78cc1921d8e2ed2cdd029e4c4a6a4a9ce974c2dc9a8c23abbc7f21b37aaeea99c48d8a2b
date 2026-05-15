export { useHydrated };
/**
 * Whether the page has already been hydrated.
 *
 * On the server, it always returns `false`. On the client, it returns `false` on first render and `true` after hydration completes.
 *
 * https://vike.dev/useHydrated
 *
 * Example: Disable a button that needs JavaScript to work.
 * ```tsx
 * const hydrated = useHydrated()
 * return (
 *   <button type="button" disabled={!hydrated} onClick={doSomething}>
 *     Click me
 *   </button>
 * );
 * ```
 */
declare function useHydrated(): boolean;
