import type { ExtractedKey, PluginContext, I18nextToolkitConfig, Logger, Plugin } from '../types';
/**
 * Initializes an array of plugins by calling their setup hooks.
 * This function should be called before starting the extraction process.
 *
 * @param plugins - Array of plugin objects to initialize
 *
 * @example
 * ```typescript
 * const plugins = [customPlugin(), anotherPlugin()]
 * await initializePlugins(plugins)
 * // All plugin setup hooks have been called
 * ```
 */
export declare function initializePlugins(plugins: any[]): Promise<void>;
/**
 * Creates a plugin context object that provides helper methods for plugins.
 * The context allows plugins to add extracted keys to the main collection.
 *
 * @param allKeys - The main map where extracted keys are stored
 * @returns A context object with helper methods for plugins
 *
 * @example
 * ```typescript
 * const allKeys = new Map()
 * const context = createPluginContext(allKeys)
 *
 * // Plugin can now add keys
 * context.addKey({
 *   key: 'my.custom.key',
 *   defaultValue: 'Default Value',
 *   ns: 'common'
 * })
 * ```
 */
export declare function createPluginContext(allKeys: Map<string, ExtractedKey>, plugins: Plugin[], config: Omit<I18nextToolkitConfig, 'plugins'>, logger: Logger): PluginContext;
//# sourceMappingURL=plugin-manager.d.ts.map