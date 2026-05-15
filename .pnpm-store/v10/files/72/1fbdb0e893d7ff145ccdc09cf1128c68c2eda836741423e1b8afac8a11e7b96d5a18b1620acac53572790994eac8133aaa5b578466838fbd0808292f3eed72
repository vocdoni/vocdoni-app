import type { JSXElement } from '@swc/core';
import type { PluginContext, I18nextToolkitConfig } from '../../types';
import { ExpressionResolver } from './expression-resolver';
export declare class JSXHandler {
    private config;
    private pluginContext;
    private expressionResolver;
    private getCurrentFile;
    private getCurrentCode;
    constructor(config: Omit<I18nextToolkitConfig, 'plugins'>, pluginContext: PluginContext, expressionResolver: ExpressionResolver, getCurrentFile: () => string, getCurrentCode: () => string);
    /**
     * Computes line and column from a node's normalised span.
     * SWC spans are normalised to file-relative offsets after parsing,
     * so we can use them directly.
     */
    private getLocationFromNode;
    /**
     * Processes JSX elements to extract translation keys from Trans components.
     *
     * Identifies configured Trans components and delegates to the JSX parser
     * for complex children serialization and attribute extraction.
     *
     * @param node - JSX element node to process
     * @param getScopeInfo - Function to retrieve scope information for variables
     */
    handleJSXElement(node: JSXElement, getScopeInfo: (name: string) => {
        defaultNs?: string;
        keyPrefix?: string;
    } | undefined): void;
    /**
     * Generates plural keys for Trans components, with support for tOptions plural defaults.
     *
     * @param key - Base key name for pluralization
     * @param defaultValue - Default value for the keys
     * @param ns - Namespace for the keys
     * @param isOrdinal - Whether to generate ordinal plural forms
     * @param optionsNode - Optional tOptions object expression for plural-specific defaults
     * @param explicitDefaultFromSource - Whether the default was explicitly provided
     * @param locations - Source location information for this key
     * @param keyAcceptingContext - The base key that accepts context (if this is a context variant)
     */
    private generatePluralKeysForTrans;
    /**
     * Extracts element name from JSX opening tag.
     *
     * Handles both simple identifiers and member expressions:
     * - `<Trans>` → 'Trans'
     * - `<React.Trans>` → 'React.Trans'
     *
     * @param node - JSX element node
     * @returns Element name or undefined if not extractable
     */
    private getElementName;
}
//# sourceMappingURL=jsx-handler.d.ts.map