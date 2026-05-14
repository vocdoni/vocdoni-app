'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useScrollAreaContext } from './use-scroll-area-context.js';

const ScrollAreaCorner = forwardRef((props, ref) => {
  const scrollArea = useScrollAreaContext();
  const mergedProps = mergeProps(scrollArea.getCornerProps(), props);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
ScrollAreaCorner.displayName = "ScrollAreaCorner";

export { ScrollAreaCorner };
