'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useImageCropper } from './use-image-cropper.js';
import { ImageCropperProvider } from './use-image-cropper-context.js';

const splitRootProps = createSplitProps();
const ImageCropperRoot = forwardRef((props, ref) => {
  const [useImageCropperProps, localProps] = splitRootProps(props, [
    "aspectRatio",
    "cropShape",
    "defaultFlip",
    "defaultRotation",
    "defaultZoom",
    "fixedCropArea",
    "flip",
    "id",
    "ids",
    "initialCrop",
    "maxHeight",
    "maxWidth",
    "maxZoom",
    "minHeight",
    "minWidth",
    "minZoom",
    "nudgeStep",
    "nudgeStepCtrl",
    "nudgeStepShift",
    "onCropChange",
    "onFlipChange",
    "onRotationChange",
    "onZoomChange",
    "rotation",
    "translations",
    "zoom",
    "zoomSensitivity",
    "zoomStep"
  ]);
  const imageCropper = useImageCropper(useImageCropperProps);
  const mergedProps = mergeProps(imageCropper.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(ImageCropperProvider, { value: imageCropper, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
ImageCropperRoot.displayName = "ImageCropperRoot";

export { ImageCropperRoot };
