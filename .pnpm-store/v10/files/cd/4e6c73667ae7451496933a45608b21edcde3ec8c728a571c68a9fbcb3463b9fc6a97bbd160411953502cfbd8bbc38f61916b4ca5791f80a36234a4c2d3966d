import { type HTMLChakraProps, type RecipeProps, type UnstyledProp } from "../../styled-system";
export interface ButtonLoadingProps {
    /**
     * If `true`, the button will show a loading spinner.
     * @default false
     */
    loading?: boolean | undefined;
    /**
     * The text to show while loading.
     */
    loadingText?: React.ReactNode | undefined;
    /**
     * The spinner to show while loading.
     */
    spinner?: React.ReactNode | undefined;
    /**
     * The placement of the spinner
     * @default "start"
     */
    spinnerPlacement?: "start" | "end" | undefined;
}
export interface ButtonBaseProps extends RecipeProps<"button">, UnstyledProp, ButtonLoadingProps {
}
export interface ButtonProps extends HTMLChakraProps<"button", ButtonBaseProps> {
}
export declare const Button: import("react").ForwardRefExoticComponent<ButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
export declare const ButtonPropsProvider: React.Provider<ButtonBaseProps>;
