'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useMarqueeContext = require('./use-marquee-context.cjs');

const MarqueeContent = react.forwardRef((props, ref) => {
  const { children, ...localProps } = props;
  const marquee = useMarqueeContext.useMarqueeContext();
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: Array.from({ length: marquee.contentCount }).map((_, index) => {
    const mergedProps = react$1.mergeProps(marquee.getContentProps({ index }), localProps);
    return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref: index === 0 ? ref : void 0, children }, index);
  }) });
});
MarqueeContent.displayName = "MarqueeContent";

exports.MarqueeContent = MarqueeContent;
