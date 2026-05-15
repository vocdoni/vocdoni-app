'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const utils = require('@zag-js/utils');
const react = require('react');
const factory = require('../factory.cjs');
const useDatePickerContext = require('./use-date-picker-context.cjs');

const DatePickerRangeText = react.forwardRef((props, ref) => {
  const datePicker = useDatePickerContext.useDatePickerContext();
  const mergedProps = react$1.mergeProps(datePicker.getRangeTextProps(), props);
  const visibleRangeText = react.useMemo(() => {
    const { start, end } = datePicker.visibleRangeText;
    return utils.uniq([start, end]).filter(Boolean).join(" - ");
  }, [datePicker.visibleRangeText]);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref, children: visibleRangeText });
});
DatePickerRangeText.displayName = "DatePickerRangeText";

exports.DatePickerRangeText = DatePickerRangeText;
