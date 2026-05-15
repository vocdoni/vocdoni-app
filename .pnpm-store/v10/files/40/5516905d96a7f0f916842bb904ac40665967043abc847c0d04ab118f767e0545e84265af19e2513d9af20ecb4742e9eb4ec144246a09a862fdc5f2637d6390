'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useImageCropperContext } from './use-image-cropper-context.js';

const ImageCropperSelection = forwardRef((props, ref) => {
  const imageCropper = useImageCropperContext();
  const mergedProps = mergeProps(imageCropper.getSelectionProps(), props);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
ImageCropperSelection.displayName = "ImageCropperSelection";

export { ImageCropperSelection };
