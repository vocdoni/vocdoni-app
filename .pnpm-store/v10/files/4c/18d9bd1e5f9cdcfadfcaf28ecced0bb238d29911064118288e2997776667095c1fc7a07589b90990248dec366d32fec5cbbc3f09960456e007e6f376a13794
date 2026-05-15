'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react = require('react');
const factory = require('../factory.cjs');
const combobox_anatomy = require('./combobox.anatomy.cjs');
const useComboboxContext = require('./use-combobox-context.cjs');

const parts = combobox_anatomy.comboboxAnatomy.build();
const ComboboxEmpty = react.forwardRef((props, ref) => {
  const combobox = useComboboxContext.useComboboxContext();
  if (combobox.collection.size !== 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...parts.empty.attrs, ...props, role: "presentation", ref });
});
ComboboxEmpty.displayName = "ComboboxEmpty";

exports.ComboboxEmpty = ComboboxEmpty;
