'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { composeRefs } from '../../utils/compose-refs.js';
import { useRenderStrategyPropsContext } from '../../utils/render-strategy.js';
import { ark } from '../factory.js';
import { usePresence } from '../presence/use-presence.js';
import { useBottomSheetContext } from './use-bottom-sheet-context.js';

const BottomSheetBackdrop = forwardRef((props, ref) => {
  const bottomSheet = useBottomSheetContext();
  const renderStrategyProps = useRenderStrategyPropsContext();
  const presence = usePresence({ ...renderStrategyProps, present: bottomSheet.open });
  const mergedProps = mergeProps(bottomSheet.getBackdropProps(), presence.getPresenceProps(), props);
  if (presence.unmounted) {
    return null;
  }
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref: composeRefs(presence.ref, ref) });
});
BottomSheetBackdrop.displayName = "BottomSheetBackdrop";

export { BottomSheetBackdrop };
