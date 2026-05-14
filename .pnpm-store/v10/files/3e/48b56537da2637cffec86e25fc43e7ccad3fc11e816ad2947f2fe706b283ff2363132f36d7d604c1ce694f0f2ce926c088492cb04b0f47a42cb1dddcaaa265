'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useSliderContext } from './use-slider-context.js';

const splitMarkerProps = createSplitProps();
const SliderMarker = forwardRef((props, ref) => {
  const [markerProps, localProps] = splitMarkerProps(props, ["value"]);
  const slider = useSliderContext();
  const mergedProps = mergeProps(slider.getMarkerProps(markerProps), localProps);
  return /* @__PURE__ */ jsx(ark.span, { ...mergedProps, ref });
});
SliderMarker.displayName = "SliderMarker";

export { SliderMarker };
