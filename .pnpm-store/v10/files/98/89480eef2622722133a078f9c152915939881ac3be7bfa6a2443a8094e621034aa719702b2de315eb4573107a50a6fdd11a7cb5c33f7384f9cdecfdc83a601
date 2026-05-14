"use strict";
"use client";
import { jsx } from 'react/jsx-runtime';
import { ScrollArea } from '@ark-ui/react/scroll-area';
import { createSlotRecipeContext } from '../../styled-system/create-slot-recipe-context.js';

const {
  withProvider,
  withContext,
  useStyles: useScrollAreaStyles,
  PropsProvider
} = createSlotRecipeContext({ key: "scrollArea" });
const ScrollAreaRootProvider = withProvider(ScrollArea.RootProvider, "root", { forwardAsChild: true });
const ScrollAreaRoot = withProvider(
  ScrollArea.Root,
  "root",
  { forwardAsChild: true }
);
const ScrollAreaPropsProvider = PropsProvider;
const ScrollAreaViewport = withContext(ScrollArea.Viewport, "viewport", { forwardAsChild: true });
const ScrollAreaContent = withContext(ScrollArea.Content, "content", { forwardAsChild: true });
const ScrollAreaThumb = withContext(ScrollArea.Thumb, "thumb", { forwardAsChild: true });
const ScrollAreaScrollbar = withContext(ScrollArea.Scrollbar, "scrollbar", {
  forwardAsChild: true,
  defaultProps: {
    children: /* @__PURE__ */ jsx(ScrollAreaThumb, {})
  }
});
const ScrollAreaCorner = withContext(ScrollArea.Corner, "corner", { forwardAsChild: true });
const ScrollAreaContext = ScrollArea.Context;

export { ScrollAreaContent, ScrollAreaContext, ScrollAreaCorner, ScrollAreaPropsProvider, ScrollAreaRoot, ScrollAreaRootProvider, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport, useScrollAreaStyles };
