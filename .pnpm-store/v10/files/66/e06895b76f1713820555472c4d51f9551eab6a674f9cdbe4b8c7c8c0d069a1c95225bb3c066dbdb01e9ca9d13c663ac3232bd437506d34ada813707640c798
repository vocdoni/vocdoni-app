import type { Expression, JSXElement, ObjectExpression } from '@swc/core';
import type { I18nextToolkitConfig } from '../../types';
export interface ExtractedJSXAttributes {
    /** holds the raw key expression from the AST */
    keyExpression?: Expression;
    /** holds the serialized JSX children from the AST */
    serializedChildren: string;
    /** Default value to use in the primary language */
    defaultValue?: string;
    /** Namespace this key belongs to (if defined on <Trans />) */
    ns?: string;
    /** Whether this key is used with pluralization (count parameter) */
    hasCount?: boolean;
    /** Whether this key is used with ordinal pluralization */
    isOrdinal?: boolean;
    /** AST node for options object, used for advanced plural handling in Trans */
    optionsNode?: ObjectExpression;
    /** hold the raw context expression from the AST */
    contextExpression?: Expression;
    /** Whether the defaultValue was explicitly provided on the <Trans /> (defaults prop or tOptions defaultValue*) */
    explicitDefault?: boolean;
}
/**
 * Extracts translation keys from JSX Trans components.
 *
 * This function handles various Trans component patterns:
 * - Explicit i18nKey prop: `<Trans i18nKey="my.key">content</Trans>`
 * - Implicit keys from children: `<Trans>Hello World</Trans>`
 * - Namespace specification: `<Trans ns="common">content</Trans>`
 * - Default values: `<Trans defaults="Default text">content</Trans>`
 * - Pluralization: `<Trans count={count}>content</Trans>`
 * - HTML preservation: `<Trans>Hello <strong>world</strong></Trans>`
 *
 * @param node - The JSX element node to process
 * @param config - The toolkit configuration containing extraction settings
 * @returns Extracted key information or null if no valid key found
 *
 * @example
 * ```typescript
 * // Input JSX:
 * // <Trans i18nKey="welcome.title" ns="home" defaults="Welcome!">
 * //   Welcome to our <strong>amazing</strong> app!
 * // </Trans>
 *
 * const result = extractFromTransComponent(jsxNode, config)
 * // Returns: {
 * //   key: 'welcome.title',
 * //   keyExpression: { ... },
 * //   ns: 'home',
 * //   defaultValue: 'Welcome!',
 * //   hasCount: false
 * // }
 * ```
 */
export declare function extractFromTransComponent(node: JSXElement, config: I18nextToolkitConfig): ExtractedJSXAttributes | null;
//# sourceMappingURL=jsx-parser.d.ts.map