'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useAngleSliderContext } from './use-angle-slider-context.js';

const splitMarkerProps = createSplitProps();
const AngleSliderMarker = forwardRef((props, ref) => {
  const [markerProps, localProps] = splitMarkerProps(props, ["value"]);
  const angleSlider = useAngleSliderContext();
  const mergedProps = mergeProps(angleSlider.getMarkerProps(markerProps), localProps);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
AngleSliderMarker.displayName = "AngleSliderMarker";

export { AngleSliderMarker };
