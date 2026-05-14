'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useListboxContext } from './use-listbox-context.js';

const splitInputProps = createSplitProps();
const ListboxInput = forwardRef((props, ref) => {
  const [inputProps, localProps] = splitInputProps(props, ["autoHighlight"]);
  const listbox = useListboxContext();
  const mergedProps = mergeProps(listbox.getInputProps(inputProps), localProps);
  return /* @__PURE__ */ jsx(ark.input, { ...mergedProps, ref });
});
ListboxInput.displayName = "ListboxInput";

export { ListboxInput };
