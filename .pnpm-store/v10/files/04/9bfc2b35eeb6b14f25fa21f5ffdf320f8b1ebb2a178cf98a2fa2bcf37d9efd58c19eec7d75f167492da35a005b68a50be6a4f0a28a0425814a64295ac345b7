'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useScrollAreaContext = require('./use-scroll-area-context.cjs');

const splitRootProviderProps = createSplitProps.createSplitProps();
const ScrollAreaRootProvider = react.forwardRef((props, ref) => {
  const [{ value: scrollArea }, localProps] = splitRootProviderProps(props, ["value"]);
  const mergedProps = react$1.mergeProps(scrollArea.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useScrollAreaContext.ScrollAreaProvider, { value: scrollArea, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
ScrollAreaRootProvider.displayName = "ScrollAreaRootProvider";

exports.ScrollAreaRootProvider = ScrollAreaRootProvider;
