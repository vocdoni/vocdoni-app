import * as _zag_js_anatomy from '@zag-js/anatomy';
import { DirectionProperty, CommonProperties, PropTypes, NormalizeProps } from '@zag-js/types';
import * as _zag_js_core from '@zag-js/core';
import { Service, EventObject, Machine } from '@zag-js/core';

declare const anatomy: _zag_js_anatomy.AnatomyInstance<"root" | "input" | "label" | "control" | "indicator" | "visibilityTrigger">;

interface VisibilityChangeDetails {
    visible: boolean;
}
type ElementIds = Partial<{
    input: string;
    visibilityTrigger: string;
}>;
type IntlTranslations = Partial<{
    visibilityTrigger: ((visible: boolean) => string) | undefined;
}>;
interface PasswordInputProps extends DirectionProperty, CommonProperties {
    /**
     * The default visibility of the password input.
     */
    defaultVisible?: boolean | undefined;
    /**
     * Whether the password input is visible.
     */
    visible?: boolean | undefined;
    /**
     * Function called when the visibility changes.
     */
    onVisibilityChange?: ((details: VisibilityChangeDetails) => void) | undefined;
    /**
     * The ids of the password input parts
     */
    ids?: ElementIds | undefined;
    /**
     * Whether the password input is disabled.
     */
    disabled?: boolean | undefined;
    /**
     * The invalid state of the password input.
     */
    invalid?: boolean | undefined;
    /**
     * Whether the password input is read only.
     */
    readOnly?: boolean | undefined;
    /**
     * Whether the password input is required.
     */
    required?: boolean | undefined;
    /**
     * The localized messages to use.
     */
    translations?: IntlTranslations | undefined;
    /**
     * When `true`, the input will ignore password managers.
     *
     * **Only works for the following password managers**
     * - 1Password, LastPass, Bitwarden, Dashlane, Proton Pass
     */
    ignorePasswordManagers?: boolean | undefined;
    /**
     * The autocomplete attribute for the password input.
     * @default "current-password"
     */
    autoComplete?: "current-password" | "new-password" | undefined;
    /**
     * The name of the password input.
     */
    name?: string | undefined;
}
interface PasswordInputSchema {
    state: "idle";
    props: PasswordInputProps;
    context: {
        visible: boolean;
    };
    event: EventObject;
    action: string;
    guard: string;
    effect: string;
}
type PasswordInputService = Service<PasswordInputSchema>;
type PasswordInputMachine = Machine<PasswordInputSchema>;
interface PasswordInputApi<T extends PropTypes = PropTypes> {
    /**
     * Whether the password input is visible.
     */
    visible: boolean;
    /**
     * Whether the password input is disabled.
     */
    disabled: boolean;
    /**
     * Whether the password input is invalid.
     */
    invalid: boolean;
    /**
     * Focus the password input.
     */
    focus: VoidFunction;
    /**
     * Set the visibility of the password input.
     */
    setVisible: (value: boolean) => void;
    /**
     * Toggle the visibility of the password input.
     */
    toggleVisible: VoidFunction;
    getRootProps: () => T["element"];
    getLabelProps: () => T["label"];
    getInputProps: () => T["input"];
    getVisibilityTriggerProps: () => T["button"];
    getIndicatorProps: () => T["element"];
    getControlProps: () => T["element"];
}

declare function connect<T extends PropTypes>(service: PasswordInputService, normalize: NormalizeProps<T>): PasswordInputApi<T>;

declare const machine: _zag_js_core.Machine<PasswordInputSchema>;

declare const props: (keyof PasswordInputProps)[];
declare const splitProps: <Props extends Partial<PasswordInputProps>>(props: Props) => [Partial<PasswordInputProps>, Omit<Props, keyof PasswordInputProps>];

export { type PasswordInputApi as Api, type ElementIds, type IntlTranslations, type PasswordInputMachine as Machine, type PasswordInputProps as Props, type PasswordInputService as Service, type VisibilityChangeDetails, anatomy, connect, machine, props, splitProps };
