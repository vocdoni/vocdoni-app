'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useImageCropperContext } from './use-image-cropper-context.js';

const ImageCropperHandle = forwardRef((props, ref) => {
  const { position, ...localProps } = props;
  const imageCropper = useImageCropperContext();
  const mergedProps = mergeProps(imageCropper.getHandleProps({ position }), localProps);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
ImageCropperHandle.displayName = "ImageCropperHandle";

export { ImageCropperHandle };
