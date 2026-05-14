import type { I18nextToolkitConfig, Logger, RenameKeyResult } from './types';
/**
 * Renames a translation key across all source files and translation files.
 *
 * This function performs a comprehensive key rename operation:
 * 1. Validates the old and new key names
 * 2. Checks for conflicts in translation files
 * 3. Updates all occurrences in source code (AST-based)
 * 4. Updates all translation files for all locales
 * 5. Preserves the original translation values
 *
 * @param config - The i18next toolkit configuration
 * @param oldKey - The current key to rename (may include namespace prefix)
 * @param newKey - The new key name (may include namespace prefix)
 * @param options - Rename options (dry-run mode, etc.)
 * @param logger - Logger instance for output
 * @returns Result object with update status and file lists
 *
 * @example
 * ```typescript
 * // Basic rename
 * const result = await runRenameKey(config, 'old.key', 'new.key')
 *
 * // With namespace
 * const result = await runRenameKey(config, 'common:button.submit', 'common:button.save')
 *
 * // Dry run to preview changes
 * const result = await runRenameKey(config, 'old.key', 'new.key', { dryRun: true })
 * ```
 */
export declare function runRenameKey(config: I18nextToolkitConfig, oldKey: string, newKey: string, options?: {
    dryRun?: boolean;
}, logger?: Logger): Promise<RenameKeyResult>;
//# sourceMappingURL=rename-key.d.ts.map