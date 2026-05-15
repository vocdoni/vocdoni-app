"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var createRecipeContext = require('../../styled-system/create-recipe-context.cjs');
var index = require('../circle/index.cjs');
var stack = require('../stack/stack.cjs');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);

const { withContext, PropsProvider } = createRecipeContext.createRecipeContext({
  key: "skeleton"
});
const Skeleton = withContext("div");
Skeleton.displayName = "Skeleton";
const SkeletonPropsProvider = PropsProvider;
const SkeletonCircle = React__namespace.forwardRef(function SkeletonCircle2(props, ref) {
  const { size, ...rest } = props;
  return /* @__PURE__ */ jsxRuntime.jsx(index.Circle, { size, asChild: true, ref, children: /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { ...rest }) });
});
SkeletonCircle.displayName = "SkeletonCircle";
const SkeletonText = React__namespace.forwardRef(
  function SkeletonText2(props, ref) {
    const { loading = true, noOfLines = 3, gap, rootProps, ...rest } = props;
    return /* @__PURE__ */ jsxRuntime.jsx(stack.Stack, { gap, width: "full", ref, ...rootProps, children: Array.from({ length: loading ? noOfLines : 1 }).map((_, index) => /* @__PURE__ */ jsxRuntime.jsx(
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

exports.Skeleton = Skeleton;
exports.SkeletonCircle = SkeletonCircle;
exports.SkeletonPropsProvider = SkeletonPropsProvider;
exports.SkeletonText = SkeletonText;
