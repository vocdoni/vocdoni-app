'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useComboboxContext = require('./use-combobox-context.cjs');

const splitTriggerProps = createSplitProps.createSplitProps();
const ComboboxTrigger = react.forwardRef((props, ref) => {
  const [triggerProps, localProps] = splitTriggerProps(props, ["focusable"]);
  const combobox = useComboboxContext.useComboboxContext();
  const mergedProps = react$1.mergeProps(combobox.getTriggerProps(triggerProps), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.button, { ...mergedProps, ref });
});
ComboboxTrigger.displayName = "ComboboxTrigger";

exports.ComboboxTrigger = ComboboxTrigger;
