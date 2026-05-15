"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var listbox = require('@ark-ui/react/listbox');
var createSlotRecipeContext = require('../../styled-system/create-slot-recipe-context.cjs');
var icons = require('../icons.cjs');

const {
  withProvider,
  withContext,
  useStyles: useListboxStyles,
  PropsProvider
} = createSlotRecipeContext.createSlotRecipeContext({ key: "listbox" });
const ListboxRootProvider = withProvider(listbox.Listbox.RootProvider, "root", {
  forwardAsChild: true
});
const ListboxRoot = withProvider(
  listbox.Listbox.Root,
  "root",
  {
    forwardAsChild: true
  }
);
const ListboxPropsProvider = PropsProvider;
const ListboxInput = withContext(
  listbox.Listbox.Input,
  "input",
  { forwardAsChild: true }
);
const ListboxContent = withContext(
  listbox.Listbox.Content,
  "content",
  { forwardAsChild: true }
);
const ListboxValueText = withContext(listbox.Listbox.ValueText, "valueText", { forwardAsChild: true });
const ListboxItemGroup = withContext(listbox.Listbox.ItemGroup, "itemGroup", { forwardAsChild: true });
const ListboxItemGroupLabel = withContext(listbox.Listbox.ItemGroupLabel, "itemGroupLabel", { forwardAsChild: true });
const ListboxItem = withContext(
  listbox.Listbox.Item,
  "item",
  { forwardAsChild: true }
);
const ListboxItemText = withContext(listbox.Listbox.ItemText, "itemText", { forwardAsChild: true });
const ListboxItemIndicator = withContext(listbox.Listbox.ItemIndicator, "itemIndicator", {
  forwardAsChild: true,
  defaultProps: {
    children: /* @__PURE__ */ jsxRuntime.jsx(icons.CheckIcon, {})
  }
});
const ListboxLabel = withContext(
  listbox.Listbox.Label,
  "label",
  { forwardAsChild: true }
);
const ListboxEmpty = withContext(
  listbox.Listbox.Empty,
  "empty",
  { forwardAsChild: true }
);
const ListboxContext = listbox.Listbox.Context;
const ListboxItemContext = listbox.Listbox.ItemContext;

exports.ListboxContent = ListboxContent;
exports.ListboxContext = ListboxContext;
exports.ListboxEmpty = ListboxEmpty;
exports.ListboxInput = ListboxInput;
exports.ListboxItem = ListboxItem;
exports.ListboxItemContext = ListboxItemContext;
exports.ListboxItemGroup = ListboxItemGroup;
exports.ListboxItemGroupLabel = ListboxItemGroupLabel;
exports.ListboxItemIndicator = ListboxItemIndicator;
exports.ListboxItemText = ListboxItemText;
exports.ListboxLabel = ListboxLabel;
exports.ListboxPropsProvider = ListboxPropsProvider;
exports.ListboxRoot = ListboxRoot;
exports.ListboxRootProvider = ListboxRootProvider;
exports.ListboxValueText = ListboxValueText;
exports.useListboxStyles = useListboxStyles;
