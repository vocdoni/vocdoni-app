'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useProgressContext } from './use-progress-context.js';

const splitViewProps = createSplitProps();
const ProgressView = forwardRef((props, ref) => {
  const [viewProps, localProps] = splitViewProps(props, ["state"]);
  const progress = useProgressContext();
  const mergedProps = mergeProps(progress.getViewProps(viewProps), localProps);
  return /* @__PURE__ */ jsx(ark.span, { ...mergedProps, ref });
});
ProgressView.displayName = "ProgressView";

export { ProgressView };
