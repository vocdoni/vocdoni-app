"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var splitter = require('@ark-ui/react/splitter');
var createSlotRecipeContext = require('../../styled-system/create-slot-recipe-context.cjs');

const {
  withProvider,
  withContext,
  useStyles: useSplitterStyles,
  PropsProvider
} = createSlotRecipeContext.createSlotRecipeContext({ key: "splitter" });
const SplitterRootProvider = withProvider(splitter.Splitter.RootProvider, "root", { forwardAsChild: true });
const SplitterRoot = withProvider(
  splitter.Splitter.Root,
  "root",
  {
    forwardAsChild: true
  }
);
const SplitterPropsProvider = PropsProvider;
const SplitterPanel = withContext(
  splitter.Splitter.Panel,
  "panel",
  { forwardAsChild: true }
);
const SplitterResizeTriggerSeparator = withContext("div", "resizeTriggerSeparator");
const SplitterResizeTriggerIndicator = withContext(splitter.Splitter.ResizeTriggerIndicator, "resizeTriggerIndicator");
const SplitterResizeTrigger = withContext(splitter.Splitter.ResizeTrigger, "resizeTrigger", {
  forwardAsChild: true,
  defaultProps: {
    "aria-label": "Resize",
    children: /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(SplitterResizeTriggerSeparator, {}),
      /* @__PURE__ */ jsxRuntime.jsx(SplitterResizeTriggerIndicator, {})
    ] })
  }
});
const SplitterContext = splitter.Splitter.Context;

exports.SplitterContext = SplitterContext;
exports.SplitterPanel = SplitterPanel;
exports.SplitterPropsProvider = SplitterPropsProvider;
exports.SplitterResizeTrigger = SplitterResizeTrigger;
exports.SplitterResizeTriggerIndicator = SplitterResizeTriggerIndicator;
exports.SplitterResizeTriggerSeparator = SplitterResizeTriggerSeparator;
exports.SplitterRoot = SplitterRoot;
exports.SplitterRootProvider = SplitterRootProvider;
exports.useSplitterStyles = useSplitterStyles;
