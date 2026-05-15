/**
 * Given a prop value and state value, the useControllableProp hook is used to determine whether a component is controlled or uncontrolled, and also returns the computed value.
 *
 * @see Docs https://chakra-ui.com/docs/hooks/use-controllable#usecontrollableprop
 */
export declare function useControllableProp<T>(prop: T | undefined, state: T): [boolean, T];
export interface UseControllableStateProps<T> {
    value?: T | undefined;
    defaultValue?: T | (() => T) | undefined;
    onChange?: ((value: T) => void) | undefined;
    shouldUpdate?: ((prev: T, next: T) => boolean) | undefined;
}
/**
 * The `useControllableState` hook returns the state and function that updates the state, just like React.useState does.
 *
 * @see Docs https://chakra-ui.com/docs/hooks/use-controllable#usecontrollablestate
 */
export declare function useControllableState<T>(props: UseControllableStateProps<T>): [T, React.Dispatch<React.SetStateAction<T>>];
