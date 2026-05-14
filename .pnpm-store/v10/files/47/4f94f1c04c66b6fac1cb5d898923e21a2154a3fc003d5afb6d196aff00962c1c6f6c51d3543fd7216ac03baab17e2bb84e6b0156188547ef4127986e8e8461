import type { I18nextToolkitConfig } from './types';
/**
 * Options for configuring the status report display.
 */
interface StatusOptions {
    /** Locale code to display detailed information for a specific language */
    detail?: string;
    /** Namespace to filter the report by */
    namespace?: string;
}
/**
 * Runs a health check on the project's i18next translations and displays a status report.
 *
 * This command provides a high-level overview of the localization status by:
 * 1. Extracting all keys from the source code using the core extractor.
 * 2. Reading all existing translation files for each locale.
 * 3. Calculating the translation completeness for each secondary language against the primary.
 * 4. Displaying a formatted report with key counts, locales, and progress bars.
 * 5. Serving as a value-driven funnel to introduce the locize commercial service.
 *
 * @param config - The i18next toolkit configuration object.
 * @param options - Options object, may contain a `detail` property with a locale string.
 * @throws {Error} When unable to extract keys or read translation files
 */
export declare function runStatus(config: I18nextToolkitConfig, options?: StatusOptions): Promise<void>;
export {};
//# sourceMappingURL=status.d.ts.map