'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useScrollArea = require('./use-scroll-area.cjs');
const useScrollAreaContext = require('./use-scroll-area-context.cjs');

const splitRootProps = createSplitProps.createSplitProps();
const ScrollAreaRoot = react.forwardRef((props, ref) => {
  const [useScrollAreaProps, localProps] = splitRootProps(props, ["id", "ids"]);
  const scrollArea = useScrollArea.useScrollArea(useScrollAreaProps);
  const mergedProps = react$1.mergeProps(scrollArea.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useScrollAreaContext.ScrollAreaProvider, { value: scrollArea, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
ScrollAreaRoot.displayName = "ScrollAreaRoot";

exports.ScrollAreaRoot = ScrollAreaRoot;
