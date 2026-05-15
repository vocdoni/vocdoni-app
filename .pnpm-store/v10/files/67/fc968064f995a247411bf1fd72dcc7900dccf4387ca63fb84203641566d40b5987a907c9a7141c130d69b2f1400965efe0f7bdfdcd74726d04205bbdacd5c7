"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var scrollArea = require('@ark-ui/react/scroll-area');
var createSlotRecipeContext = require('../../styled-system/create-slot-recipe-context.cjs');

const {
  withProvider,
  withContext,
  useStyles: useScrollAreaStyles,
  PropsProvider
} = createSlotRecipeContext.createSlotRecipeContext({ key: "scrollArea" });
const ScrollAreaRootProvider = withProvider(scrollArea.ScrollArea.RootProvider, "root", { forwardAsChild: true });
const ScrollAreaRoot = withProvider(
  scrollArea.ScrollArea.Root,
  "root",
  { forwardAsChild: true }
);
const ScrollAreaPropsProvider = PropsProvider;
const ScrollAreaViewport = withContext(scrollArea.ScrollArea.Viewport, "viewport", { forwardAsChild: true });
const ScrollAreaContent = withContext(scrollArea.ScrollArea.Content, "content", { forwardAsChild: true });
const ScrollAreaThumb = withContext(scrollArea.ScrollArea.Thumb, "thumb", { forwardAsChild: true });
const ScrollAreaScrollbar = withContext(scrollArea.ScrollArea.Scrollbar, "scrollbar", {
  forwardAsChild: true,
  defaultProps: {
    children: /* @__PURE__ */ jsxRuntime.jsx(ScrollAreaThumb, {})
  }
});
const ScrollAreaCorner = withContext(scrollArea.ScrollArea.Corner, "corner", { forwardAsChild: true });
const ScrollAreaContext = scrollArea.ScrollArea.Context;

exports.ScrollAreaContent = ScrollAreaContent;
exports.ScrollAreaContext = ScrollAreaContext;
exports.ScrollAreaCorner = ScrollAreaCorner;
exports.ScrollAreaPropsProvider = ScrollAreaPropsProvider;
exports.ScrollAreaRoot = ScrollAreaRoot;
exports.ScrollAreaRootProvider = ScrollAreaRootProvider;
exports.ScrollAreaScrollbar = ScrollAreaScrollbar;
exports.ScrollAreaThumb = ScrollAreaThumb;
exports.ScrollAreaViewport = ScrollAreaViewport;
exports.useScrollAreaStyles = useScrollAreaStyles;
