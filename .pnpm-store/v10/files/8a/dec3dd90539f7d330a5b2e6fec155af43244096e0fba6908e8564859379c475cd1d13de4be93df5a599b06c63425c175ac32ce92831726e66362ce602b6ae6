'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useMarqueeContext = require('./use-marquee-context.cjs');

const splitEdgeProps = createSplitProps.createSplitProps();
const MarqueeEdge = react.forwardRef((props, ref) => {
  const [edgeProps, localProps] = splitEdgeProps(props, ["side"]);
  const marquee = useMarqueeContext.useMarqueeContext();
  const mergedProps = react$1.mergeProps(marquee.getEdgeProps(edgeProps), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref });
});
MarqueeEdge.displayName = "MarqueeEdge";

exports.MarqueeEdge = MarqueeEdge;
