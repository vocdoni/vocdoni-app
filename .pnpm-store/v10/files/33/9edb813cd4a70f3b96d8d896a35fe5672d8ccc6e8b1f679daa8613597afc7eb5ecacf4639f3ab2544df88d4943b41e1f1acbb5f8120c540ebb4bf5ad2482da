interface TranslationOptions {
    rawKeyIfTranslationMissing?: boolean;
}
type GenericTranslationObject = Record<string, any>;
export declare class I18n {
    listeners: Set<() => void>;
    defaultLocale: string;
    enableFallback: boolean;
    locale: string;
    private cachedLocales;
    translations: GenericTranslationObject;
    constructor(localeTranslations: Record<string, GenericTranslationObject>);
    private missingMessage;
    private flattenTranslation;
    private translateWithReplacements;
    t(key: string, replacements?: Record<string, string>, options?: TranslationOptions): string;
    isLocaleCached(locale: string): boolean;
    updateLocale(locale: string): void;
    setTranslations(locale: string, translations: GenericTranslationObject): void;
    private notifyListeners;
    onChange(fn: () => void): () => void;
}
export {};
