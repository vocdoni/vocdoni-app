'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { MarqueeProvider } from './use-marquee-context.js';

const splitRootProviderProps = createSplitProps();
const MarqueeRootProvider = forwardRef((props, ref) => {
  const [{ value: marquee }, localProps] = splitRootProviderProps(props, ["value"]);
  const mergedProps = mergeProps(marquee.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(MarqueeProvider, { value: marquee, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
MarqueeRootProvider.displayName = "MarqueeRootProvider";

export { MarqueeRootProvider };
