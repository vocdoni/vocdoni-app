'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useImageCropperContext = require('./use-image-cropper-context.cjs');

const ImageCropperSelection = react.forwardRef((props, ref) => {
  const imageCropper = useImageCropperContext.useImageCropperContext();
  const mergedProps = react$1.mergeProps(imageCropper.getSelectionProps(), props);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref });
});
ImageCropperSelection.displayName = "ImageCropperSelection";

exports.ImageCropperSelection = ImageCropperSelection;
