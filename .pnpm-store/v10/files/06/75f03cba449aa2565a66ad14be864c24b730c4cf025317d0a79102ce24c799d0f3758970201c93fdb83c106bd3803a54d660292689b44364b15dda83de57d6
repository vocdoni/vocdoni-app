import { type Dict } from "../utils";
export interface UseBreakpointOptions {
    fallback?: string | undefined;
    ssr?: boolean | undefined;
    getWindow?: () => typeof window | undefined;
    breakpoints?: string[] | undefined;
}
export declare function useBreakpoint(options?: UseBreakpointOptions): string;
export type UseBreakpointValueOptions = Omit<UseBreakpointOptions, "breakpoints">;
type Value<T> = Dict<T> | Array<T | null>;
export declare function useBreakpointValue<T = any>(value: Value<T>, opts?: UseBreakpointValueOptions): T | undefined;
export {};
