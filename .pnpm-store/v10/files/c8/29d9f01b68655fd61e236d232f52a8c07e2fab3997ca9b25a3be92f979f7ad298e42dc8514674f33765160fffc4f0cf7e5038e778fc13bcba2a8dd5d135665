'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { SliderProvider } from './use-slider-context.js';

const splitRootProviderProps = createSplitProps();
const SliderRootProvider = forwardRef((props, ref) => {
  const [{ value: slider }, localProps] = splitRootProviderProps(props, ["value"]);
  const mergedProps = mergeProps(slider.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(SliderProvider, { value: slider, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
SliderRootProvider.displayName = "SliderRootProvider";

export { SliderRootProvider };
