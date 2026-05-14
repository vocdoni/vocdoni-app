'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useBottomSheetContext = require('./use-bottom-sheet-context.cjs');

const BottomSheetGrabber = react.forwardRef((props, ref) => {
  const bottomSheet = useBottomSheetContext.useBottomSheetContext();
  const mergedProps = react$1.mergeProps(bottomSheet.getGrabberProps(), props);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref });
});
BottomSheetGrabber.displayName = "BottomSheetGrabber";

exports.BottomSheetGrabber = BottomSheetGrabber;
