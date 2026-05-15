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
const useFileUploadItemPropsContext = require('./use-file-upload-item-props-context.cjs');

const splitItemBaseProps = createSplitProps.createSplitProps();
const FileUploadItem = react.forwardRef((props, ref) => {
  const [itemProps, localProps] = splitItemBaseProps(props, ["file"]);
  const fileUpload = useFileUploadContext.useFileUploadContext();
  const itemGroupProps = useFileUploadItemGroupPropsContext.useFileUploadItemGroupPropsContext();
  const itemPropsWithType = { ...itemProps, type: itemGroupProps.type };
  const mergedProps = react$1.mergeProps(fileUpload.getItemProps(itemPropsWithType), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useFileUploadItemPropsContext.FileUploadItemPropsProvider, { value: itemPropsWithType, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.li, { ...mergedProps, ref }) });
});
FileUploadItem.displayName = "FileUploadItem";

exports.FileUploadItem = FileUploadItem;
