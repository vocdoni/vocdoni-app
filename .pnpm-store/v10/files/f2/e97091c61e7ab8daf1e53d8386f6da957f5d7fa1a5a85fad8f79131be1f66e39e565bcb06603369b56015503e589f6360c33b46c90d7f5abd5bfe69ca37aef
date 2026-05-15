'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const checkbox_anatomy = require('./checkbox.anatomy.cjs');
const useCheckboxGroupContext = require('./use-checkbox-group-context.cjs');

const splitProviderProps = createSplitProps.createSplitProps();
const CheckboxGroupProvider = react.forwardRef((props, ref) => {
  const [localProps, restProps] = splitProviderProps(props, ["value"]);
  return /* @__PURE__ */ jsxRuntime.jsx(useCheckboxGroupContext.CheckboxGroupContextProvider, { value: localProps.value, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ref, role: "group", ...restProps, ...checkbox_anatomy.checkboxAnatomy.build().group.attrs }) });
});
CheckboxGroupProvider.displayName = "CheckboxGroupProvider";

exports.CheckboxGroupProvider = CheckboxGroupProvider;
