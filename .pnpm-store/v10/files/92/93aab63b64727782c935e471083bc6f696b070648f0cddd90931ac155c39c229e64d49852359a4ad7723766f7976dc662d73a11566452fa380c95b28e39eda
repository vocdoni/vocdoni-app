'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useImageCropperContext = require('./use-image-cropper-context.cjs');

const ImageCropperGrid = react.forwardRef((props, ref) => {
  const { axis, ...localProps } = props;
  const imageCropper = useImageCropperContext.useImageCropperContext();
  const mergedProps = react$1.mergeProps(imageCropper.getGridProps({ axis }), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref });
});
ImageCropperGrid.displayName = "ImageCropperGrid";

exports.ImageCropperGrid = ImageCropperGrid;
