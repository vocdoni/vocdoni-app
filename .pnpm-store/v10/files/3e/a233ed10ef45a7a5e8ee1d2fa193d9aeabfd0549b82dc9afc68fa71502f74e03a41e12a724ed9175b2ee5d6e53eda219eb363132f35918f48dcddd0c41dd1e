import { TranslationResult, ExtractedKey, I18nextToolkitConfig } from '../../types';
/**
 * Processes extracted translation keys and generates translation files for all configured locales.
 *
 * This function:
 * 1. Groups keys by namespace
 * 2. For each locale and namespace combination:
 * - Reads existing translation files
 * - Preserves keys matching `preservePatterns` and those from `objectKeys`
 * - Merges in newly extracted keys
 * - Uses primary language defaults or empty strings for secondary languages
 * - Maintains key sorting based on configuration
 * 3. Determines if files need updating by comparing content
 *
 * @param keys - Map of extracted translation keys with metadata.
 * @param objectKeys - A set of base keys that were called with the `returnObjects: true` option.
 * @param config - The i18next toolkit configuration object.
 * @returns Promise resolving to array of translation results with update status.
 *
 * @example
 * ```typescript
 * const keys = new Map([
 * ['translation:welcome', { key: 'welcome', defaultValue: 'Welcome!', ns: 'translation' }],
 * ]);
 * const objectKeys = new Set(['countries']);
 *
 * const results = await getTranslations(keys, objectKeys, config);
 * // Results contain update status and new/existing translations for each locale.
 * ```
 */
export declare function getTranslations(keys: Map<string, ExtractedKey>, objectKeys: Set<string>, config: I18nextToolkitConfig, { syncPrimaryWithDefaults, syncAll }?: {
    syncPrimaryWithDefaults?: boolean;
    syncAll?: boolean;
}): Promise<TranslationResult[]>;
//# sourceMappingURL=translation-manager.d.ts.map