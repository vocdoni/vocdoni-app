'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useMarqueeContext = require('./use-marquee-context.cjs');

const MarqueeViewport = react.forwardRef((props, ref) => {
  const marquee = useMarqueeContext.useMarqueeContext();
  const mergedProps = react$1.mergeProps(marquee.getViewportProps(), props);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref });
});
MarqueeViewport.displayName = "MarqueeViewport";

exports.MarqueeViewport = MarqueeViewport;
