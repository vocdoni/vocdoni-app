export { clientOnly };
import { type ComponentProps, type ComponentType, type ReactNode } from 'react';
/**
 * Load and render a component only on the client-side.
 *
 * https://vike.dev/clientOnly
 */
declare function clientOnly<T extends ComponentType<any>>(load: () => Promise<{
    default: T;
} | T>): ComponentType<ComponentProps<T> & {
    fallback?: ReactNode;
}>;
