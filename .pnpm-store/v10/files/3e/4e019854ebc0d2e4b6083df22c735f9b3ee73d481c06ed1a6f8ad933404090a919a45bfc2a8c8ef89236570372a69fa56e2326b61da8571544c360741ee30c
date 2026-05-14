'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useBottomSheetContext = require('./use-bottom-sheet-context.cjs');

const BottomSheetTitle = react.forwardRef((props, ref) => {
  const bottomSheet = useBottomSheetContext.useBottomSheetContext();
  const mergedProps = react$1.mergeProps(bottomSheet.getTitleProps(), props);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.h2, { ...mergedProps, ref });
});
BottomSheetTitle.displayName = "BottomSheetTitle";

exports.BottomSheetTitle = BottomSheetTitle;
