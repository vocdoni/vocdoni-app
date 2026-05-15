'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useFileUpload = require('./use-file-upload.cjs');
const useFileUploadContext = require('./use-file-upload-context.cjs');

const splitRootProps = createSplitProps.createSplitProps();
const FileUploadRoot = react.forwardRef((props, ref) => {
  const [useFileUploadProps, localProps] = splitRootProps(props, [
    "accept",
    "acceptedFiles",
    "allowDrop",
    "capture",
    "defaultAcceptedFiles",
    "directory",
    "disabled",
    "id",
    "ids",
    "invalid",
    "locale",
    "maxFiles",
    "maxFileSize",
    "minFileSize",
    "name",
    "onFileAccept",
    "onFileChange",
    "onFileReject",
    "preventDocumentDrop",
    "required",
    "translations",
    "transformFiles",
    "validate"
  ]);
  const fileUpload = useFileUpload.useFileUpload(useFileUploadProps);
  const mergedProps = react$1.mergeProps(fileUpload.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useFileUploadContext.FileUploadProvider, { value: fileUpload, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
FileUploadRoot.displayName = "FileUploadRoot";

exports.FileUploadRoot = FileUploadRoot;
