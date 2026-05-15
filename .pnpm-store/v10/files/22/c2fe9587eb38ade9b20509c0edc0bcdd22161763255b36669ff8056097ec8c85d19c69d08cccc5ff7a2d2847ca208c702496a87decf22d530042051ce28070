'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useNavigationMenuContext = require('./use-navigation-menu-context.cjs');

const NavigationMenuArrow = react.forwardRef((props, ref) => {
  const navigationMenu = useNavigationMenuContext.useNavigationMenuContext();
  const mergedProps = react$1.mergeProps(navigationMenu.getArrowProps(), props);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref });
});
NavigationMenuArrow.displayName = "NavigationMenuArrow";

exports.NavigationMenuArrow = NavigationMenuArrow;
