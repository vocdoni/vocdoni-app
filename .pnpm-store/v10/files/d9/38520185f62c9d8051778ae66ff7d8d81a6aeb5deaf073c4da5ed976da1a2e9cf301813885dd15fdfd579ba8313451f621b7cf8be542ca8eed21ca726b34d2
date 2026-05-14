'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useFileUploadContext = require('./use-file-upload-context.cjs');
const useFileUploadItemGroupPropsContext = require('./use-file-upload-item-group-props-context.cjs');

const splitItemGroupProps = createSplitProps.createSplitProps();
const FileUploadItemGroup = react.forwardRef((props, ref) => {
  const [itemGroupProps, localProps] = splitItemGroupProps(props, ["type"]);
  const fileUpload = useFileUploadContext.useFileUploadContext();
  const mergedProps = react$1.mergeProps(fileUpload.getItemGroupProps(itemGroupProps), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useFileUploadItemGroupPropsContext.FileUploadItemGroupPropsProvider, { value: itemGroupProps, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.ul, { ...mergedProps, ref }) });
});
FileUploadItemGroup.displayName = "FileUploadItemGroup";

exports.FileUploadItemGroup = FileUploadItemGroup;
