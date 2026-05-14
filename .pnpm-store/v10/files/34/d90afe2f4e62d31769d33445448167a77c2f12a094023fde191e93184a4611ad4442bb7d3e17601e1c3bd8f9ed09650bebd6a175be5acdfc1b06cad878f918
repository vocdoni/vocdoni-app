"use strict";
"use client";
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { Splitter } from '@ark-ui/react/splitter';
import { createSlotRecipeContext } from '../../styled-system/create-slot-recipe-context.js';

const {
  withProvider,
  withContext,
  useStyles: useSplitterStyles,
  PropsProvider
} = createSlotRecipeContext({ key: "splitter" });
const SplitterRootProvider = withProvider(Splitter.RootProvider, "root", { forwardAsChild: true });
const SplitterRoot = withProvider(
  Splitter.Root,
  "root",
  {
    forwardAsChild: true
  }
);
const SplitterPropsProvider = PropsProvider;
const SplitterPanel = withContext(
  Splitter.Panel,
  "panel",
  { forwardAsChild: true }
);
const SplitterResizeTriggerSeparator = withContext("div", "resizeTriggerSeparator");
const SplitterResizeTriggerIndicator = withContext(Splitter.ResizeTriggerIndicator, "resizeTriggerIndicator");
const SplitterResizeTrigger = withContext(Splitter.ResizeTrigger, "resizeTrigger", {
  forwardAsChild: true,
  defaultProps: {
    "aria-label": "Resize",
    children: /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(SplitterResizeTriggerSeparator, {}),
      /* @__PURE__ */ jsx(SplitterResizeTriggerIndicator, {})
    ] })
  }
});
const SplitterContext = Splitter.Context;

export { SplitterContext, SplitterPanel, SplitterPropsProvider, SplitterResizeTrigger, SplitterResizeTriggerIndicator, SplitterResizeTriggerSeparator, SplitterRoot, SplitterRootProvider, useSplitterStyles };
