'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useMarquee = require('./use-marquee.cjs');
const useMarqueeContext = require('./use-marquee-context.cjs');

const splitRootProps = createSplitProps.createSplitProps();
const MarqueeRoot = react.forwardRef((props, ref) => {
  const [useMarqueeProps, localProps] = splitRootProps(props, [
    "autoFill",
    "defaultPaused",
    "delay",
    "id",
    "ids",
    "loopCount",
    "onComplete",
    "onLoopComplete",
    "onPauseChange",
    "paused",
    "pauseOnInteraction",
    "reverse",
    "side",
    "spacing",
    "speed",
    "translations"
  ]);
  const marqueeApi = useMarquee.useMarquee(useMarqueeProps);
  const mergedProps = react$1.mergeProps(marqueeApi.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useMarqueeContext.MarqueeProvider, { value: marqueeApi, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
MarqueeRoot.displayName = "MarqueeRoot";

exports.MarqueeRoot = MarqueeRoot;
