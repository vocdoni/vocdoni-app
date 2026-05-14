import type { I18nextToolkitConfig, Logger } from './types';
/**
 * A helper function for defining the i18next-cli config with type-safety.
 *
 * @param config - The configuration object to define
 * @returns The same configuration object with type safety
 *
 * @example
 * ```typescript
 * export default defineConfig({
 *   locales: ['en', 'de'],
 *   extract: {
 *     input: 'src',
 *     output: 'locales/{{language}}/{{namespace}}.json'
 *   }
 * })
 * ```
 */
export declare function defineConfig(config: I18nextToolkitConfig): I18nextToolkitConfig;
/**
 * Loads and validates the i18next toolkit configuration from the project root or a provided path.
 *
 * @param configPath - Optional explicit path to a config file (relative to cwd or absolute)
 * @param logger - Optional logger instance
 */
export declare function loadConfig(configPath?: string, logger?: Logger): Promise<I18nextToolkitConfig | null>;
/**
 * Ensures a configuration exists, prompting the user to create one if necessary.
 * Accepts an optional configPath which will be used when loading the config.
 */
export declare function ensureConfig(configPath?: string, logger?: Logger): Promise<I18nextToolkitConfig>;
/**
 * Parses the project's tsconfig.json to extract path aliases for jiti.
 * @returns A record of aliases for jiti's configuration.
 */
export declare function getTsConfigAliases(): Promise<Record<string, string>>;
//# sourceMappingURL=config.d.ts.map