'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useBottomSheetContext } from './use-bottom-sheet-context.js';

const BottomSheetCloseTrigger = forwardRef((props, ref) => {
  const bottomSheet = useBottomSheetContext();
  const mergedProps = mergeProps(bottomSheet.getCloseTriggerProps(), props);
  return /* @__PURE__ */ jsx(ark.button, { ...mergedProps, ref });
});
BottomSheetCloseTrigger.displayName = "BottomSheetCloseTrigger";

export { BottomSheetCloseTrigger };
