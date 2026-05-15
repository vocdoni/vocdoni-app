'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useScrollAreaContext = require('./use-scroll-area-context.cjs');
const useScrollAreaScrollbarContext = require('./use-scroll-area-scrollbar-context.cjs');

const ScrollAreaThumb = react.forwardRef((props, ref) => {
  const scrollAreaApi = useScrollAreaContext.useScrollAreaContext();
  const scrollbarProps = useScrollAreaScrollbarContext.useScrollAreaScrollbarContext();
  const mergedProps = react$1.mergeProps(scrollAreaApi.getThumbProps(scrollbarProps), props);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref });
});
ScrollAreaThumb.displayName = "ScrollAreaThumb";

exports.ScrollAreaThumb = ScrollAreaThumb;
