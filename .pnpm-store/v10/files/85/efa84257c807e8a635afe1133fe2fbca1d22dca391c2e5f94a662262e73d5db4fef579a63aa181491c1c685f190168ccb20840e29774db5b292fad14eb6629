'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useScrollAreaContext } from './use-scroll-area-context.js';
import { ScrollAreaScrollbarProvider } from './use-scroll-area-scrollbar-context.js';

const splitScrollbarProps = createSplitProps();
const ScrollAreaScrollbar = forwardRef((props, ref) => {
  const [scrollbarProps, localProps] = splitScrollbarProps(props, ["orientation"]);
  const scrollAreaApi = useScrollAreaContext();
  const mergedProps = mergeProps(scrollAreaApi.getScrollbarProps(scrollbarProps), localProps);
  return /* @__PURE__ */ jsx(ScrollAreaScrollbarProvider, { value: scrollbarProps, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
ScrollAreaScrollbar.displayName = "ScrollAreaScrollbar";

export { ScrollAreaScrollbar };
