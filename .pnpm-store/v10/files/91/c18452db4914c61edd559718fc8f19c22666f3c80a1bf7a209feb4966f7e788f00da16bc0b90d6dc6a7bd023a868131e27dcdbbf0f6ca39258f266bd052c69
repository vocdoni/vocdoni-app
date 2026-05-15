'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useMarqueeContext = require('./use-marquee-context.cjs');

const splitRootProviderProps = createSplitProps.createSplitProps();
const MarqueeRootProvider = react.forwardRef((props, ref) => {
  const [{ value: marquee }, localProps] = splitRootProviderProps(props, ["value"]);
  const mergedProps = react$1.mergeProps(marquee.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useMarqueeContext.MarqueeProvider, { value: marquee, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
MarqueeRootProvider.displayName = "MarqueeRootProvider";

exports.MarqueeRootProvider = MarqueeRootProvider;
