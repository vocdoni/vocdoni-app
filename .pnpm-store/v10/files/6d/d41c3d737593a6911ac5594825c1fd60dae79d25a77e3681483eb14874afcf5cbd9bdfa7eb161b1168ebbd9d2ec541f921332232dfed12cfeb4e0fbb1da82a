'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useScrollArea } from './use-scroll-area.js';
import { ScrollAreaProvider } from './use-scroll-area-context.js';

const splitRootProps = createSplitProps();
const ScrollAreaRoot = forwardRef((props, ref) => {
  const [useScrollAreaProps, localProps] = splitRootProps(props, ["id", "ids"]);
  const scrollArea = useScrollArea(useScrollAreaProps);
  const mergedProps = mergeProps(scrollArea.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(ScrollAreaProvider, { value: scrollArea, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
ScrollAreaRoot.displayName = "ScrollAreaRoot";

export { ScrollAreaRoot };
