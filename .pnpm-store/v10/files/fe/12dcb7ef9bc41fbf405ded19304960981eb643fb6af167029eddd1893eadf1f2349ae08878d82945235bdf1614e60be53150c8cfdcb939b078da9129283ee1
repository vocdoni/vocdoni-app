'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { ImageCropperProvider } from './use-image-cropper-context.js';

const splitRootProviderProps = createSplitProps();
const ImageCropperRootProvider = forwardRef((props, ref) => {
  const [{ value: imageCropper }, localProps] = splitRootProviderProps(props, ["value"]);
  const mergedProps = mergeProps(imageCropper.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(ImageCropperProvider, { value: imageCropper, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
ImageCropperRootProvider.displayName = "ImageCropperRootProvider";

export { ImageCropperRootProvider };
