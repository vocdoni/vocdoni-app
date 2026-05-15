import type { Logger, I18nextToolkitConfig, Plugin, PluginContext } from '../../types';
import { ASTVisitors } from './ast-visitors';
/**
 * Main extractor function that runs the complete key extraction and file generation process.
 *
 * This is the primary entry point that:
 * 1. Validates configuration
 * 2. Sets up default sync options
 * 3. Finds all translation keys across source files
 * 4. Generates/updates translation files for all locales
 * 5. Provides progress feedback via spinner
 * 6. Returns whether any files were updated
 *
 * @param config - The i18next toolkit configuration object
 * @param logger - Logger instance for output (defaults to ConsoleLogger)
 * @returns Promise resolving to boolean indicating if any files were updated
 *
 * @throws {ExtractorError} When configuration validation fails or extraction process encounters errors
 *
 * @example
 * ```typescript
 * const config = await loadConfig()
 * const updated = await runExtractor(config)
 * if (updated) {
 *   console.log('Translation files were updated')
 * }
 * ```
 */
export declare function runExtractor(config: I18nextToolkitConfig, options?: {
    isWatchMode?: boolean;
    isDryRun?: boolean;
    syncPrimaryWithDefaults?: boolean;
    syncAll?: boolean;
    quiet?: boolean;
    logger?: Logger;
}): Promise<boolean>;
/**
 * Processes an individual source file for translation key extraction.
 *
 * This function:
 * 1. Reads the source file
 * 2. Runs plugin onLoad hooks for code transformation
 * 3. Parses the code into an Abstract Syntax Tree (AST) using SWC
 * 4. Extracts keys from comments using regex patterns
 * 5. Traverses the AST using visitors to find translation calls
 * 6. Runs plugin onVisitNode hooks for custom extraction logic
 *
 * @param file - Path to the source file to process
 * @param config - The i18next toolkit configuration object
 * @param logger - Logger instance for output
 * @param allKeys - Map to accumulate found translation keys
 *
 * @throws {ExtractorError} When file processing fails
 *
 * @internal
 */
export declare function processFile(file: string, plugins: Plugin[], astVisitors: ASTVisitors, pluginContext: PluginContext, config: Omit<I18nextToolkitConfig, 'plugins'>, logger?: Logger): Promise<void>;
/**
 * Simplified extraction function that returns translation results without file writing.
 * Used primarily for testing and programmatic access.
 *
 * @param config - The i18next toolkit configuration object
 * @returns Promise resolving to array of translation results
 *
 * @example
 * ```typescript
 * const results = await extract(config)
 * for (const result of results) {
 *   console.log(`${result.path}: ${result.updated ? 'Updated' : 'No changes'}`)
 * }
 * ```
 */
export declare function extract(config: I18nextToolkitConfig, { syncPrimaryWithDefaults }?: {
    syncPrimaryWithDefaults?: boolean;
}): Promise<import("../../types").TranslationResult[]>;
//# sourceMappingURL=extractor.d.ts.map