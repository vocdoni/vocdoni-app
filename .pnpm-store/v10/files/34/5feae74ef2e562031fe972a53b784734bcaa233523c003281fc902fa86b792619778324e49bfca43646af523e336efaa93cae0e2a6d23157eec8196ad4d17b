'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useFileUploadContext } from './use-file-upload-context.js';
import { FileUploadItemGroupPropsProvider } from './use-file-upload-item-group-props-context.js';

const splitItemGroupProps = createSplitProps();
const FileUploadItemGroup = forwardRef((props, ref) => {
  const [itemGroupProps, localProps] = splitItemGroupProps(props, ["type"]);
  const fileUpload = useFileUploadContext();
  const mergedProps = mergeProps(fileUpload.getItemGroupProps(itemGroupProps), localProps);
  return /* @__PURE__ */ jsx(FileUploadItemGroupPropsProvider, { value: itemGroupProps, children: /* @__PURE__ */ jsx(ark.ul, { ...mergedProps, ref }) });
});
FileUploadItemGroup.displayName = "FileUploadItemGroup";

export { FileUploadItemGroup };
