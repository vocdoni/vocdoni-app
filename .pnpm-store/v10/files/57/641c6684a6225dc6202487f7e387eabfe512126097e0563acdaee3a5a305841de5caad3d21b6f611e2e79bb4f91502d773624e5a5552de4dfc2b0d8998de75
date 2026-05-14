'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useBottomSheetContext } from './use-bottom-sheet-context.js';

const BottomSheetTitle = forwardRef((props, ref) => {
  const bottomSheet = useBottomSheetContext();
  const mergedProps = mergeProps(bottomSheet.getTitleProps(), props);
  return /* @__PURE__ */ jsx(ark.h2, { ...mergedProps, ref });
});
BottomSheetTitle.displayName = "BottomSheetTitle";

export { BottomSheetTitle };
