"use strict";
"use client";
import { jsx } from 'react/jsx-runtime';
import { Listbox } from '@ark-ui/react/listbox';
import { createSlotRecipeContext } from '../../styled-system/create-slot-recipe-context.js';
import { CheckIcon } from '../icons.js';

const {
  withProvider,
  withContext,
  useStyles: useListboxStyles,
  PropsProvider
} = createSlotRecipeContext({ key: "listbox" });
const ListboxRootProvider = withProvider(Listbox.RootProvider, "root", {
  forwardAsChild: true
});
const ListboxRoot = withProvider(
  Listbox.Root,
  "root",
  {
    forwardAsChild: true
  }
);
const ListboxPropsProvider = PropsProvider;
const ListboxInput = withContext(
  Listbox.Input,
  "input",
  { forwardAsChild: true }
);
const ListboxContent = withContext(
  Listbox.Content,
  "content",
  { forwardAsChild: true }
);
const ListboxValueText = withContext(Listbox.ValueText, "valueText", { forwardAsChild: true });
const ListboxItemGroup = withContext(Listbox.ItemGroup, "itemGroup", { forwardAsChild: true });
const ListboxItemGroupLabel = withContext(Listbox.ItemGroupLabel, "itemGroupLabel", { forwardAsChild: true });
const ListboxItem = withContext(
  Listbox.Item,
  "item",
  { forwardAsChild: true }
);
const ListboxItemText = withContext(Listbox.ItemText, "itemText", { forwardAsChild: true });
const ListboxItemIndicator = withContext(Listbox.ItemIndicator, "itemIndicator", {
  forwardAsChild: true,
  defaultProps: {
    children: /* @__PURE__ */ jsx(CheckIcon, {})
  }
});
const ListboxLabel = withContext(
  Listbox.Label,
  "label",
  { forwardAsChild: true }
);
const ListboxEmpty = withContext(
  Listbox.Empty,
  "empty",
  { forwardAsChild: true }
);
const ListboxContext = Listbox.Context;
const ListboxItemContext = Listbox.ItemContext;

export { ListboxContent, ListboxContext, ListboxEmpty, ListboxInput, ListboxItem, ListboxItemContext, ListboxItemGroup, ListboxItemGroupLabel, ListboxItemIndicator, ListboxItemText, ListboxLabel, ListboxPropsProvider, ListboxRoot, ListboxRootProvider, ListboxValueText, useListboxStyles };
