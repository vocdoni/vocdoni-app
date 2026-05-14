import type { CallExpression } from '@swc/core';
import type { PluginContext, I18nextToolkitConfig, Logger, ScopeInfo } from '../../types';
import { ExpressionResolver } from './expression-resolver';
export declare class CallExpressionHandler {
    private pluginContext;
    private config;
    private logger;
    private expressionResolver;
    objectKeys: Set<string>;
    private getCurrentFile;
    private getCurrentCode;
    constructor(config: Omit<I18nextToolkitConfig, 'plugins'>, pluginContext: PluginContext, logger: Logger, expressionResolver: ExpressionResolver, getCurrentFile: () => string, getCurrentCode: () => string);
    /**
     * Computes line and column from a node's normalised span.
     * For call / new expressions the location points to the first argument
     * (the translation key) rather than the callee, matching the previous
     * string-search behaviour.
     */
    private getLocationFromNode;
    /**
     * Processes function call expressions and new expressions to extract translation keys.
     *
     * This is the core extraction method that handles:
     * - Standard t() calls with string literals
     * - NewExpression calls like new TranslatedError(...)
     * - Selector API calls with arrow functions: `t($ => $.path.to.key)`
     * - Namespace resolution from multiple sources
     * - Default value extraction from various argument patterns
     * - Pluralization and context handling
     * - Key prefix application from scope
     *
     * @param node - Call expression or new expression node to process
     * @param getScopeInfo - Function to retrieve scope information for variables
     */
    handleCallExpression(node: CallExpression, getScopeInfo: (name: string) => ScopeInfo | undefined): void;
    /**
     * Scans a string for nested translations like $t(key, options) and extracts them.
     */
    private extractNestedKeys;
    private processNestedContent;
    private generateNestedPluralKeys;
    /**
     * Processed a call expression to extract keys from the specified argument.
     *
     * @param node - The call expression node
     * @param argIndex - The index of the argument to process
     * @returns An object containing the keys to process and a flag indicating if the selector API is used
     */
    private handleCallExpressionArgument;
    /**
     * Extracts translation key from selector API arrow function.
     *
     * Processes selector expressions like:
     * - `$ => $.path.to.key` → 'path.to.key'
     * - `$ => $.app['title'].main` → 'app.title.main'
     * - `$ => { return $.nested.key; }` → 'nested.key'
     *
     * Handles both dot notation and bracket notation, respecting
     * the configured key separator or flat key structure.
     *
     * @param node - Arrow function expression from selector call
     * @returns Extracted key path or null if not statically analyzable
     */
    private extractKeyFromSelector;
    /**
     * Generates plural form keys based on the primary language's plural rules.
     *
     * Uses Intl.PluralRules to determine the correct plural categories
     * for the configured primary language and generates suffixed keys
     * for each category (e.g., 'item_one', 'item_other').
     *
     * @param key - Base key name for pluralization
     * @param ns - Namespace for the keys
     * @param options - object expression options
     * @param isOrdinal - isOrdinal flag
     */
    private handlePluralKeys;
    /**
     * Serializes a callee node (Identifier or MemberExpression) into a string.
     *
     * Produces a dotted name for simple callees that can be used for scope lookups
     * or configuration matching.
     *
     * @param callee - The CallExpression callee node to serialize
     * @returns A dotted string name for supported callees, or null when the callee
     *          is a computed/unsupported expression.
     */
    private getFunctionName;
}
//# sourceMappingURL=call-expression-handler.d.ts.map