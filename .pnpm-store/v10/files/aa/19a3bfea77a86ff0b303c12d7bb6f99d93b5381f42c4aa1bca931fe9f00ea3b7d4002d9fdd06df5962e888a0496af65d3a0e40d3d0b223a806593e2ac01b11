'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useFloatingPanelContext } from './use-floating-panel-context.js';

const splitStageTriggerProps = createSplitProps();
const FloatingPanelStageTrigger = forwardRef((props, ref) => {
  const [stage, localProps] = splitStageTriggerProps(props, ["stage"]);
  const floatingPanel = useFloatingPanelContext();
  const mergedProps = mergeProps(floatingPanel.getStageTriggerProps(stage), localProps);
  return /* @__PURE__ */ jsx(ark.button, { ...mergedProps, ref });
});
FloatingPanelStageTrigger.displayName = "FloatingPanelStageTrigger";

export { FloatingPanelStageTrigger };
