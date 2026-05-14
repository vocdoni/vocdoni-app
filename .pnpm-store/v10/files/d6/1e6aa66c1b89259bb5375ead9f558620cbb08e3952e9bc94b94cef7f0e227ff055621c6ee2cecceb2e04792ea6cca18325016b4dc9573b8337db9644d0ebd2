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

const splitItemProps = createSplitProps.createSplitProps();
const NavigationMenuItem = react.forwardRef((props, ref) => {
  const [itemProps, localProps] = splitItemProps(props, ["disabled", "value"]);
  const navigationMenu = useNavigationMenuContext.useNavigationMenuContext();
  const mergedProps = react$1.mergeProps(navigationMenu.getItemProps(itemProps), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useNavigationMenuItemPropsContext.NavigationMenuItemPropsProvider, { value: itemProps, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
NavigationMenuItem.displayName = "NavigationMenuItem";

exports.NavigationMenuItem = NavigationMenuItem;
