'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useImageCropperContext } from './use-image-cropper-context.js';

const ImageCropperGrid = forwardRef((props, ref) => {
  const { axis, ...localProps } = props;
  const imageCropper = useImageCropperContext();
  const mergedProps = mergeProps(imageCropper.getGridProps({ axis }), localProps);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
ImageCropperGrid.displayName = "ImageCropperGrid";

export { ImageCropperGrid };
