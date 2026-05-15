export { applyStaticReplace };
export type { StaticReplace };
import '../../assertEnvVite.js';
/**
 * Condition to match an argument value.
 * - string starting with 'import:' matches an imported identifier
 * - { prop, equals } matches a property value inside an object argument
 * - { call, args } matches a call expression with specific arguments
 * - { member, object, property } matches a member expression like $setup["ClientOnly"]
 */
type ArgCondition = string | {
    prop: string;
    equals: unknown;
} | {
    call: string;
    args?: Record<number, ArgCondition>;
} | {
    member: true;
    object: string;
    property: string | ArgCondition;
};
/**
 * Target for replace operation.
 */
type ReplaceTarget = {
    with: unknown;
} | {
    arg: number;
    prop: string;
    with: unknown;
} | {
    arg: number;
    with: unknown;
} | {
    argsFrom: number;
    with: unknown;
};
/**
 * Target for remove operation.
 */
type RemoveTarget = {
    arg: number;
    prop: string;
} | {
    arg: number;
} | {
    argsFrom: number;
};
/**
 * Rule for static replacement/removal.
 *
 * @example
 * // jsx/jsxs/jsxDEV: replace children prop with null
 * {
 *   env: 'server',
 *   type: 'call',
 *   match: {
 *     function: ['jsx', 'jsxs', 'jsxDEV'],
 *     args: { 0: 'import:vike-react/ClientOnly:ClientOnly' }
 *   },
 *   replace: { arg: 1, prop: 'children', with: null }
 * }
 *
 * @example
 * // createElement: remove all children (args from index 2)
 * {
 *   env: 'server',
 *   type: 'call',
 *   match: {
 *     function: 'createElement',
 *     args: { 0: 'import:vike-react/ClientOnly:ClientOnly' }
 *   },
 *   remove: { argsFrom: 2 }
 * }
 *
 * @example
 * // ssrRenderComponent: match nested call expression and remove default slot
 * {
 *   env: 'server',
 *   type: 'call',
 *   match: {
 *     function: 'import:vue/server-renderer:ssrRenderComponent',
 *     args: {
 *       0: {
 *         call: 'import:vue:unref',
 *         args: { 0: 'import:vike-vue/ClientOnly:ClientOnly' }
 *       }
 *     }
 *   },
 *   remove: { arg: 2, prop: 'default' }
 * }
 */
type StaticReplace = {
    /** Environment filter: 'client' = client only, 'server' = everything except client */
    env: 'server' | 'client';
    /** Rolldown filter — MUST be narrowing as much as possible, otherwise you'll get significant performance degradation */
    filter: string;
    /** Type of transformation - currently only 'call' is supported, but can be extended in the future */
    type: 'call';
    /** Match criteria */
    match: {
        /**
         * Function name(s) to match.
         * - Plain string: matches function name directly (e.g., 'jsx')
         * - Import string: 'import:importPath:exportName' (e.g., 'import:react/jsx-runtime:jsx')
         */
        function: string | string[];
        /** Conditions on arguments: index -> condition */
        args?: Record<number, ArgCondition>;
    };
    /** Replace target (optional) */
    replace?: ReplaceTarget;
    /** Remove target (optional) */
    remove?: RemoveTarget;
};
declare function applyStaticReplace(code: string, staticReplaceList: StaticReplace[], id: string, env: 'server' | 'client'): Promise<{
    code: string;
    map: {
        version: number;
        sources: string[];
        names: string[];
        sourceRoot?: string | undefined;
        sourcesContent?: string[] | undefined;
        mappings: string;
        file: string;
    } | null | undefined;
} | null | undefined>;
