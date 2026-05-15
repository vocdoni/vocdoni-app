'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useBottomSheetContext } from './use-bottom-sheet-context.js';

const BottomSheetGrabber = forwardRef((props, ref) => {
  const bottomSheet = useBottomSheetContext();
  const mergedProps = mergeProps(bottomSheet.getGrabberProps(), props);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
BottomSheetGrabber.displayName = "BottomSheetGrabber";

export { BottomSheetGrabber };
