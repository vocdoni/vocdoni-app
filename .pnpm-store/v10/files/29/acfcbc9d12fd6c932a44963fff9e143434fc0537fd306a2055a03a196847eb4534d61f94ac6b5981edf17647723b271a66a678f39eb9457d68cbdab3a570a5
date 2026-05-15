import { type HTMLChakraProps, type InferRecipeProps, type JsxStyleProps } from "../../styled-system";
declare const StyledGroup: import("../..").ChakraComponent<"div", {
    orientation?: import("../..").ConditionalValue<"horizontal" | "vertical" | undefined>;
    attached?: import("../..").ConditionalValue<boolean | undefined>;
    grow?: import("../..").ConditionalValue<boolean | undefined>;
    stacking?: import("../..").ConditionalValue<"first-on-top" | "last-on-top" | undefined>;
}>;
type VariantProps = InferRecipeProps<typeof StyledGroup>;
export interface GroupProps extends HTMLChakraProps<"div", VariantProps> {
    /**
     * The `alignItems` style property
     */
    align?: JsxStyleProps["alignItems"] | undefined;
    /**
     * The `justifyContent` style property
     */
    justify?: JsxStyleProps["justifyContent"] | undefined;
    /**
     * The `flexWrap` style property
     */
    wrap?: JsxStyleProps["flexWrap"] | undefined;
    /**
     * A function that determines if a child should be skipped
     */
    skip?: (child: React.ReactElement) => boolean | undefined;
}
export declare const Group: import("react").NamedExoticComponent<GroupProps & import("react").RefAttributes<HTMLDivElement>>;
export {};
