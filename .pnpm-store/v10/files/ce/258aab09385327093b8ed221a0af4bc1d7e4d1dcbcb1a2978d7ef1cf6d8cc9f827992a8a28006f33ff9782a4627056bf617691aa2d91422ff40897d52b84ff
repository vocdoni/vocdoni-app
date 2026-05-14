'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useNavigationMenuContext = require('./use-navigation-menu-context.cjs');
const useNavigationMenuItemPropsContext = require('./use-navigation-menu-item-props-context.cjs');

const NavigationMenuItemIndicator = react.forwardRef(
  (props, ref) => {
    const navigationMenu = useNavigationMenuContext.useNavigationMenuContext();
    const itemProps = useNavigationMenuItemPropsContext.useNavigationMenuItemPropsContext();
    const mergedProps = react$1.mergeProps(navigationMenu.getItemIndicatorProps(itemProps), props);
    return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref });
  }
);
NavigationMenuItemIndicator.displayName = "NavigationMenuItemIndicator";

exports.NavigationMenuItemIndicator = NavigationMenuItemIndicator;
