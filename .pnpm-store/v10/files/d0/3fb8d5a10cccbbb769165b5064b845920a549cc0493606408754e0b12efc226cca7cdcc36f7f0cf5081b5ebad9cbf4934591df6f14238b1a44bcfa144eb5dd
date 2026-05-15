'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useSplitterContext } from './use-splitter-context.js';
import { useSplitterResizeTriggerPropsContext } from './use-splitter-resize-trigger-props-context.js';

const SplitterResizeTriggerIndicator = forwardRef(
  (props, ref) => {
    const splitter = useSplitterContext();
    const triggerProps = useSplitterResizeTriggerPropsContext();
    const mergedProps = mergeProps(splitter.getResizeTriggerIndicator(triggerProps), props);
    return /* @__PURE__ */ jsx(ark.div, { ref, ...mergedProps });
  }
);
SplitterResizeTriggerIndicator.displayName = "SplitterResizeTriggerIndicator";

export { SplitterResizeTriggerIndicator };
