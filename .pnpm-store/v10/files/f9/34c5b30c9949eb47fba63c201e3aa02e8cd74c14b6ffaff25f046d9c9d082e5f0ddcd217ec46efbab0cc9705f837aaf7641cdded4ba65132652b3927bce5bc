'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useScrollAreaContext = require('./use-scroll-area-context.cjs');

const ScrollAreaViewport = react.forwardRef((props, ref) => {
  const scrollArea = useScrollAreaContext.useScrollAreaContext();
  const mergedProps = react$1.mergeProps(scrollArea.getViewportProps(), props);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref });
});
ScrollAreaViewport.displayName = "ScrollAreaViewport";

exports.ScrollAreaViewport = ScrollAreaViewport;
