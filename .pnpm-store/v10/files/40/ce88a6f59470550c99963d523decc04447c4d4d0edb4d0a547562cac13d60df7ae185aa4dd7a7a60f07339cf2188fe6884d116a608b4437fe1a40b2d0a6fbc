declare function createCollator(locale?: string, options?: Intl.CollatorOptions): Intl.Collator;

interface FilterReturn {
    startsWith(string: string, substring: string): boolean;
    endsWith(string: string, substring: string): boolean;
    contains(string: string, substring: string): boolean;
}
interface FilterOptions extends Intl.CollatorOptions {
    locale?: string | undefined;
}
declare function createFilter(options?: FilterOptions): FilterReturn;

interface FormatBytesOptions {
    /**
     * The number of significant digits to include in the formatted output.
     * @default 3
     */
    precision?: number | undefined;
    /**
     * The unit system to use for calculations.
     * - "binary": Uses 1024 as the base (e.g., 1 KiB = 1024 bytes)
     * - "decimal": Uses 1000 as the base (e.g., 1 KB = 1000 bytes)
     * @default "decimal"
     */
    unitSystem?: "binary" | "decimal" | undefined;
    /**
     * The type of unit to format the value as.
     * - "bit": Format as bits (b)
     * - "byte": Format as bytes (B)
     * @default "byte"
     */
    unit?: "bit" | "byte" | undefined;
    /**
     * The display style for the unit.
     * - "long": Full unit name (e.g., "kilobytes")
     * - "short": Abbreviated unit (e.g., "KB")
     * - "narrow": Compact unit (e.g., "K")
     * @default "short"
     */
    unitDisplay?: "long" | "short" | "narrow" | undefined;
}
declare const formatBytes: (bytes: number, locale?: string, options?: FormatBytesOptions) => string;

/**
 * Formats a date using the given format string as defined in:
 * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 */
declare function formatDate(date: Date, format: string, locale: string, timeZone?: string): string;

declare function formatList(list: string[], locale: string, options?: Intl.ListFormatOptions): string;

declare function formatNumber(v: number, locale: string, options?: Intl.NumberFormatOptions): string;

declare function formatRelativeTime(value: Date, locale: string, options?: Intl.RelativeTimeFormatOptions): string;

declare function isRTL(locale: string): boolean;
declare function getLocaleDir(locale: string): "rtl" | "ltr";

type Direction = "rtl" | "ltr";
interface Locale {
    locale: string;
    dir: Direction;
}
declare global {
    interface Navigator {
        userLanguage?: string | undefined;
    }
}
declare function getDefaultLocale(): Locale;

interface LocaleOptions {
    locale?: string | undefined;
    getRootNode?: (() => ShadowRoot | Document | Node) | undefined;
    onLocaleChange?: ((locale: Locale) => void) | undefined;
}
declare function trackLocale(options?: LocaleOptions): () => void;

export { type FilterOptions, type FilterReturn, type FormatBytesOptions, type Locale, type LocaleOptions, createCollator, createFilter, formatBytes, formatDate, formatList, formatNumber, formatRelativeTime, getDefaultLocale, getLocaleDir, isRTL, trackLocale };
