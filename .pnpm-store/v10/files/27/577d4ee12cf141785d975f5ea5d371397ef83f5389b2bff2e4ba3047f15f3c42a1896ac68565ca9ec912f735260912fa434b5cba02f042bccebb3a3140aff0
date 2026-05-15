'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useMarqueeContext } from './use-marquee-context.js';

const splitEdgeProps = createSplitProps();
const MarqueeEdge = forwardRef((props, ref) => {
  const [edgeProps, localProps] = splitEdgeProps(props, ["side"]);
  const marquee = useMarqueeContext();
  const mergedProps = mergeProps(marquee.getEdgeProps(edgeProps), localProps);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
MarqueeEdge.displayName = "MarqueeEdge";

export { MarqueeEdge };
