'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const renderStrategy = require('../../utils/render-strategy.cjs');
const factory = require('../factory.cjs');
const useNavigationMenu = require('./use-navigation-menu.cjs');
const useNavigationMenuContext = require('./use-navigation-menu-context.cjs');

const splitRootProps = createSplitProps.createSplitProps();
const NavigationMenuRoot = react.forwardRef((props, ref) => {
  const [renderStrategyProps, navigationMenuProps] = renderStrategy.splitRenderStrategyProps(props);
  const [useNavigationMenuProps, localProps] = splitRootProps(navigationMenuProps, [
    "closeDelay",
    "defaultValue",
    "disableClickTrigger",
    "disableHoverTrigger",
    "disablePointerLeaveClose",
    "id",
    "ids",
    "onValueChange",
    "openDelay",
    "orientation",
    "value"
  ]);
  const navigationMenu = useNavigationMenu.useNavigationMenu(useNavigationMenuProps);
  const mergedProps = react$1.mergeProps(navigationMenu.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useNavigationMenuContext.NavigationMenuProvider, { value: navigationMenu, children: /* @__PURE__ */ jsxRuntime.jsx(renderStrategy.RenderStrategyPropsProvider, { value: renderStrategyProps, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.nav, { ...mergedProps, ref }) }) });
});
NavigationMenuRoot.displayName = "NavigationMenuRoot";

exports.NavigationMenuRoot = NavigationMenuRoot;
