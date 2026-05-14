"use strict";
"use client";
import { jsx, jsxs } from 'react/jsx-runtime';
import { TagsInput, useTagsInputContext } from '@ark-ui/react/tags-input';
import { createSlotRecipeContext } from '../../styled-system/create-slot-recipe-context.js';
import { CloseIcon } from '../icons.js';
import { For } from '../for/for.js';

const {
  withProvider,
  withContext,
  useStyles: useTagsInputStyles,
  PropsProvider
} = createSlotRecipeContext({ key: "tagsInput" });
const TagsInputRootProvider = withProvider(TagsInput.RootProvider, "root", { forwardAsChild: true });
const TagsInputRoot = withProvider(
  TagsInput.Root,
  "root",
  { forwardAsChild: true, defaultProps: { editable: false } }
);
const TagsInputPropsProvider = PropsProvider;
const TagsInputLabel = withContext(TagsInput.Label, "label", { forwardAsChild: true });
const TagsInputControl = withContext(TagsInput.Control, "control", { forwardAsChild: true });
const TagsInputInput = withContext(TagsInput.Input, "input", { forwardAsChild: true });
const TagsInputItem = withContext(
  TagsInput.Item,
  "item",
  { forwardAsChild: true }
);
const TagsInputItemText = withContext(TagsInput.ItemText, "itemText", { forwardAsChild: true });
const TagsInputItemDeleteTrigger = withContext(TagsInput.ItemDeleteTrigger, "itemDeleteTrigger", {
  forwardAsChild: true,
  defaultProps: { children: /* @__PURE__ */ jsx(CloseIcon, {}) }
});
const TagsInputItemPreview = withContext(TagsInput.ItemPreview, "itemPreview", { forwardAsChild: true });
const TagsInputItemInput = withContext(TagsInput.ItemInput, "itemInput", { forwardAsChild: true });
const TagsInputClearTrigger = withContext(TagsInput.ClearTrigger, "clearTrigger", {
  forwardAsChild: true,
  defaultProps: { children: /* @__PURE__ */ jsx(CloseIcon, {}) }
});
const TagsInputItems = (props) => {
  const api = useTagsInputContext();
  return /* @__PURE__ */ jsx(For, { each: api.value, children: (item, index) => /* @__PURE__ */ jsxs(TagsInputItem, { index, value: item, ...props, children: [
    /* @__PURE__ */ jsxs(TagsInputItemPreview, { children: [
      /* @__PURE__ */ jsx(TagsInputItemText, { children: item }),
      /* @__PURE__ */ jsx(TagsInputItemDeleteTrigger, {})
    ] }),
    /* @__PURE__ */ jsx(TagsInputItemInput, {})
  ] }, index) });
};
const TagsInputContext = TagsInput.Context;
const TagsInputHiddenInput = TagsInput.HiddenInput;
const TagsInputItemContext = TagsInput.ItemContext;

export { TagsInputClearTrigger, TagsInputContext, TagsInputControl, TagsInputHiddenInput, TagsInputInput, TagsInputItem, TagsInputItemContext, TagsInputItemDeleteTrigger, TagsInputItemInput, TagsInputItemPreview, TagsInputItemText, TagsInputItems, TagsInputLabel, TagsInputPropsProvider, TagsInputRoot, TagsInputRootProvider, useTagsInputStyles };
