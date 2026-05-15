'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const composeRefs = require('../../utils/compose-refs.cjs');
const createSplitProps = require('../../utils/create-split-props.cjs');
const renderStrategy = require('../../utils/render-strategy.cjs');
const factory = require('../factory.cjs');
const portal = require('../portal/portal.cjs');
const usePresence = require('../presence/use-presence.cjs');
const usePresenceContext = require('../presence/use-presence-context.cjs');
const useNavigationMenuContext = require('./use-navigation-menu-context.cjs');
const useNavigationMenuItemPropsContext = require('./use-navigation-menu-item-props-context.cjs');

const splitContentProps = createSplitProps.createSplitProps();
const NavigationMenuContent = react.forwardRef((props, ref) => {
  const api = useNavigationMenuContext.useNavigationMenuContext();
  const itemContext = useNavigationMenuItemPropsContext.useNavigationMenuItemPropsContext();
  const value = props.value ?? itemContext?.value;
  const [contentProps, localProps] = splitContentProps({ ...props, value }, ["value"]);
  const renderStrategyProps = renderStrategy.useRenderStrategyPropsContext();
  const presence = usePresence.usePresence({ ...renderStrategyProps, present: api.value === value });
  const mergedProps = react$1.mergeProps(api.getContentProps(contentProps), presence.getPresenceProps(), localProps);
  const content = /* @__PURE__ */ jsxRuntime.jsx(usePresenceContext.PresenceProvider, { value: presence, children: presence.unmounted ? null : /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref: composeRefs.composeRefs(presence.ref, ref) }) });
  const viewportNode = api.getViewportNode();
  if (api.isViewportRendered && viewportNode) {
    return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { ...api.getViewportProxyProps(contentProps) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { ...api.getTriggerProxyProps(contentProps) }),
      /* @__PURE__ */ jsxRuntime.jsx(portal.Portal, { container: { current: viewportNode }, children: content })
    ] });
  }
  return content;
});
NavigationMenuContent.displayName = "NavigationMenuContent";

exports.NavigationMenuContent = NavigationMenuContent;
