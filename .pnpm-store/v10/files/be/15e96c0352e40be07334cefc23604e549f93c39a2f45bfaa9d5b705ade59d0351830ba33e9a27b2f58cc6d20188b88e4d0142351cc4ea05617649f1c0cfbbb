'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useImageCropperContext = require('./use-image-cropper-context.cjs');

const splitRootProviderProps = createSplitProps.createSplitProps();
const ImageCropperRootProvider = react.forwardRef((props, ref) => {
  const [{ value: imageCropper }, localProps] = splitRootProviderProps(props, ["value"]);
  const mergedProps = react$1.mergeProps(imageCropper.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useImageCropperContext.ImageCropperProvider, { value: imageCropper, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
ImageCropperRootProvider.displayName = "ImageCropperRootProvider";

exports.ImageCropperRootProvider = ImageCropperRootProvider;
