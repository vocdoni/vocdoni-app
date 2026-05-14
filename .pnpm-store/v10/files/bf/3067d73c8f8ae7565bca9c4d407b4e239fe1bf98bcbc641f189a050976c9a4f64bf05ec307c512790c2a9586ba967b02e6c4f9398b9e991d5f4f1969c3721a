'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useScrollAreaContext } from './use-scroll-area-context.js';
import { useScrollAreaScrollbarContext } from './use-scroll-area-scrollbar-context.js';

const ScrollAreaThumb = forwardRef((props, ref) => {
  const scrollAreaApi = useScrollAreaContext();
  const scrollbarProps = useScrollAreaScrollbarContext();
  const mergedProps = mergeProps(scrollAreaApi.getThumbProps(scrollbarProps), props);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
ScrollAreaThumb.displayName = "ScrollAreaThumb";

export { ScrollAreaThumb };
