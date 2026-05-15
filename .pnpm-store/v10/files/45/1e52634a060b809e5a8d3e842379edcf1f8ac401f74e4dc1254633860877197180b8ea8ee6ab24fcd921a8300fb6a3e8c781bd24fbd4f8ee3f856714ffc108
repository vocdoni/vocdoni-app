import { type HTMLChakraProps, type SystemStyleObject } from "../../styled-system";
import type { StackDirection } from "./get-separator-style";
interface StackOptions {
    /**
     * Shorthand for `alignItems` style prop
     * @type SystemStyleObject["alignItems"]
     */
    align?: SystemStyleObject["alignItems"] | undefined;
    /**
     * Shorthand for `justifyContent` style prop
     * @type SystemStyleObject["justifyContent"]
     */
    justify?: SystemStyleObject["justifyContent"] | undefined;
    /**
     * Shorthand for `flexWrap` style prop
     * @type SystemStyleObject["flexWrap"]
     */
    wrap?: SystemStyleObject["flexWrap"] | undefined;
    /**
     * The direction to stack the items.
     * @default "column"
     */
    direction?: StackDirection | undefined;
    /**
     * If `true`, each stack item will show a separator
     * @type React.ReactElement
     */
    separator?: React.ReactElement<any> | undefined;
}
export interface StackProps extends HTMLChakraProps<"div", StackOptions> {
}
/**
 * Stacks help you easily create flexible and automatically distributed layouts
 *
 * You can stack elements in the horizontal or vertical direction,
 * and apply a space or/and separator between each element.
 *
 * It uses `display: flex` internally and renders a `div`.
 *
 * @see Docs https://chakra-ui.com/docs/components/stack
 *
 */
export declare const Stack: import("react").ForwardRefExoticComponent<StackProps & import("react").RefAttributes<HTMLDivElement>>;
export {};
