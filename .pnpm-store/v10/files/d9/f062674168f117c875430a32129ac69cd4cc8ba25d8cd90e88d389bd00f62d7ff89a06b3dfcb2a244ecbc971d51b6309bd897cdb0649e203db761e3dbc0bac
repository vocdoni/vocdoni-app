import { type HTMLChakraProps, type SlotRecipeProps, type UnstyledProp } from "../../styled-system";
interface NativeSelectBaseProps {
    disabled?: boolean | undefined;
    invalid?: boolean | undefined;
}
declare const useNativeSelectStyles: () => Record<string, import("../..").SystemStyleObject>;
export { useNativeSelectStyles };
export interface NativeSelectRootBaseProps extends SlotRecipeProps<"nativeSelect">, UnstyledProp, NativeSelectBaseProps {
}
export interface NativeSelectRootProps extends HTMLChakraProps<"div", NativeSelectRootBaseProps> {
}
export declare const NativeSelectRoot: import("react").ForwardRefExoticComponent<NativeSelectRootProps & import("react").RefAttributes<HTMLDivElement>>;
export declare const NativeSelectPropsProvider: React.Provider<NativeSelectRootBaseProps>;
type Omitted = "disabled" | "required" | "readOnly" | "size";
export interface NativeSelectFieldProps extends Omit<HTMLChakraProps<"select">, Omitted>, UnstyledProp {
    placeholder?: string | undefined;
}
export declare const NativeSelectField: import("react").ForwardRefExoticComponent<NativeSelectFieldProps & import("react").RefAttributes<HTMLSelectElement>>;
export interface NativeSelectIndicatorProps extends HTMLChakraProps<"div">, UnstyledProp {
}
export declare function NativeSelectIndicator(props: NativeSelectIndicatorProps): import("react/jsx-runtime").JSX.Element;
