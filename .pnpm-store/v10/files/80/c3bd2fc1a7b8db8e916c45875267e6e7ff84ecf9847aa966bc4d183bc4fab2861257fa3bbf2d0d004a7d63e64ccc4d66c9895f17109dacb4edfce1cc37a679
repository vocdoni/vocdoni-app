'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useScrollAreaContext = require('./use-scroll-area-context.cjs');
const useScrollAreaScrollbarContext = require('./use-scroll-area-scrollbar-context.cjs');

const splitScrollbarProps = createSplitProps.createSplitProps();
const ScrollAreaScrollbar = react.forwardRef((props, ref) => {
  const [scrollbarProps, localProps] = splitScrollbarProps(props, ["orientation"]);
  const scrollAreaApi = useScrollAreaContext.useScrollAreaContext();
  const mergedProps = react$1.mergeProps(scrollAreaApi.getScrollbarProps(scrollbarProps), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useScrollAreaScrollbarContext.ScrollAreaScrollbarProvider, { value: scrollbarProps, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
ScrollAreaScrollbar.displayName = "ScrollAreaScrollbar";

exports.ScrollAreaScrollbar = ScrollAreaScrollbar;
