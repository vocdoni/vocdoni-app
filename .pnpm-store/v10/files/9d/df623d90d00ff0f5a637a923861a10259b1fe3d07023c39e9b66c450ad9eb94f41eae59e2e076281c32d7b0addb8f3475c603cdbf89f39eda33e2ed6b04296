'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { RadioGroupProvider } from './use-radio-group-context.js';

const splitRootProviderProps = createSplitProps();
const RadioGroupRootProvider = forwardRef((props, ref) => {
  const [{ value: radioGroup }, localProps] = splitRootProviderProps(props, ["value"]);
  const mergedProps = mergeProps(radioGroup.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(RadioGroupProvider, { value: radioGroup, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
RadioGroupRootProvider.displayName = "RadioGroupRootProvider";

export { RadioGroupRootProvider };
