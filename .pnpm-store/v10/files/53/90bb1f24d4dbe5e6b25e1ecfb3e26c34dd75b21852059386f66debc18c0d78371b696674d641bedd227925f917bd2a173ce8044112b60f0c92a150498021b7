'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { composeRefs } from '../../utils/compose-refs.js';
import { ark } from '../factory.js';
import { usePresenceContext } from '../presence/use-presence-context.js';
import { useBottomSheetContext } from './use-bottom-sheet-context.js';
import { createSplitProps } from '../../utils/create-split-props.js';

const splitContentProps = createSplitProps();
const BottomSheetContent = forwardRef((props, ref) => {
  const [contentProps, localProps] = splitContentProps(props, ["draggable"]);
  const bottomSheet = useBottomSheetContext();
  const presence = usePresenceContext();
  const mergedProps = mergeProps(
    bottomSheet.getContentProps({ draggable: true, ...contentProps }),
    presence.getPresenceProps(),
    localProps
  );
  if (presence.unmounted) {
    return null;
  }
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref: composeRefs(presence.ref, ref) });
});
BottomSheetContent.displayName = "BottomSheetContent";

export { BottomSheetContent };
