"use strict";
"use client";
import { Collapsible } from '@ark-ui/react/collapsible';
import { createSlotRecipeContext } from '../../styled-system/create-slot-recipe-context.js';

const {
  withProvider,
  withContext,
  useStyles: useCollapsibleStyles,
  PropsProvider
} = createSlotRecipeContext({ key: "collapsible" });
const CollapsibleRootProvider = withProvider(Collapsible.RootProvider, "root", { forwardAsChild: true });
const CollapsibleRoot = withProvider(Collapsible.Root, "root", { forwardAsChild: true });
const CollapsiblePropsProvider = PropsProvider;
const CollapsibleTrigger = withContext(Collapsible.Trigger, "trigger", { forwardAsChild: true });
const CollapsibleContent = withContext(Collapsible.Content, "content", { forwardAsChild: true });
const CollapsibleIndicator = withContext(Collapsible.Indicator, "indicator", { forwardAsChild: true });
const CollapsibleContext = Collapsible.Context;

export { CollapsibleContent, CollapsibleContext, CollapsibleIndicator, CollapsiblePropsProvider, CollapsibleRoot, CollapsibleRootProvider, CollapsibleTrigger, useCollapsibleStyles };
