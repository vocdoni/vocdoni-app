"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var tagsInput = require('@ark-ui/react/tags-input');
var createSlotRecipeContext = require('../../styled-system/create-slot-recipe-context.cjs');
var icons = require('../icons.cjs');
var _for = require('../for/for.cjs');

const {
  withProvider,
  withContext,
  useStyles: useTagsInputStyles,
  PropsProvider
} = createSlotRecipeContext.createSlotRecipeContext({ key: "tagsInput" });
const TagsInputRootProvider = withProvider(tagsInput.TagsInput.RootProvider, "root", { forwardAsChild: true });
const TagsInputRoot = withProvider(
  tagsInput.TagsInput.Root,
  "root",
  { forwardAsChild: true, defaultProps: { editable: false } }
);
const TagsInputPropsProvider = PropsProvider;
const TagsInputLabel = withContext(tagsInput.TagsInput.Label, "label", { forwardAsChild: true });
const TagsInputControl = withContext(tagsInput.TagsInput.Control, "control", { forwardAsChild: true });
const TagsInputInput = withContext(tagsInput.TagsInput.Input, "input", { forwardAsChild: true });
const TagsInputItem = withContext(
  tagsInput.TagsInput.Item,
  "item",
  { forwardAsChild: true }
);
const TagsInputItemText = withContext(tagsInput.TagsInput.ItemText, "itemText", { forwardAsChild: true });
const TagsInputItemDeleteTrigger = withContext(tagsInput.TagsInput.ItemDeleteTrigger, "itemDeleteTrigger", {
  forwardAsChild: true,
  defaultProps: { children: /* @__PURE__ */ jsxRuntime.jsx(icons.CloseIcon, {}) }
});
const TagsInputItemPreview = withContext(tagsInput.TagsInput.ItemPreview, "itemPreview", { forwardAsChild: true });
const TagsInputItemInput = withContext(tagsInput.TagsInput.ItemInput, "itemInput", { forwardAsChild: true });
const TagsInputClearTrigger = withContext(tagsInput.TagsInput.ClearTrigger, "clearTrigger", {
  forwardAsChild: true,
  defaultProps: { children: /* @__PURE__ */ jsxRuntime.jsx(icons.CloseIcon, {}) }
});
const TagsInputItems = (props) => {
  const api = tagsInput.useTagsInputContext();
  return /* @__PURE__ */ jsxRuntime.jsx(_for.For, { each: api.value, children: (item, index) => /* @__PURE__ */ jsxRuntime.jsxs(TagsInputItem, { index, value: item, ...props, children: [
    /* @__PURE__ */ jsxRuntime.jsxs(TagsInputItemPreview, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(TagsInputItemText, { children: item }),
      /* @__PURE__ */ jsxRuntime.jsx(TagsInputItemDeleteTrigger, {})
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(TagsInputItemInput, {})
  ] }, index) });
};
const TagsInputContext = tagsInput.TagsInput.Context;
const TagsInputHiddenInput = tagsInput.TagsInput.HiddenInput;
const TagsInputItemContext = tagsInput.TagsInput.ItemContext;

exports.TagsInputClearTrigger = TagsInputClearTrigger;
exports.TagsInputContext = TagsInputContext;
exports.TagsInputControl = TagsInputControl;
exports.TagsInputHiddenInput = TagsInputHiddenInput;
exports.TagsInputInput = TagsInputInput;
exports.TagsInputItem = TagsInputItem;
exports.TagsInputItemContext = TagsInputItemContext;
exports.TagsInputItemDeleteTrigger = TagsInputItemDeleteTrigger;
exports.TagsInputItemInput = TagsInputItemInput;
exports.TagsInputItemPreview = TagsInputItemPreview;
exports.TagsInputItemText = TagsInputItemText;
exports.TagsInputItems = TagsInputItems;
exports.TagsInputLabel = TagsInputLabel;
exports.TagsInputPropsProvider = TagsInputPropsProvider;
exports.TagsInputRoot = TagsInputRoot;
exports.TagsInputRootProvider = TagsInputRootProvider;
exports.useTagsInputStyles = useTagsInputStyles;
