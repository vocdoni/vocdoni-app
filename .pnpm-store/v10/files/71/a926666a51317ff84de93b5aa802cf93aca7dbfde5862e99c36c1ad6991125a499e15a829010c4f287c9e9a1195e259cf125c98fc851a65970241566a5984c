'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { usePresenceContext } from '../presence/use-presence-context.js';
import { useBottomSheetContext } from './use-bottom-sheet-context.js';

const BottomSheetTrigger = forwardRef((props, ref) => {
  const bottomSheet = useBottomSheetContext();
  const presence = usePresenceContext();
  const mergedProps = mergeProps(
    {
      ...bottomSheet.getTriggerProps(),
      "aria-controls": presence.unmounted ? void 0 : bottomSheet.getTriggerProps()["aria-controls"]
    },
    props
  );
  return /* @__PURE__ */ jsx(ark.button, { ...mergedProps, ref });
});
BottomSheetTrigger.displayName = "BottomSheetTrigger";

export { BottomSheetTrigger };
