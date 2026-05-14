'use client';
import { jsx, Fragment } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useMarqueeContext } from './use-marquee-context.js';

const MarqueeContent = forwardRef((props, ref) => {
  const { children, ...localProps } = props;
  const marquee = useMarqueeContext();
  return /* @__PURE__ */ jsx(Fragment, { children: Array.from({ length: marquee.contentCount }).map((_, index) => {
    const mergedProps = mergeProps(marquee.getContentProps({ index }), localProps);
    return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref: index === 0 ? ref : void 0, children }, index);
  }) });
});
MarqueeContent.displayName = "MarqueeContent";

export { MarqueeContent };
