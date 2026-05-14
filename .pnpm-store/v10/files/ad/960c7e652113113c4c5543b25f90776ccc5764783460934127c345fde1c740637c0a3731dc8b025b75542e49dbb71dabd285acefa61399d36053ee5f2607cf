import type { KnownConfig } from "./types";
export declare const getErrorString: (errorCode: string | undefined) => string;
/**
 * An alternative to Object.fromEntries that allows duplicate keys and converts the values corresponding to them in an array
 *
 * NOTE: This is a duplicate of the function in @calcom/lib/hooks/useRouterQuery.ts. It has to be here because embed is published to npm and shouldn't refer to any private package
 */
export declare function fromEntriesWithDuplicateKeys(entries: IterableIterator<[string, string]> | null): Record<string, string | string[]>;
export declare function getConfigProp<TProp extends keyof KnownConfig>(config: KnownConfig, prop: TProp): NonNullable<KnownConfig[TProp]> | null;
export declare function getQueryParamProvidedByConfig<TProp extends keyof KnownConfig>(queryParam: TProp): NonNullable<KnownConfig[TProp]> | null;
export declare function generateDataAttributes(props: Record<string, string | null | undefined>): string;
//# sourceMappingURL=utils.d.ts.map