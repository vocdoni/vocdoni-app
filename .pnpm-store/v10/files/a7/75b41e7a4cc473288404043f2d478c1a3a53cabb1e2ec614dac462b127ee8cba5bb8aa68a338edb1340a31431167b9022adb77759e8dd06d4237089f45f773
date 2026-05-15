'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useMarqueeContext } from './use-marquee-context.js';

const MarqueeItem = forwardRef((props, ref) => {
  const marquee = useMarqueeContext();
  const mergedProps = mergeProps(marquee.getItemProps(), props);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
MarqueeItem.displayName = "MarqueeItem";

export { MarqueeItem };
