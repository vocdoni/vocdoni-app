'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react = require('react');
const factory = require('../factory.cjs');
const listbox_anatomy = require('./listbox.anatomy.cjs');
const useListboxContext = require('./use-listbox-context.cjs');

const parts = listbox_anatomy.listboxAnatomy.build();
const ListboxEmpty = react.forwardRef((props, ref) => {
  const listbox = useListboxContext.useListboxContext();
  if (listbox.collection.size !== 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...parts.empty.attrs, ...props, role: "presentation", ref });
});
ListboxEmpty.displayName = "ListboxEmpty";

exports.ListboxEmpty = ListboxEmpty;
