import type { ExtractedKey, Logger, I18nextToolkitConfig } from '../../types';
/**
 * Main function for finding translation keys across all source files in a project.
 *
 * This function orchestrates the key extraction process:
 * 1. Processes source files based on input patterns
 * 2. Initializes and manages plugins
 * 3. Processes each file through AST parsing and key extraction
 * 4. Runs plugin lifecycle hooks
 * 5. Returns a deduplicated map of all found keys
 *
 * @param config - The i18next toolkit configuration object
 * @param logger - Logger instance for output (defaults to ConsoleLogger)
 * @returns Promise resolving to a Map of unique translation keys with metadata
 *
 * @example
 * ```typescript
 * const config = {
 *   extract: {
 *     input: ['src/**\/*.{ts,tsx}'],
 *     functions: ['t', '*.t'],
 *     transComponents: ['Trans']
 *   }
 * }
 *
 * const keys = await findKeys(config)
 * console.log(`Found ${keys.size} unique translation keys`)
 * ```
 */
export declare function findKeys(config: I18nextToolkitConfig, logger?: Logger): Promise<{
    allKeys: Map<string, ExtractedKey>;
    objectKeys: Set<string>;
}>;
//# sourceMappingURL=key-finder.d.ts.map