'use client';
import { jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { comboboxAnatomy } from './combobox.anatomy.js';
import { useComboboxContext } from './use-combobox-context.js';

const parts = comboboxAnatomy.build();
const ComboboxEmpty = forwardRef((props, ref) => {
  const combobox = useComboboxContext();
  if (combobox.collection.size !== 0) {
    return null;
  }
  return /* @__PURE__ */ jsx(ark.div, { ...parts.empty.attrs, ...props, role: "presentation", ref });
});
ComboboxEmpty.displayName = "ComboboxEmpty";

export { ComboboxEmpty };
