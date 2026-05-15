'use client';
import { jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { checkboxAnatomy } from './checkbox.anatomy.js';
import { CheckboxGroupContextProvider } from './use-checkbox-group-context.js';

const splitProviderProps = createSplitProps();
const CheckboxGroupProvider = forwardRef((props, ref) => {
  const [localProps, restProps] = splitProviderProps(props, ["value"]);
  return /* @__PURE__ */ jsx(CheckboxGroupContextProvider, { value: localProps.value, children: /* @__PURE__ */ jsx(ark.div, { ref, role: "group", ...restProps, ...checkboxAnatomy.build().group.attrs }) });
});
CheckboxGroupProvider.displayName = "CheckboxGroupProvider";

export { CheckboxGroupProvider };
