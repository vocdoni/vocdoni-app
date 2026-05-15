'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { ScrollAreaProvider } from './use-scroll-area-context.js';

const splitRootProviderProps = createSplitProps();
const ScrollAreaRootProvider = forwardRef((props, ref) => {
  const [{ value: scrollArea }, localProps] = splitRootProviderProps(props, ["value"]);
  const mergedProps = mergeProps(scrollArea.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(ScrollAreaProvider, { value: scrollArea, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
ScrollAreaRootProvider.displayName = "ScrollAreaRootProvider";

export { ScrollAreaRootProvider };
