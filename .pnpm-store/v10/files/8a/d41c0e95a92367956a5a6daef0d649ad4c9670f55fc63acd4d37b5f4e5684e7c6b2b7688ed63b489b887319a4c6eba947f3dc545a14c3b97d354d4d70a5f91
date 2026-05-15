import type { CodeBlockAdapter } from "./types";
export declare const plainTextAdapter: CodeBlockAdapter;
interface ShikiHighlighterBase {
    codeToHtml: (code: string, options: any) => string;
    dispose?: () => void;
}
type ShikiHighlighterBaseOptions<T extends ShikiHighlighterBase> = Parameters<T["codeToHtml"]>[1];
export interface ShikiAdapterOptions<T extends ShikiHighlighterBase> {
    load: () => Promise<T>;
    loadSync?: () => T;
    highlightOptions?: ShikiHighlighterBaseOptions<T>;
    theme: string | Record<string, string>;
}
export declare function createShikiAdapter<T extends ShikiHighlighterBase>(opts: ShikiAdapterOptions<T>): CodeBlockAdapter;
interface HighlightJsHighlightResult {
    value: string;
}
interface HighlightJsHighlighterBase {
    highlight: (...args: any[]) => HighlightJsHighlightResult;
    listLanguages: () => string[];
    unregisterLanguage: (language: string) => void;
}
interface HighlightJsHighlighterBaseOptions {
    language: string;
    ignoreIllegals?: boolean;
}
export interface HighlightJsAdapterOptions<T extends HighlightJsHighlighterBase> {
    load: () => Promise<T>;
    loadSync?: () => T;
    highlightOptions?: HighlightJsHighlighterBaseOptions;
}
export declare function createHighlightJsAdapter<T extends HighlightJsHighlighterBase>(opts: HighlightJsAdapterOptions<T>): CodeBlockAdapter;
export {};
