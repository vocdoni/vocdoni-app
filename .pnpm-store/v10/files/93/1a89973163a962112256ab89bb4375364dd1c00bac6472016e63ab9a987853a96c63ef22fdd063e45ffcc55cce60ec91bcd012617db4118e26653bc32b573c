'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const composeRefs = require('../../utils/compose-refs.cjs');
const renderStrategy = require('../../utils/render-strategy.cjs');
const factory = require('../factory.cjs');
const usePresence = require('../presence/use-presence.cjs');
const usePresenceContext = require('../presence/use-presence-context.cjs');
const useNavigationMenuContext = require('./use-navigation-menu-context.cjs');

const NavigationMenuIndicator = react.forwardRef((props, ref) => {
  const navigationMenu = useNavigationMenuContext.useNavigationMenuContext();
  const renderStrategyProps = renderStrategy.useRenderStrategyPropsContext();
  const presence = usePresence.usePresence({ ...renderStrategyProps, present: navigationMenu.open });
  const mergedProps = react$1.mergeProps(navigationMenu.getIndicatorProps(), presence.getPresenceProps(), props);
  return /* @__PURE__ */ jsxRuntime.jsx(usePresenceContext.PresenceProvider, { value: presence, children: presence.unmounted ? null : /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref: composeRefs.composeRefs(presence.ref, ref) }) });
});
NavigationMenuIndicator.displayName = "NavigationMenuIndicator";

exports.NavigationMenuIndicator = NavigationMenuIndicator;
