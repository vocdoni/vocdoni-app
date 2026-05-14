'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useMarquee } from './use-marquee.js';
import { MarqueeProvider } from './use-marquee-context.js';

const splitRootProps = createSplitProps();
const MarqueeRoot = forwardRef((props, ref) => {
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
  const marqueeApi = useMarquee(useMarqueeProps);
  const mergedProps = mergeProps(marqueeApi.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(MarqueeProvider, { value: marqueeApi, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
MarqueeRoot.displayName = "MarqueeRoot";

export { MarqueeRoot };
