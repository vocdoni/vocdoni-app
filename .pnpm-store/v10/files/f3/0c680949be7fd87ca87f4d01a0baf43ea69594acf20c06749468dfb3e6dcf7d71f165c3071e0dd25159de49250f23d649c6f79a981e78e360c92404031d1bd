'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useComboboxContext } from './use-combobox-context.js';

const splitTriggerProps = createSplitProps();
const ComboboxTrigger = forwardRef((props, ref) => {
  const [triggerProps, localProps] = splitTriggerProps(props, ["focusable"]);
  const combobox = useComboboxContext();
  const mergedProps = mergeProps(combobox.getTriggerProps(triggerProps), localProps);
  return /* @__PURE__ */ jsx(ark.button, { ...mergedProps, ref });
});
ComboboxTrigger.displayName = "ComboboxTrigger";

export { ComboboxTrigger };
