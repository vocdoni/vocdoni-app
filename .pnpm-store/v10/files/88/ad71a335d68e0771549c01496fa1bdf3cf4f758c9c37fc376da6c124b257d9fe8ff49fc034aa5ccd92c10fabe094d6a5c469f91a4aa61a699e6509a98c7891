import { type Assign } from "@ark-ui/react";
import { type HTMLChakraProps, type SlotRecipeProps, type UnstyledProp } from "../../styled-system";
import { type UseCodeBlockContext } from "./code-block-context";
import type { CodeBlockColorScheme, CodeBlockHighlighterProps } from "./types";
declare const useCodeBlockStyles: () => Record<string, import("../..").SystemStyleObject>;
export { useCodeBlockStyles };
interface SharedRootProps extends CodeBlockHighlighterProps {
    /**
     * The maximum number of lines to show.
     * @default undefined
     */
    maxLines?: number | undefined;
    /**
     * The fallback color scheme for the code block.
     * @default "dark"
     */
    defaultColorScheme?: CodeBlockColorScheme | undefined;
    /**
     * The timeout for the copy action.
     * @default 1000
     */
    copyTimeout?: number | undefined;
    /**
     * The callback function that is called when the copy action is completed.
     */
    onCopy?: VoidFunction | undefined;
}
export interface CodeBlockRootBaseProps extends Assign<Omit<HTMLChakraProps<"div">, "lang" | keyof SharedRootProps>, SlotRecipeProps<"codeBlock">>, UnstyledProp, SharedRootProps {
}
export interface CodeBlockRootProps extends CodeBlockRootBaseProps {
    children: React.ReactNode;
}
export declare const CodeBlockRoot: import("react").ForwardRefExoticComponent<CodeBlockRootProps & import("react").RefAttributes<HTMLDivElement>>;
export declare const CodeBlockPropsProvider: React.Provider<CodeBlockRootBaseProps>;
export interface CodeBlockContentProps extends HTMLChakraProps<"div"> {
}
export declare const CodeBlockContent: import("react").ForwardRefExoticComponent<CodeBlockContentProps & import("react").RefAttributes<HTMLDivElement>>;
export interface CodeBlockTitleProps extends HTMLChakraProps<"div"> {
}
export declare const CodeBlockTitle: import("react").ForwardRefExoticComponent<CodeBlockTitleProps & import("react").RefAttributes<HTMLDivElement>>;
export interface CodeBlockHeaderProps extends HTMLChakraProps<"div"> {
}
export declare const CodeBlockHeader: import("react").ForwardRefExoticComponent<CodeBlockHeaderProps & import("react").RefAttributes<HTMLDivElement>>;
export interface CodeBlockCodeProps extends HTMLChakraProps<"pre"> {
}
export declare const CodeBlockCode: import("react").ForwardRefExoticComponent<CodeBlockCodeProps & import("react").RefAttributes<HTMLPreElement>>;
export interface CodeBlockCodeTextProps extends HTMLChakraProps<"code"> {
}
export declare const CodeBlockCodeText: import("react").ForwardRefExoticComponent<CodeBlockCodeTextProps & import("react").RefAttributes<HTMLElement>>;
export interface CodeBlockCopyTriggerProps extends HTMLChakraProps<"button"> {
}
export declare const CodeBlockCopyTrigger: import("react").ForwardRefExoticComponent<CodeBlockCopyTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
interface BaseCopyIndicatorBaseProps {
    copied?: React.ReactNode;
    children?: React.ReactNode;
}
export interface CodeBlockCopyIndicatorProps extends Assign<HTMLChakraProps<"span">, BaseCopyIndicatorBaseProps> {
}
export declare const CodeBlockCopyIndicator: import("react").ForwardRefExoticComponent<CodeBlockCopyIndicatorProps & import("react").RefAttributes<HTMLDivElement>>;
export interface CodeBlockCollapseTriggerProps extends HTMLChakraProps<"button"> {
}
export declare const CodeBlockCollapseTrigger: import("react").ForwardRefExoticComponent<CodeBlockCollapseTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
interface BaseCollapseIndicatorBaseProps {
    collapsed?: React.ReactNode;
    children?: React.ReactNode;
}
export interface CodeBlockCollapseIndicatorProps extends Assign<HTMLChakraProps<"span">, BaseCollapseIndicatorBaseProps> {
}
export declare const CodeBlockCollapseIndicator: import("react").ForwardRefExoticComponent<CodeBlockCollapseIndicatorProps & import("react").RefAttributes<HTMLDivElement>>;
export interface CodeBlockCollapseTextProps extends HTMLChakraProps<"span"> {
}
export declare const CodeBlockCollapseText: import("react").ForwardRefExoticComponent<CodeBlockCollapseTextProps & import("react").RefAttributes<HTMLDivElement>>;
export interface CodeBlockFooterProps extends HTMLChakraProps<"div"> {
}
export declare const CodeBlockFooter: import("react").ForwardRefExoticComponent<CodeBlockFooterProps & import("react").RefAttributes<HTMLDivElement>>;
export interface CodeBlockControlProps extends HTMLChakraProps<"div"> {
}
export declare const CodeBlockControl: import("react").ForwardRefExoticComponent<CodeBlockControlProps & import("react").RefAttributes<HTMLDivElement>>;
export interface CodeBlockOverlayProps extends HTMLChakraProps<"div"> {
}
export declare const CodeBlockOverlay: import("react").ForwardRefExoticComponent<CodeBlockOverlayProps & import("react").RefAttributes<HTMLDivElement>>;
export interface CodeBlockContextProps {
    children(ctx: UseCodeBlockContext): React.ReactNode;
}
export declare const CodeBlockContext: (props: CodeBlockContextProps) => import("react").ReactNode;
