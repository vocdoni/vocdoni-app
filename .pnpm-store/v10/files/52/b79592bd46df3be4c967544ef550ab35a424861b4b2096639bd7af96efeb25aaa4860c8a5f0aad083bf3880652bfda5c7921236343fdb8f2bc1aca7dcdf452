import type { I18nextToolkitConfig } from '../types';
/**
 * Validates the extractor configuration to ensure required fields are present and properly formatted.
 *
 * This function performs the following validations:
 * - Ensures extract.input is specified and non-empty
 * - Ensures extract.output is specified
 * - Ensures locales array is specified and non-empty
 * - Ensures extract.output contains the required {{language}} placeholder
 *
 * @param config - The i18next toolkit configuration object to validate
 *
 * @throws {ExtractorError} When any validation rule fails
 *
 * @example
 * ```typescript
 * try {
 *   validateExtractorConfig(config)
 *   console.log('Configuration is valid')
 * } catch (error) {
 *   console.error('Invalid configuration:', error.message)
 * }
 * ```
 */
export declare function validateExtractorConfig(config: I18nextToolkitConfig): void;
/**
 * Custom error class for extraction-related errors.
 * Provides additional context like file path and underlying cause.
 *
 * @example
 * ```typescript
 * throw new ExtractorError('Failed to parse file', 'src/component.tsx', syntaxError)
 * ```
 */
export declare class ExtractorError extends Error {
    readonly file?: string | undefined;
    readonly cause?: Error | undefined;
    /**
     * Creates a new ExtractorError with optional file context and cause.
     *
     * @param message - The error message
     * @param file - Optional file path where the error occurred
     * @param cause - Optional underlying error that caused this error
     */
    constructor(message: string, file?: string | undefined, cause?: Error | undefined);
}
//# sourceMappingURL=validation.d.ts.map