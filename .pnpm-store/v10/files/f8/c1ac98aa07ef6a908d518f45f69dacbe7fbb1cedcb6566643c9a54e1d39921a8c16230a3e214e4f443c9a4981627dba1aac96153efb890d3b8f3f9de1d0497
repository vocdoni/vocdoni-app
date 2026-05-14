"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var factory = require('../../styled-system/factory.cjs');
var useRecipe = require('../../styled-system/use-recipe.cjs');

const fallbackId = "chakra-skip-nav";
const SkipNavLink = React.forwardRef(
  function SkipNavLink2(props, ref) {
    const recipe = useRecipe.useRecipe({ key: "skipNavLink", recipe: props.recipe });
    const [variantProps, { id, ...localProps }] = recipe.splitVariantProps(props);
    const styles = recipe(variantProps);
    const targetId = id ?? fallbackId;
    return /* @__PURE__ */ jsxRuntime.jsx(
      factory.chakra.a,
      {
        ...localProps,
        ref,
        href: `#${targetId}`,
        css: [styles, props.css]
      }
    );
  }
);
SkipNavLink.displayName = "SkipNavLink";

exports.SkipNavLink = SkipNavLink;
exports.fallbackId = fallbackId;
