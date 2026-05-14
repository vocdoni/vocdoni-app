"use strict";
"use client";
import { jsx } from 'react/jsx-runtime';
import * as React from 'react';
import { createRecipeContext } from '../../styled-system/create-recipe-context.js';
import { Circle } from '../circle/index.js';
import { Stack } from '../stack/stack.js';

const { withContext, PropsProvider } = createRecipeContext({
  key: "skeleton"
});
const Skeleton = withContext("div");
Skeleton.displayName = "Skeleton";
const SkeletonPropsProvider = PropsProvider;
const SkeletonCircle = React.forwardRef(function SkeletonCircle2(props, ref) {
  const { size, ...rest } = props;
  return /* @__PURE__ */ jsx(Circle, { size, asChild: true, ref, children: /* @__PURE__ */ jsx(Skeleton, { ...rest }) });
});
SkeletonCircle.displayName = "SkeletonCircle";
const SkeletonText = React.forwardRef(
  function SkeletonText2(props, ref) {
    const { loading = true, noOfLines = 3, gap, rootProps, ...rest } = props;
    return /* @__PURE__ */ jsx(Stack, { gap, width: "full", ref, ...rootProps, children: Array.from({ length: loading ? noOfLines : 1 }).map((_, index) => /* @__PURE__ */ jsx(
      Skeleton,
      {
        loading,
        height: loading ? "4" : void 0,
        maxW: loading ? index === noOfLines - 1 && noOfLines > 1 ? "80%" : "100%" : void 0,
        ...rest
      },
      index
    )) });
  }
);
SkeletonText.displayName = "SkeletonText";

export { Skeleton, SkeletonCircle, SkeletonPropsProvider, SkeletonText };
