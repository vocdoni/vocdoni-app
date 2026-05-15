import type { PluginContext, I18nextToolkitConfig } from '../../types';
/**
 * Extracts translation keys from comments in source code using regex patterns.
 * Supports extraction from single-line (//) and multi-line comments.
 *
 * @param code - The source code to analyze
 * @param pluginContext - Context object with helper methods to add found keys
 * @param config - Configuration object containing extraction settings
 * @param scopeResolver - Function to resolve scope information for variables (optional)
 *
 * @example
 * ```typescript
 * const code = `
 *   // t('user.name', 'User Name')
 *   /* t('app.title', { defaultValue: 'My App', ns: 'common' }) *\/
 * `
 *
 * const context = createPluginContext(allKeys)
 * extractKeysFromComments(code, context, config, scopeResolver)
 * // Extracts: user.name and app.title with their respective settings
 * ```
 */
export declare function extractKeysFromComments(code: string, pluginContext: PluginContext, config: I18nextToolkitConfig, scopeResolver?: (varName: string) => {
    defaultNs?: string;
    keyPrefix?: string;
} | undefined): void;
//# sourceMappingURL=comment-parser.d.ts.map