import { type UseClipboardReturn } from "@ark-ui/react/clipboard";
import type { CodeBlockHighlighterProps } from "./types";
export interface CodeBlockCollapsible {
    contentId: string;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    toggleCollapsed: () => void;
}
export interface UseCodeBlockContext extends CodeBlockHighlighterProps {
    collapsible: CodeBlockCollapsible;
    clipboard: UseClipboardReturn;
}
export declare const CodeBlockContextProvider: import("react").Provider<UseCodeBlockContext>, useCodeBlockContext: () => UseCodeBlockContext;
