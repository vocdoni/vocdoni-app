import { forwardRef } from 'react';
import ReactSelect__default from 'react-select';
export * from 'react-select';
import { chakra, useFieldContext, Box, useSlotRecipe, Span, useChakraContext, Spinner, Separator, useRecipe, IconButton, useBreakpointValue } from '@chakra-ui/react';
import { jsx, jsxs } from 'react/jsx-runtime';
import CreatableReactSelect from 'react-select/creatable';
export { useCreatable } from 'react-select/creatable';
import AsyncReactSelect from 'react-select/async';
export { useAsync } from 'react-select/async';
import AsyncCreatableReactSelect from 'react-select/async-creatable';

// src/select/select.tsx
var SelectContainer = (props) => {
  const {
    children,
    className,
    cx,
    innerProps,
    isDisabled,
    isRtl,
    hasValue,
    selectProps: { chakraStyles, size, variant }
  } = props;
  const selectStyles = useSlotRecipe({ key: "select" })({
    size,
    variant
  });
  const initialCss = {
    ...selectStyles.root,
    gap: 0,
    position: "relative",
    direction: isRtl ? "rtl" : void 0,
    ...isDisabled ? { cursor: "not-allowed" } : {}
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.container) ? chakraStyles.container(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ...innerProps,
      className: cx(
        {
          "--is-disabled": isDisabled,
          "--is-rtl": isRtl,
          "--has-value": hasValue
        },
        className
      ),
      css,
      children
    }
  );
};
var ValueContainer = (props) => {
  const {
    children,
    className,
    cx,
    isMulti,
    hasValue,
    innerProps,
    selectProps: { chakraStyles, controlShouldRenderValue }
  } = props;
  const initialCss = {
    display: isMulti && hasValue && controlShouldRenderValue ? "flex" : "grid",
    alignItems: "center",
    flex: 1,
    paddingY: "2px",
    flexWrap: "wrap",
    position: "relative",
    overflow: "hidden"
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.valueContainer) ? chakraStyles.valueContainer(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ...innerProps,
      className: cx(
        {
          "value-container": true,
          "value-container--is-multi": isMulti,
          "value-container--has-value": hasValue
        },
        className
      ),
      css,
      children
    }
  );
};
var IndicatorsContainer = (props) => {
  const {
    children,
    className,
    cx,
    innerProps,
    selectProps: { chakraStyles, size, variant }
  } = props;
  const selectStyles = useSlotRecipe({ key: "select" })({
    size,
    variant
  });
  const initialCss = {
    ...selectStyles.indicatorGroup,
    // TODO: Figure out if this should be allowed to be position: "absolute"
    // That's the built-in default, but it's causing the tags to overlap the indicators
    position: "static",
    // This needs to be overridden otherwise, because the padding is already on the control
    paddingRight: 0
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.indicatorsContainer) ? chakraStyles.indicatorsContainer(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ...innerProps,
      className: cx(
        {
          indicators: true
        },
        className
      ),
      css,
      children
    }
  );
};
var Svg = chakra("svg");
var CheckIcon = (props) => /* @__PURE__ */ jsx(
  Svg,
  {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: /* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" })
  }
);
var ChevronDownIcon = (props) => /* @__PURE__ */ jsx(
  Svg,
  {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
    children: /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" })
  }
);
var CloseIcon = (props) => /* @__PURE__ */ jsx(Svg, { viewBox: "0 0 24 24", fill: "currentColor", ...props, children: /* @__PURE__ */ jsx(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M18.7071 6.70711C19.0976 6.31658 19.0976 5.68342 18.7071 5.29289C18.3166 4.90237 17.6834 4.90237 17.2929 5.29289L12 10.5858L6.70711 5.29289C6.31658 4.90237 5.68342 4.90237 5.29289 5.29289C4.90237 5.68342 4.90237 6.31658 5.29289 6.70711L10.5858 12L5.29289 17.2929C4.90237 17.6834 4.90237 18.3166 5.29289 18.7071C5.68342 19.0976 6.31658 19.0976 6.70711 18.7071L12 13.4142L17.2929 18.7071C17.6834 19.0976 18.3166 19.0976 18.7071 18.7071C19.0976 18.3166 19.0976 17.6834 18.7071 17.2929L13.4142 12L18.7071 6.70711Z"
  }
) });
var Control = (props) => {
  const {
    className,
    cx,
    children,
    innerRef,
    innerProps,
    isDisabled,
    isFocused,
    menuIsOpen,
    selectProps: {
      chakraStyles,
      size,
      variant,
      invalid,
      readOnly,
      focusRingColor
    }
  } = props;
  const inputRecipe = useRecipe({ key: "input" });
  const inputStyles = inputRecipe({
    size,
    variant
  });
  const initialCss = {
    ...inputStyles,
    display: "flex",
    height: "auto",
    minHeight: "var(--select-trigger-height)",
    ...isDisabled ? { pointerEvents: "none" } : {}
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.control) ? chakraStyles.control(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ref: innerRef,
      className: cx(
        {
          control: true,
          "control--is-disabled": isDisabled,
          "control--is-focused": isFocused,
          "control--menu-is-open": menuIsOpen
        },
        className
      ),
      css,
      ...innerProps,
      focusRingColor,
      "data-focus": isFocused ? true : void 0,
      "data-focus-visible": isFocused ? true : void 0,
      "data-invalid": invalid ? true : void 0,
      "data-disabled": isDisabled ? true : void 0,
      "data-readonly": readOnly ? true : void 0,
      children
    }
  );
};
var IndicatorSeparator = (props) => {
  const {
    className,
    cx,
    selectProps: { chakraStyles }
  } = props;
  const initialCss = {
    // To match the default styles of the Chakra select, we don't want to show the separator
    display: "none"
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.indicatorSeparator) ? chakraStyles.indicatorSeparator(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Separator,
    {
      className: cx({ "indicator-separator": true }, className),
      css,
      orientation: "vertical"
    }
  );
};
var DropdownIndicator = (props) => {
  const {
    children,
    className,
    cx,
    innerProps,
    selectProps: { chakraStyles, size, variant }
  } = props;
  const selectStyles = useSlotRecipe({ key: "select" })({
    size,
    variant
  });
  const initialDropdownIndicatorCss = {
    ...selectStyles.indicator
  };
  const dropdownIndicatorCss = (chakraStyles == null ? void 0 : chakraStyles.dropdownIndicator) ? chakraStyles.dropdownIndicator(initialDropdownIndicatorCss, props) : initialDropdownIndicatorCss;
  const initialDownChevronCss = {};
  const downChevronCss = (chakraStyles == null ? void 0 : chakraStyles.downChevron) ? chakraStyles.downChevron(initialDownChevronCss, props) : initialDownChevronCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ...innerProps,
      className: cx(
        {
          indicator: true,
          "dropdown-indicator": true
        },
        className
      ),
      css: dropdownIndicatorCss,
      children: children || /* @__PURE__ */ jsx(ChevronDownIcon, { css: downChevronCss })
    }
  );
};
var ClearIndicator = (props) => {
  const {
    children,
    className,
    cx,
    innerProps,
    selectProps: { chakraStyles, size, variant }
  } = props;
  const selectStyles = useSlotRecipe({ key: "select" })({
    size,
    variant
  });
  const initialCss = {
    ...selectStyles.clearTrigger
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.clearIndicator) ? chakraStyles.clearIndicator(initialCss, props) : initialCss;
  const initialIconStyles = {};
  const iconCss = (chakraStyles == null ? void 0 : chakraStyles.crossIcon) ? chakraStyles.crossIcon(initialIconStyles, props) : initialIconStyles;
  return /* @__PURE__ */ jsx(
    Box,
    {
      className: cx(
        {
          indicator: true,
          "clear-indicator": true
        },
        className
      ),
      css,
      "aria-label": "Clear selected options",
      asChild: true,
      ...innerProps,
      children: /* @__PURE__ */ jsx(
        IconButton,
        {
          size: "sm",
          boxSize: 8,
          minWidth: "unset",
          variant: "plain",
          pointerEvents: "auto",
          tabIndex: -1,
          children: children || /* @__PURE__ */ jsx(CloseIcon, { css: iconCss })
        }
      )
    }
  );
};
var LoadingIndicator = (props) => {
  const {
    className,
    cx,
    innerProps,
    selectProps: { chakraStyles },
    color,
    colorPalette,
    trackColor,
    animationDuration,
    borderWidth,
    spinnerSize
  } = props;
  const initialCss = {
    marginRight: 3,
    ...trackColor ? { "--spinner-track-color": trackColor } : {}
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.loadingIndicator) ? chakraStyles.loadingIndicator(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Spinner,
    {
      className: cx(
        {
          indicator: true,
          "loading-indicator": true
        },
        className
      ),
      css,
      ...innerProps,
      size: spinnerSize,
      colorPalette,
      color,
      animationDuration,
      borderWidth
    }
  );
};
var cleanCommonProps = (props) => {
  const {
    className,
    // not listed in commonProps documentation, needs to be removed to allow Emotion to generate classNames
    clearValue,
    cx,
    getStyles,
    getClassNames,
    getValue,
    hasValue,
    isMulti,
    isRtl,
    options,
    // not listed in commonProps documentation
    selectOption,
    selectProps,
    setValue,
    theme,
    // not listed in commonProps documentation
    ...innerProps
  } = props;
  return { ...innerProps };
};
var isSize = (size) => {
  const isString = typeof size === "string";
  return isString && ["sm", "md", "lg"].includes(size);
};
var getDefaultSize = (size) => {
  if (isSize(size)) {
    return size;
  }
  if (size === "xs") {
    return "sm";
  }
  if (size === "xl") {
    return "lg";
  }
  return "md";
};
var useSize = (size) => {
  var _a, _b, _c, _d;
  const chakraContext = useChakraContext();
  const defaultSize = getDefaultSize(
    (_b = (_a = chakraContext.getSlotRecipe("select")) == null ? void 0 : _a.defaultVariants) == null ? void 0 : _b.size
  );
  const responsiveSize = (_c = typeof size === "string" ? [size] : size) != null ? _c : [
    defaultSize
  ];
  return (_d = useBreakpointValue(responsiveSize)) != null ? _d : defaultSize;
};
var BaseInput = chakra("input");
var Input = (props) => {
  const {
    className,
    cx,
    value,
    selectProps: { chakraStyles, readOnly }
  } = props;
  const { innerRef, isDisabled, isHidden, inputClassName, ...innerProps } = cleanCommonProps(props);
  const spacingCss = {
    gridArea: "1 / 2",
    minW: "2px",
    border: 0,
    margin: 0,
    outline: 0,
    padding: 0
  };
  const initialContainerCss = {
    flex: "1 1 auto",
    display: "inline-grid",
    gridArea: "1 / 1 / 2 / 3",
    gridTemplateColumns: "0 min-content",
    color: "inherit",
    marginX: "0.125rem",
    paddingY: "0.125rem",
    visibility: isDisabled ? "hidden" : "visible",
    // Force css to recompute when value change due to @emotion bug.
    // We can remove it whenever the bug is fixed.
    transform: value ? "translateZ(0)" : "",
    _after: {
      content: 'attr(data-value) " "',
      visibility: "hidden",
      whiteSpace: "pre",
      padding: 0,
      ...spacingCss
    }
  };
  const containerCss = (chakraStyles == null ? void 0 : chakraStyles.inputContainer) ? chakraStyles.inputContainer(initialContainerCss, props) : initialContainerCss;
  const initialInputCss = {
    background: 0,
    opacity: isHidden ? 0 : 1,
    width: "100%",
    ...spacingCss
  };
  const inputCss = (chakraStyles == null ? void 0 : chakraStyles.input) ? chakraStyles.input(initialInputCss, props) : initialInputCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      className: cx({ "input-container": true }, className),
      "data-value": value || "",
      css: containerCss,
      children: /* @__PURE__ */ jsx(
        BaseInput,
        {
          className: cx({ input: true }, inputClassName),
          ref: innerRef,
          css: inputCss,
          disabled: isDisabled,
          readOnly: readOnly ? true : void 0,
          ...innerProps
        }
      )
    }
  );
};
var Menu = (props) => {
  const {
    className,
    cx,
    children,
    innerProps,
    innerRef,
    placement,
    selectProps: { chakraStyles }
  } = props;
  const initialCss = {
    position: "absolute",
    ...placement === "top" ? { bottom: "100%" } : { top: "100%" },
    marginY: "8px",
    width: "100%",
    zIndex: 1
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.menu) ? chakraStyles.menu(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ...innerProps,
      ref: innerRef,
      className: cx({ menu: true }, className),
      css,
      children
    }
  );
};
var MenuList = (props) => {
  const {
    className,
    cx,
    innerRef,
    children,
    maxHeight,
    isMulti,
    innerProps,
    selectProps: { chakraStyles, size, variant }
  } = props;
  const selectStyles = useSlotRecipe({ key: "select" })({ size, variant });
  const initialCss = {
    ...selectStyles.content,
    maxHeight: `${maxHeight}px`,
    position: "relative"
    // required for offset[Height, Top] > keyboard scroll
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.menuList) ? chakraStyles.menuList(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ...innerProps,
      className: cx(
        {
          "menu-list": true,
          "menu-list--is-multi": isMulti
        },
        className
      ),
      css,
      ref: innerRef,
      children
    }
  );
};
var messageVerticalPaddings = {
  sm: 1.5,
  md: 2,
  lg: 2.5
};
var LoadingMessage = (props) => {
  const {
    children,
    className,
    cx,
    innerProps,
    selectProps: { chakraStyles, size: sizeProp }
  } = props;
  const size = useSize(sizeProp);
  const initialCss = {
    color: "fg.muted",
    textAlign: "center",
    paddingY: messageVerticalPaddings[size]
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.loadingMessage) ? chakraStyles.loadingMessage(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ...innerProps,
      className: cx(
        {
          "menu-notice": true,
          "menu-notice--loading": true
        },
        className
      ),
      css,
      children
    }
  );
};
var NoOptionsMessage = (props) => {
  const {
    children,
    className,
    cx,
    innerProps,
    selectProps: { chakraStyles, size: sizeProp }
  } = props;
  const size = useSize(sizeProp);
  const initialCss = {
    color: "fg.muted",
    textAlign: "center",
    paddingY: messageVerticalPaddings[size]
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.noOptionsMessage) ? chakraStyles.noOptionsMessage(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ...innerProps,
      className: cx(
        {
          "menu-notice": true,
          "menu-notice--no-options": true
        },
        className
      ),
      css,
      children
    }
  );
};
var Group = (props) => {
  const {
    children,
    className,
    cx,
    theme,
    getStyles,
    Heading,
    headingProps,
    label,
    selectProps,
    innerProps,
    getClassNames
  } = props;
  const { chakraStyles, size, variant } = selectProps;
  const selectStyles = useSlotRecipe({ key: "select" })({ size, variant });
  const initialCss = {
    ...selectStyles.itemGroup
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.group) ? chakraStyles.group(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsxs(Box, { ...innerProps, className: cx({ group: true }, className), css, children: [
    /* @__PURE__ */ jsx(
      Heading,
      {
        ...headingProps,
        selectProps,
        cx,
        theme,
        getStyles,
        getClassNames,
        children: label
      }
    ),
    /* @__PURE__ */ jsx(Box, { children })
  ] });
};
var GroupHeading = (props) => {
  const {
    cx,
    className,
    selectProps: { chakraStyles, size, variant }
  } = props;
  const { data, ...innerProps } = cleanCommonProps(props);
  const selectStyles = useSlotRecipe({ key: "select" })({ size, variant });
  const initialCss = {
    ...selectStyles.itemGroupLabel
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.groupHeading) ? chakraStyles.groupHeading(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ...innerProps,
      className: cx({ "group-heading": true }, className),
      css
    }
  );
};
var MenuIcon = (props) => /* @__PURE__ */ jsx(Span, { ...props, children: /* @__PURE__ */ jsx(CheckIcon, {}) });
var Option = (props) => {
  const {
    className,
    cx,
    innerRef,
    innerProps,
    children,
    isFocused,
    isDisabled,
    isSelected,
    selectProps: {
      chakraStyles,
      isMulti,
      hideSelectedOptions,
      selectedOptionStyle,
      selectedOptionColorPalette,
      size,
      variant
    }
  } = props;
  const selectStyles = useSlotRecipe({ key: "select" })({ size, variant });
  const showCheckIcon = selectedOptionStyle === "check" && (!isMulti || hideSelectedOptions === false);
  const shouldHighlight = selectedOptionStyle === "color" && isSelected;
  const initialCss = {
    ...selectStyles.item,
    ...shouldHighlight ? {
      color: "colorPalette.contrast",
      bg: "colorPalette.solid",
      _active: { bg: "colorPalette.solid" }
    } : {}
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.option) ? chakraStyles.option(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsxs(
    Box,
    {
      ...innerProps,
      colorPalette: selectedOptionColorPalette,
      className: cx(
        {
          option: true,
          "option--is-disabled": isDisabled,
          "option--is-focused": isFocused,
          "option--is-selected": isSelected
        },
        className
      ),
      css,
      ref: innerRef,
      "data-highlighted": isFocused ? true : void 0,
      "aria-disabled": isDisabled ? true : void 0,
      "aria-selected": isSelected,
      children: [
        children,
        showCheckIcon && /* @__PURE__ */ jsx(MenuIcon, { css: { ...selectStyles.itemIndicator }, hidden: !isSelected, children: /* @__PURE__ */ jsx(CheckIcon, {}) })
      ]
    }
  );
};
var hasColorPalette = (option) => typeof option === "object" && option !== null && "colorPalette" in option && typeof option.colorPalette === "string";
var hasVariant = (option) => typeof option === "object" && option !== null && "variant" in option && typeof option.variant === "string";
var MultiValue = (props) => {
  var _a;
  const {
    children,
    className,
    components,
    cx,
    data,
    innerProps,
    isDisabled,
    isFocused,
    removeProps,
    selectProps,
    cropWithEllipsis
  } = props;
  const { Container, Label, Remove } = components;
  const { chakraStyles, tagColorPalette, tagVariant, size } = selectProps;
  const chakraContext = useChakraContext();
  const { colorPalette: themeTagColorPalette, variant: defaultTagVariant } = (_a = chakraContext.getSlotRecipe("tag").defaultVariants) != null ? _a : {};
  let optionColorPalette = themeTagColorPalette;
  if (hasColorPalette(data)) {
    optionColorPalette = data.colorPalette;
  } else if (tagColorPalette) {
    optionColorPalette = tagColorPalette;
  }
  let variant = defaultTagVariant;
  if (hasVariant(data)) {
    variant = data.variant;
  } else if (tagVariant) {
    variant = tagVariant;
  }
  const tagStyles = useSlotRecipe({ key: "tag" })({
    size,
    variant
  });
  const containerInitialCss = {
    ...tagStyles.root,
    colorPalette: optionColorPalette,
    minWidth: 0,
    // resolves flex/text-overflow bug
    margin: "0.125rem"
  };
  const containerCss = (chakraStyles == null ? void 0 : chakraStyles.multiValue) ? chakraStyles.multiValue(containerInitialCss, props) : containerInitialCss;
  const labelInitialCss = {
    ...tagStyles.label,
    overflow: "hidden",
    textOverflow: cropWithEllipsis || cropWithEllipsis === void 0 ? "ellipsis" : void 0,
    whiteSpace: "nowrap"
  };
  const labelCss = (chakraStyles == null ? void 0 : chakraStyles.multiValueLabel) ? chakraStyles.multiValueLabel(labelInitialCss, props) : labelInitialCss;
  const endElementInitialCss = {
    ...tagStyles.endElement
  };
  const endElementCss = (chakraStyles == null ? void 0 : chakraStyles.multiValueEndElement) ? chakraStyles.multiValueEndElement(endElementInitialCss, props) : endElementInitialCss;
  const removeInitialCss = {
    ...tagStyles.closeTrigger,
    cursor: "pointer"
  };
  const removeCss = (chakraStyles == null ? void 0 : chakraStyles.multiValueRemove) ? chakraStyles.multiValueRemove(removeInitialCss, props) : removeInitialCss;
  return /* @__PURE__ */ jsxs(
    Container,
    {
      data,
      innerProps: {
        className: cx(
          {
            "multi-value": true,
            "multi-value--is-disabled": isDisabled
          },
          className
        ),
        ...innerProps
      },
      css: containerCss,
      selectProps,
      children: [
        /* @__PURE__ */ jsx(
          Label,
          {
            data,
            innerProps: {
              className: cx(
                {
                  "multi-value__label": true
                },
                className
              )
            },
            css: labelCss,
            selectProps,
            children
          }
        ),
        /* @__PURE__ */ jsx(
          Remove,
          {
            data,
            innerProps: {
              className: cx(
                {
                  "multi-value__remove": true
                },
                className
              ),
              "aria-label": `Remove ${children || "option"}`,
              ...removeProps
            },
            endElementCss,
            css: removeCss,
            selectProps,
            isFocused
          }
        )
      ]
    }
  );
};
var MultiValueContainer = (props) => {
  const { children, innerProps, css } = props;
  return /* @__PURE__ */ jsx(Span, { ...innerProps, css, children });
};
var MultiValueLabel = (props) => {
  const { children, innerProps, css } = props;
  return /* @__PURE__ */ jsx(Span, { ...innerProps, css, children });
};
var MultiValueRemove = (props) => {
  const { children, innerProps, isFocused, endElementCss, css } = props;
  return /* @__PURE__ */ jsx(Span, { css: endElementCss, ...innerProps, children: /* @__PURE__ */ jsx(
    Span,
    {
      role: "button",
      css,
      "data-focus-visible": isFocused ? true : void 0,
      children: children || /* @__PURE__ */ jsx(CloseIcon, {})
    }
  ) });
};
var Placeholder = (props) => {
  const {
    children,
    className,
    cx,
    innerProps,
    selectProps: { chakraStyles }
  } = props;
  const initialCss = {
    gridArea: "1 / 1 / 2 / 3",
    // Matches the color for the default placeholder styles from the Chakra theme
    // https://github.com/chakra-ui/chakra-ui/blob/080fb8a/packages/react/src/theme/global-css.ts#L49-L51
    color: "fg.muted/80",
    mx: "0.125rem",
    userSelect: "none"
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.placeholder) ? chakraStyles.placeholder(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      ...innerProps,
      className: cx(
        {
          placeholder: true
        },
        className
      ),
      css,
      children
    }
  );
};
var SingleValue = (props) => {
  const {
    children,
    className,
    cx,
    isDisabled,
    innerProps,
    selectProps: { chakraStyles }
  } = props;
  const initialCss = {
    gridArea: "1 / 1 / 2 / 3",
    mx: "0.125rem",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  };
  const css = (chakraStyles == null ? void 0 : chakraStyles.singleValue) ? chakraStyles.singleValue(initialCss, props) : initialCss;
  return /* @__PURE__ */ jsx(
    Box,
    {
      className: cx(
        {
          "single-value": true,
          "single-value--is-disabled": isDisabled
        },
        className
      ),
      css,
      ...innerProps,
      children
    }
  );
};

// src/chakra-components/index.ts
var chakraComponents = {
  ClearIndicator,
  Control,
  DropdownIndicator,
  Group,
  GroupHeading,
  IndicatorSeparator,
  IndicatorsContainer,
  Input,
  LoadingIndicator,
  LoadingMessage,
  Menu,
  MenuList,
  MultiValue,
  MultiValueContainer,
  MultiValueLabel,
  MultiValueRemove,
  NoOptionsMessage,
  Option,
  Placeholder,
  SelectContainer,
  SingleValue,
  ValueContainer
};
var chakra_components_default = chakraComponents;

// src/use-chakra-select-props.ts
var useChakraSelectProps = ({
  components = {},
  disabled,
  isDisabled,
  invalid,
  readOnly,
  required,
  inputId,
  selectedOptionStyle = "color",
  selectedOptionColorPalette = "blue",
  menuIsOpen,
  menuPlacement = "auto",
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  theme,
  ...props
}) => {
  var _a, _b, _c;
  const field = useFieldContext();
  const realReadOnly = readOnly != null ? readOnly : field == null ? void 0 : field.readOnly;
  const realMenuIsOpen = menuIsOpen != null ? menuIsOpen : realReadOnly ? false : void 0;
  let realSelectedOptionStyle = selectedOptionStyle;
  const selectedOptionStyleOptions = ["color", "check"];
  if (!selectedOptionStyleOptions.includes(selectedOptionStyle)) {
    realSelectedOptionStyle = "color";
  }
  let realSelectedOptionColorPalette = selectedOptionColorPalette || "blue";
  if (typeof realSelectedOptionColorPalette !== "string") {
    realSelectedOptionColorPalette = "blue";
  }
  const selectProps = {
    // Allow overriding of custom components
    components: {
      ...chakra_components_default,
      ...components
    },
    // Custom select props
    selectedOptionStyle: realSelectedOptionStyle,
    selectedOptionColorPalette: realSelectedOptionColorPalette,
    // Extract custom props from form control
    isDisabled: (_a = disabled != null ? disabled : isDisabled) != null ? _a : field == null ? void 0 : field.disabled,
    invalid: invalid != null ? invalid : field == null ? void 0 : field.invalid,
    inputId: inputId != null ? inputId : field == null ? void 0 : field.ids.control,
    readOnly: realReadOnly,
    required: (_b = required != null ? required : required) != null ? _b : field == null ? void 0 : field.required,
    menuIsOpen: realMenuIsOpen,
    menuPlacement,
    unstyled: true,
    ...props,
    // aria-invalid can be passed to react-select, so we allow that to
    // override the `isInvalid` prop
    "aria-invalid": (_c = props["aria-invalid"]) != null ? _c : field == null ? void 0 : field.invalid
  };
  return selectProps;
};
var use_chakra_select_props_default = useChakraSelectProps;
var Select = forwardRef(
  (props, ref) => {
    const chakraSelectProps = use_chakra_select_props_default(props);
    return /* @__PURE__ */ jsx(ReactSelect__default, { ref, ...chakraSelectProps });
  }
);
var select_default = Select;
var CreatableSelect = forwardRef(
  (props, ref) => {
    const chakraSelectProps = use_chakra_select_props_default(props);
    return /* @__PURE__ */ jsx(CreatableReactSelect, { ref, ...chakraSelectProps });
  }
);
var creatable_select_default = CreatableSelect;
var AsyncSelect = forwardRef(
  (props, ref) => {
    const chakraSelectProps = use_chakra_select_props_default(props);
    return /* @__PURE__ */ jsx(AsyncReactSelect, { ref, ...chakraSelectProps });
  }
);
var async_select_default = AsyncSelect;
var AsyncCreatableSelect = forwardRef(
  (props, ref) => {
    const chakraSelectProps = use_chakra_select_props_default(props);
    return /* @__PURE__ */ jsx(AsyncCreatableReactSelect, { ref, ...chakraSelectProps });
  }
);
var async_creatable_select_default = AsyncCreatableSelect;

export { async_creatable_select_default as AsyncCreatableSelect, async_select_default as AsyncSelect, creatable_select_default as CreatableSelect, select_default as Select, chakra_components_default as chakraComponents, use_chakra_select_props_default as useChakraSelectProps };
