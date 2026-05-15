/**
 * Migrates a legacy i18next-parser configuration file to the new
 * i18next-cli configuration format.
 *
 * This function:
 * 1. Checks if a legacy config file exists (supports .js, .mjs, .cjs, .ts)
 * 2. Prevents migration if any new config file already exists
 * 3. Dynamically imports the old configuration using appropriate loader
 * 4. Maps old configuration properties to new format:
 *    - `$LOCALE` → `{{language}}`
 *    - `$NAMESPACE` → `{{namespace}}`
 *    - Maps lexer functions and components
 *    - Creates sensible defaults for new features
 * 5. Generates a new TypeScript configuration file
 * 6. Provides warnings for deprecated features
 *
 * @param customConfigPath - Optional custom path to the legacy config file
 *
 * @example
 * ```bash
 * # Migrate default config
 * npx i18next-cli migrate-config
 *
 * # Migrate custom config with extension
 * npx i18next-cli migrate-config i18next-parser.config.mjs
 *
 * # Migrate custom config without extension (will try .js, .mjs, .cjs, .ts)
 * npx i18next-cli migrate-config my-custom-config
 * ```
 */
export declare function runMigrator(customConfigPath?: string): Promise<void>;
//# sourceMappingURL=migrator.d.ts.map