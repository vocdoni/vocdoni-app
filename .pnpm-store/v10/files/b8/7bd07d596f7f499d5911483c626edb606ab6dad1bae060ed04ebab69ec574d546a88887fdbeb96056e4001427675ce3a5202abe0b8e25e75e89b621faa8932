import { ConditionalValue, ColorPalette, TagRootProps, SystemStyleObject, SelectRootProps, SpinnerProps } from '@chakra-ui/react';
import * as react_select from 'react-select';
import { GroupBase, ClearIndicatorProps, ContainerProps, ControlProps, DropdownIndicatorProps, GroupProps, GroupHeadingProps, IndicatorsContainerProps, IndicatorSeparatorProps, InputProps, LoadingIndicatorProps, NoticeProps, MenuProps, MenuListProps, MultiValueProps, OptionProps, PlaceholderProps, SingleValueProps, ValueContainerProps, Props, SelectInstance, StylesConfig, ThemeConfig } from 'react-select';
export * from 'react-select';
export { Props as ReactSelectBaseProps } from 'react-select/base';
import { RefAttributes, ReactElement } from 'react';
import { CreatableProps } from 'react-select/creatable';
export { CreatableProps, useCreatable } from 'react-select/creatable';
import { AsyncProps } from 'react-select/async';
export { AsyncProps, useAsync } from 'react-select/async';
import { AsyncCreatableProps } from 'react-select/async-creatable';
export { AsyncCreatableProps } from 'react-select/async-creatable';
import * as react_jsx_runtime from 'react/jsx-runtime';

type CssVars = `var(--${string})`;
type AnyString = string & {};
type ColorPaletteProp = ConditionalValue<ColorPalette | CssVars | AnyString>;
type Size = "sm" | "md" | "lg";
type SizeProp = Size | Record<string, Size> | Array<Size>;
/**
 * By default includes `"outline" | "subtle" | "solid" | "surface"`
 */
type TagVariant = TagRootProps["variant"];
type SelectedOptionStyle = "color" | "check";
type Variant = SelectRootProps["variant"];
type StylesFunction<ComponentProps> = (provided: SystemStyleObject, state: ComponentProps) => SystemStyleObject;
interface ChakraStylesConfig<Option = unknown, IsMulti extends boolean = boolean, Group extends GroupBase<Option> = GroupBase<Option>> {
    clearIndicator?: StylesFunction<ClearIndicatorProps<Option, IsMulti, Group>>;
    container?: StylesFunction<ContainerProps<Option, IsMulti, Group>>;
    control?: StylesFunction<ControlProps<Option, IsMulti, Group>>;
    dropdownIndicator?: StylesFunction<DropdownIndicatorProps<Option, IsMulti, Group>>;
    downChevron?: StylesFunction<DropdownIndicatorProps<Option, IsMulti, Group>>;
    crossIcon?: StylesFunction<ClearIndicatorProps<Option, IsMulti, Group>>;
    group?: StylesFunction<GroupProps<Option, IsMulti, Group>>;
    groupHeading?: StylesFunction<GroupHeadingProps<Option, IsMulti, Group>>;
    indicatorsContainer?: StylesFunction<IndicatorsContainerProps<Option, IsMulti, Group>>;
    indicatorSeparator?: StylesFunction<IndicatorSeparatorProps<Option, IsMulti, Group>>;
    input?: StylesFunction<InputProps<Option, IsMulti, Group>>;
    inputContainer?: StylesFunction<InputProps<Option, IsMulti, Group>>;
    loadingIndicator?: StylesFunction<LoadingIndicatorProps<Option, IsMulti, Group>>;
    loadingMessage?: StylesFunction<NoticeProps<Option, IsMulti, Group>>;
    menu?: StylesFunction<MenuProps<Option, IsMulti, Group>>;
    menuList?: StylesFunction<MenuListProps<Option, IsMulti, Group>>;
    multiValue?: StylesFunction<MultiValueProps<Option, IsMulti, Group>>;
    multiValueLabel?: StylesFunction<MultiValueProps<Option, IsMulti, Group>>;
    multiValueEndElement?: StylesFunction<MultiValueProps<Option, IsMulti, Group>>;
    multiValueRemove?: StylesFunction<MultiValueProps<Option, IsMulti, Group>>;
    noOptionsMessage?: StylesFunction<NoticeProps<Option, IsMulti, Group>>;
    option?: StylesFunction<OptionProps<Option, IsMulti, Group>>;
    placeholder?: StylesFunction<PlaceholderProps<Option, IsMulti, Group>>;
    singleValue?: StylesFunction<SingleValueProps<Option, IsMulti, Group>>;
    valueContainer?: StylesFunction<ValueContainerProps<Option, IsMulti, Group>>;
}
interface OptionBase {
    variant?: string;
    colorPalette?: string;
    isDisabled?: boolean;
}

type SelectComponent = <Option = unknown, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>(props: Props<Option, IsMulti, Group> & RefAttributes<SelectInstance<Option, IsMulti, Group>>) => ReactElement;
declare const Select: SelectComponent;

type CreatableSelectComponent = <Option = unknown, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>(props: CreatableProps<Option, IsMulti, Group> & RefAttributes<SelectInstance<Option, IsMulti, Group>>) => ReactElement;
declare const CreatableSelect: CreatableSelectComponent;

type AsyncSelectComponent = <Option = unknown, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>(props: AsyncProps<Option, IsMulti, Group> & RefAttributes<SelectInstance<Option, IsMulti, Group>>) => ReactElement;
declare const AsyncSelect: AsyncSelectComponent;

type AsyncCreatableSelectComponent = <Option = unknown, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>(props: AsyncCreatableProps<Option, IsMulti, Group> & RefAttributes<SelectInstance<Option, IsMulti, Group>>) => ReactElement;
declare const AsyncCreatableSelect: AsyncCreatableSelectComponent;

declare const chakraComponents: {
    ClearIndicator: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.ClearIndicatorProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    Control: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.ControlProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    DropdownIndicator: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.DropdownIndicatorProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    Group: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.GroupProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    GroupHeading: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.GroupHeadingProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    IndicatorSeparator: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.IndicatorSeparatorProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    IndicatorsContainer: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.IndicatorsContainerProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    Input: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.InputProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    LoadingIndicator: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.LoadingIndicatorProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    LoadingMessage: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.NoticeProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    Menu: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.MenuProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    MenuList: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.MenuListProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    MultiValue: <Option = unknown, IsMulti extends boolean = boolean, Group extends react_select.GroupBase<Option> = react_select.GroupBase<Option>>(props: react_select.MultiValueProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    MultiValueContainer: <Option = unknown, IsMulti extends boolean = boolean, Group extends react_select.GroupBase<Option> = react_select.GroupBase<Option>>(props: react_select.MultiValueGenericProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    MultiValueLabel: <Option = unknown, IsMulti extends boolean = boolean, Group extends react_select.GroupBase<Option> = react_select.GroupBase<Option>>(props: react_select.MultiValueGenericProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    MultiValueRemove: <Option = unknown, IsMulti extends boolean = boolean, Group extends react_select.GroupBase<Option> = react_select.GroupBase<Option>>(props: react_select.MultiValueRemoveProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    NoOptionsMessage: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.NoticeProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    Option: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.OptionProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    Placeholder: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.PlaceholderProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    SelectContainer: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.ContainerProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    SingleValue: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.SingleValueProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
    ValueContainer: <Option, IsMulti extends boolean, Group extends react_select.GroupBase<Option>>(props: react_select.ValueContainerProps<Option, IsMulti, Group>) => react_jsx_runtime.JSX.Element;
};

declare const useChakraSelectProps: <Option, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>>({ components, disabled, isDisabled, invalid, readOnly, required, inputId, selectedOptionStyle, selectedOptionColorPalette, menuIsOpen, menuPlacement, theme, ...props }: Props<Option, IsMulti, Group>) => Props<Option, IsMulti, Group>;

/**
 * Module augmentation is used to add extra props to the existing interfaces
 * from `react-select` as per the docs
 *
 * @see {@link https://react-select.com/typescript#custom-select-props}
 */
declare module "react-select/base" {
    interface Props<Option, IsMulti extends boolean, Group extends GroupBase<Option>> {
        /**
         * The size of the base control; matches the sizes of the chakra Input
         * component with the exception of `xs`. A [responsive style array/object](https://www.chakra-ui.com/docs/styling/responsive-design) can
         * also be passed.
         *
         * Options: `sm` | `md` | `lg`
         *
         * @defaultValue `md`
         * @see {@link https://github.com/csandman/chakra-react-select#size--options-responsivevaluesm--md--lg--default-md}
         * @see {@link https://www.chakra-ui.com/docs/components/select#sizes}
         */
        size?: SizeProp;
        /**
         * Determines whether or not to style the input with the invalid border
         * color.
         *
         * If the `aria-invalid` prop is not passed, this prop will also set that
         *
         * @see {@link https://github.com/csandman/chakra-react-select#isinvalid--default-false--isreadonly---default-false}
         * @see {@link https://www.chakra-ui.com/docs/components/select#invalid}
         * @see {@link https://www.chakra-ui.com/docs/components/field#error-text}
         */
        invalid?: boolean;
        /**
         * Whether the select is disabled. Overrides the `isDisabled` prop built-in to `react-select`.
         *
         * @see {@link https://github.com/csandman/chakra-react-select#isinvalid--default-false--isreadonly---default-false}
         * @see {@link https://www.chakra-ui.com/docs/components/select#disabled}
         * @see {@link https://www.chakra-ui.com/docs/components/field#disabled}
         */
        disabled?: boolean;
        /**
         * If `true`, the form control will be `readonly`.
         *
         * @see {@link https://github.com/csandman/chakra-react-select#isinvalid--default-false--isreadonly---default-false}
         * @see {@link https://www.chakra-ui.com/docs/components/select#props}
         * @see {@link https://www.chakra-ui.com/docs/components/field#props}
         */
        readOnly?: boolean;
        /**
         * A color name that matches a key from your chakra theme and will
         * determine the color scheme of your `MultiValue` component.
         *
         * The variable is passed to the theme key for the Chakra `Tag` component.
         *
         * @see {@link https://github.com/csandman/chakra-react-select#colorscheme}
         * @see {@link https://www.chakra-ui.com/docs/components/tag#colors}
         * @see {@link https://www.chakra-ui.com/docs/styling/virtual-color}
         * @see {@link https://github.com/chakra-ui/chakra-ui/blob/9ecae5c/packages/react/src/styled-system/generated/system.gen.ts#L688}
         */
        tagColorPalette?: ColorPaletteProp;
        /**
         * The `variant` prop that will be forwarded to your `MultiValue` component
         * which is represented by a chakra `Tag`. You can also use any custom
         * variants you have added to your theme.
         *
         * Built-in options: `"outline" | "subtle" | "solid" | "surface"`
         *
         * @defaultValue Your theme default (default is `"surface"`)
         * @see {@link https://github.com/csandman/chakra-react-select#tagvariant--options-subtle--solid--outline--default-subtle}
         * @see {@link https://www.chakra-ui.com/docs/components/tag#variants}
         */
        tagVariant?: TagVariant;
        /**
         * Whether to style a selected option by highlighting it in a solid color
         * or adding a check mark on the right hand side like the Chakra `Select` component.
         *
         * Options: `color` | `check`
         *
         * @defaultValue `check`
         * @see {@link https://github.com/csandman/chakra-react-select#selectedoptionstyle--options-color--check--default-color}
         * @see {@link https://www.chakra-ui.com/docs/components/select}
         */
        selectedOptionStyle?: SelectedOptionStyle;
        /**
         * The color palette to style an option with when using the
         * `selectedOptionStyle="color"` prop.  Uses the `color.500` value in light mode
         * and the `color.300` value in dark mode.
         *
         * @defaultValue `blue`
         * @see {@link https://github.com/csandman/chakra-react-select#selectedoptioncolorpalette--default-blue}
         * @see {@link https://www.chakra-ui.com/docs/theming/customization/colors}
         * @see {@link https://github.com/chakra-ui/chakra-ui/blob/9ecae5c/packages/react/src/styled-system/generated/system.gen.ts#L688}
         */
        selectedOptionColorPalette?: ColorPaletteProp;
        /**
         * The color value to style the border of the `Control` with when the
         * select is focused.
         *
         * @see {@link https://github.com/csandman/chakra-react-select#focusringcolor}
         * @see {@link https://www.chakra-ui.com/docs/styling/focus-ring}
         */
        focusRingColor?: string;
        /**
         * Style transformation methods for each of the rendered components using,
         * Chakra's `SystemStyleObject` and the props passed into each component.
         *
         * @see {@link https://github.com/csandman/chakra-react-select#chakrastyles}
         * @see {@link https://react-select.com/styles#style-object}
         */
        chakraStyles?: ChakraStylesConfig<Option, IsMulti, Group>;
        /**
         * The main style variant of the `Select` component. This will use styles
         * from Chakra's `Select` component and any custom variants you have added to
         * your theme may be used.
         *
         * Options: `outline` | `subtle`
         *
         * @see {@link https://www.chakra-ui.com/docs/components/select#variants}
         * @see {@link https://github.com/csandman/chakra-react-select#variant--options-outline--filled--flushed--unstyled--default-outline}
         */
        variant?: Variant;
        /**
         * This prop is not used in `chakra-react-select`, use {@link chakraStyles} instead.
         *
         * The only exception is setting styles on the `menuPortal` component.
         * @see {@link https://github.com/csandman/chakra-react-select#caveats}
         */
        styles: StylesConfig<Option, IsMulti, Group>;
        /**
         * @deprecated This prop is not used in `chakra-react-select`, all theme
         * values are pulled from your Chakra UI theme.
         */
        theme?: ThemeConfig;
    }
}
declare module "react-select" {
    interface MultiValueProps<Option = unknown, IsMulti extends boolean = boolean, Group extends GroupBase<Option> = GroupBase<Option>> {
        css: SystemStyleObject;
    }
    interface MultiValueGenericProps<Option = unknown, IsMulti extends boolean = boolean, Group extends GroupBase<Option> = GroupBase<Option>> {
        css: SystemStyleObject;
    }
    interface MultiValueRemoveProps<Option = unknown, IsMulti extends boolean = boolean, Group extends GroupBase<Option> = GroupBase<Option>> {
        isFocused: boolean;
        endElementCss: SystemStyleObject;
        css: SystemStyleObject;
    }
    interface LoadingIndicatorProps<Option = unknown, IsMulti extends boolean = boolean, Group extends GroupBase<Option> = GroupBase<Option>> {
        /**
         * The color palette of the filled in area of the spinner.
         *
         * @see {@link https://www.chakra-ui.com/docs/components/spinner#colors}
         * @see {@link https://github.com/chakra-ui/chakra-ui/blob/9ecae5c/packages/react/src/styled-system/generated/system.gen.ts#L688}
         */
        colorPalette?: ColorPaletteProp;
        /**
         * The color of the filled in area of the spinner.
         *
         * Defaults to your Chakra theme's text color.
         * @example
         * ```jsx
         * <Spinner color="blue.600"/>
         * ```
         * @see {@link https://www.chakra-ui.com/docs/components/spinner#custom-color}
         */
        color?: string;
        /**
         * The color of the empty area in the spinner.
         *
         * This prop populates the CSS variable `--spinner-track-color`
         *
         * @example
         * ```jsx
         * <Spinner trackColor="colors.blue.100"/>
         * ```
         * @see {@link https://www.chakra-ui.com/docs/components/spinner#track-color}
         */
        trackColor?: string;
        /**
         * The size prop for the Chakra `<Spinner />` component.
         *
         * Defaults to one size smaller than the overall Select's size.
         *
         * @see {@link https://www.chakra-ui.com/docs/components/spinner#sizes}
         */
        spinnerSize?: SpinnerProps["size"];
        /**
         * The speed of the spinner represented by the time it takes to make one full rotation.
         *
         * This speed is represented by a
         * [CSS `<time>`](https://developer.mozilla.org/en-US/docs/Web/CSS/time)
         * variable which uses either seconds or milliseconds.
         *
         * @example
         * ```jsx
         * <Spinner animationDuration="0.2s"/>
         * ```
         * @see {@link https://www.chakra-ui.com/docs/components/spinner#custom-speed}
         */
        animationDuration?: string;
        /**
         * The thickness of the spinner.
         *
         * @defaultValue `2px`
         * @example
         * ```jsx
         * <Spinner borderWidth="4px"/>
         * ```
         * @see {@link https://www.chakra-ui.com/docs/components/spinner#thickness}
         */
        borderWidth?: string;
    }
}

export { AsyncCreatableSelect, type AsyncCreatableSelectComponent, AsyncSelect, type AsyncSelectComponent, type ChakraStylesConfig, CreatableSelect, type CreatableSelectComponent, type OptionBase, Select, type SelectComponent, type SelectedOptionStyle, type Size, type SizeProp, type StylesFunction, type TagVariant, type Variant, chakraComponents, useChakraSelectProps };
