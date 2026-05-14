'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const renderStrategy = require('../../utils/render-strategy.cjs');
const factory = require('../factory.cjs');
const useNavigationMenuContext = require('./use-navigation-menu-context.cjs');

const splitRootProviderProps = createSplitProps.createSplitProps();
const NavigationMenuRootProvider = react.forwardRef((props, ref) => {
  const [renderStrategyProps, navigationMenuProps] = renderStrategy.splitRenderStrategyProps(props);
  const [{ value: navigationMenu }, localProps] = splitRootProviderProps(navigationMenuProps, ["value"]);
  const mergedProps = react$1.mergeProps(navigationMenu.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useNavigationMenuContext.NavigationMenuProvider, { value: navigationMenu, children: /* @__PURE__ */ jsxRuntime.jsx(renderStrategy.RenderStrategyPropsProvider, { value: renderStrategyProps, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.nav, { ...mergedProps, ref }) }) });
});
NavigationMenuRootProvider.displayName = "NavigationMenuRootProvider";

exports.NavigationMenuRootProvider = NavigationMenuRootProvider;
