import type { BoxProps } from "../box";
import { type InputAddonProps } from "../input-addon";
import { type InputElementProps } from "../input-element";
export interface InputGroupProps extends BoxProps {
    /**
     * The props to pass to the start element
     */
    startElementProps?: InputElementProps | undefined;
    /**
     * The props to pass to the end element
     */
    endElementProps?: InputElementProps | undefined;
    /**
     * The start element to render the inner left of the group
     */
    startElement?: React.ReactNode | undefined;
    /**
     * The end element to render the inner right of the group
     */
    endElement?: React.ReactNode | undefined;
    /**
     * The start addon to render the left of the group
     */
    startAddon?: React.ReactNode | undefined;
    /**
     * The props to pass to the start addon
     */
    startAddonProps?: InputAddonProps | undefined;
    /**
     * The end addon to render the right of the group
     */
    endAddon?: React.ReactNode | undefined;
    /**
     * The props to pass to the end addon
     */
    endAddonProps?: InputAddonProps | undefined;
    /**
     * The children to render inside the group
     */
    children: React.ReactElement<InputElementProps>;
    /**
     * The offset to apply to the start element
     */
    startOffset?: InputElementProps["paddingStart"] | undefined;
    /**
     * The offset to apply to the end element
     */
    endOffset?: InputElementProps["paddingEnd"] | undefined;
}
export declare const InputGroup: import("react").ForwardRefExoticComponent<InputGroupProps & import("react").RefAttributes<HTMLDivElement>>;
