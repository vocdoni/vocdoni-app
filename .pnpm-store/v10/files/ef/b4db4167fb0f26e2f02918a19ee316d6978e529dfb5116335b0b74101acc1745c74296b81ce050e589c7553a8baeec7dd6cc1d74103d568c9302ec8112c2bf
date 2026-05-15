'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useImageCropperContext = require('./use-image-cropper-context.cjs');

const ImageCropperImage = react.forwardRef((props, ref) => {
  const imageCropper = useImageCropperContext.useImageCropperContext();
  const mergedProps = react$1.mergeProps(imageCropper.getImageProps(), props);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.img, { ...mergedProps, ref });
});
ImageCropperImage.displayName = "ImageCropperImage";

exports.ImageCropperImage = ImageCropperImage;
