import { EventEmitter } from 'node:events';
import type { I18nextToolkitConfig, Logger } from './types';
type LinterEventMap = {
    progress: [
        {
            message: string;
        }
    ];
    done: [
        {
            success: boolean;
            message: string;
            files: Record<string, HardcodedString[]>;
        }
    ];
    error: [error: Error];
};
export declare const recommendedAcceptedTags: string[];
export declare const recommendedAcceptedAttributes: string[];
export declare class Linter extends EventEmitter<LinterEventMap> {
    private config;
    constructor(config: I18nextToolkitConfig);
    wrapError(error: unknown): Error;
    run(): Promise<{
        success: boolean;
        message: string;
        files: {
            [k: string]: HardcodedString[];
        };
    }>;
}
/**
 * Runs the i18next linter to detect hardcoded strings and other potential issues.
 *
 * This function performs static analysis on source files to identify:
 * - Hardcoded text strings in JSX elements
 * - Hardcoded strings in JSX attributes (like alt text, titles, etc.)
 * - Text that should be extracted for translation
 *
 * The linter respects configuration settings:
 * - Uses the same input patterns as the extractor
 * - Ignores content inside configured Trans components
 * - Skips technical content like script/style tags
 * - Identifies numeric values and interpolation syntax to avoid false positives
 *
 * @param config - The toolkit configuration with input patterns and component names
 *
 * @example
 * ```typescript
 * const config = {
 *   extract: {
 *     input: ['src/**\/*.{ts,tsx}'],
 *     transComponents: ['Trans', 'Translation']
 *   }
 * }
 *
 * await runLinter(config)
 * // Outputs issues found or success message
 * ```
 */
export declare function runLinter(config: I18nextToolkitConfig): Promise<{
    success: boolean;
    message: string;
    files: {
        [k: string]: HardcodedString[];
    };
}>;
export declare function runLinterCli(config: I18nextToolkitConfig, options?: {
    quiet?: boolean;
    logger?: Logger;
}): Promise<void>;
/**
 * Represents a found hardcoded string or interpolation parameter error with its location information.
 */
interface HardcodedString {
    /** The hardcoded text content or error message */
    text: string;
    /** Line number where the string or error was found */
    line: number;
    /** The type of issue: 'hardcoded' for hardcoded strings, 'interpolation' for interpolation parameter errors */
    type?: 'hardcoded' | 'interpolation';
}
export {};
//# sourceMappingURL=linter.d.ts.map