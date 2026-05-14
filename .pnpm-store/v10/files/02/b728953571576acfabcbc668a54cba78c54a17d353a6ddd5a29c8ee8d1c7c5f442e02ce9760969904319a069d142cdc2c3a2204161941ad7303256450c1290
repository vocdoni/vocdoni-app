'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useColorPickerContext } from './use-color-picker-context.js';
import { ColorPickerSwatchPropsProvider } from './use-color-picker-swatch-props-context.js';

const splitSwatchProps = createSplitProps();
const ColorPickerSwatch = forwardRef((props, ref) => {
  const [swatwchProps, localProps] = splitSwatchProps(props, ["respectAlpha", "value"]);
  const colorPicker = useColorPickerContext();
  const mergedProps = mergeProps(colorPicker.getSwatchProps(swatwchProps), localProps);
  return /* @__PURE__ */ jsx(ColorPickerSwatchPropsProvider, { value: swatwchProps, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
ColorPickerSwatch.displayName = "ColorPickerSwatch";

export { ColorPickerSwatch };
