'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useImageCropper = require('./use-image-cropper.cjs');
const useImageCropperContext = require('./use-image-cropper-context.cjs');

const splitRootProps = createSplitProps.createSplitProps();
const ImageCropperRoot = react.forwardRef((props, ref) => {
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
  const imageCropper = useImageCropper.useImageCropper(useImageCropperProps);
  const mergedProps = react$1.mergeProps(imageCropper.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useImageCropperContext.ImageCropperProvider, { value: imageCropper, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
ImageCropperRoot.displayName = "ImageCropperRoot";

exports.ImageCropperRoot = ImageCropperRoot;
