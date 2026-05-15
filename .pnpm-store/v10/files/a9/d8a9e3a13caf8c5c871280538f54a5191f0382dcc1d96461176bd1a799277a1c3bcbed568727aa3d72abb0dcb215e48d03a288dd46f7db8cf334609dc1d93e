'use client';
import { jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { listboxAnatomy } from './listbox.anatomy.js';
import { useListboxContext } from './use-listbox-context.js';

const parts = listboxAnatomy.build();
const ListboxEmpty = forwardRef((props, ref) => {
  const listbox = useListboxContext();
  if (listbox.collection.size !== 0) {
    return null;
  }
  return /* @__PURE__ */ jsx(ark.div, { ...parts.empty.attrs, ...props, role: "presentation", ref });
});
ListboxEmpty.displayName = "ListboxEmpty";

export { ListboxEmpty };
