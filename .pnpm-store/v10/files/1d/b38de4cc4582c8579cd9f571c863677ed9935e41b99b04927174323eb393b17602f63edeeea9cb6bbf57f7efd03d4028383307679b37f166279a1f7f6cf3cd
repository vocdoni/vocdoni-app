'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useNavigationMenuContext = require('./use-navigation-menu-context.cjs');
const useNavigationMenuItemPropsContext = require('./use-navigation-menu-item-props-context.cjs');

const splitLinkProps = createSplitProps.createSplitProps();
const NavigationMenuLink = react.forwardRef((props, ref) => {
  const itemContext = useNavigationMenuItemPropsContext.useNavigationMenuItemPropsContext();
  const value = props.value ?? itemContext?.value;
  const [linkProps, localProps] = splitLinkProps({ ...props, value }, ["current", "onSelect", "value", "closeOnClick"]);
  const navigationMenu = useNavigationMenuContext.useNavigationMenuContext();
  const mergedProps = react$1.mergeProps(navigationMenu.getLinkProps(linkProps), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.a, { ...mergedProps, ref });
});
NavigationMenuLink.displayName = "NavigationMenuLink";

exports.NavigationMenuLink = NavigationMenuLink;
