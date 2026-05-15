'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useFileUploadContext } from './use-file-upload-context.js';
import { useFileUploadItemGroupPropsContext } from './use-file-upload-item-group-props-context.js';
import { FileUploadItemPropsProvider } from './use-file-upload-item-props-context.js';

const splitItemBaseProps = createSplitProps();
const FileUploadItem = forwardRef((props, ref) => {
  const [itemProps, localProps] = splitItemBaseProps(props, ["file"]);
  const fileUpload = useFileUploadContext();
  const itemGroupProps = useFileUploadItemGroupPropsContext();
  const itemPropsWithType = { ...itemProps, type: itemGroupProps.type };
  const mergedProps = mergeProps(fileUpload.getItemProps(itemPropsWithType), localProps);
  return /* @__PURE__ */ jsx(FileUploadItemPropsProvider, { value: itemPropsWithType, children: /* @__PURE__ */ jsx(ark.li, { ...mergedProps, ref }) });
});
FileUploadItem.displayName = "FileUploadItem";

export { FileUploadItem };
