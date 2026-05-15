import type { I18nextToolkitConfig, Logger } from './types';
/**
 * Generates TypeScript type definitions for i18next translations.
 *
 * This function:
 * 1. Reads translation files based on the input glob patterns
 * 2. Generates TypeScript interfaces using i18next-resources-for-ts
 * 3. Creates separate resources.d.ts and main i18next.d.ts files
 * 4. Handles namespace detection from filenames
 * 5. Supports type-safe selector API when enabled
 *
 * @param config - The i18next toolkit configuration object
 *
 * @example
 * ```typescript
 * // Configuration
 * const config = {
 *   types: {
 *     input: ['locales/en/*.json'],
 *     output: 'src/types/i18next.d.ts',
 *     enableSelector: true
 *   }
 * }
 *
 * await runTypesGenerator(config)
 * ```
 */
export declare function runTypesGenerator(config: I18nextToolkitConfig, options?: {
    quiet?: boolean;
    logger?: Logger;
}): Promise<void>;
//# sourceMappingURL=types-generator.d.ts.map