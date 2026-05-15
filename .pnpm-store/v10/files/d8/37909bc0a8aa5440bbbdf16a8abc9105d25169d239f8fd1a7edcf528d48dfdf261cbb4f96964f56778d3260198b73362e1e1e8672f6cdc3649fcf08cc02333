'use client';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { composeRefs } from '../../utils/compose-refs.js';
import { createSplitProps } from '../../utils/create-split-props.js';
import { useRenderStrategyPropsContext } from '../../utils/render-strategy.js';
import { ark } from '../factory.js';
import { Portal } from '../portal/portal.js';
import { usePresence } from '../presence/use-presence.js';
import { PresenceProvider } from '../presence/use-presence-context.js';
import { useNavigationMenuContext } from './use-navigation-menu-context.js';
import { useNavigationMenuItemPropsContext } from './use-navigation-menu-item-props-context.js';

const splitContentProps = createSplitProps();
const NavigationMenuContent = forwardRef((props, ref) => {
  const api = useNavigationMenuContext();
  const itemContext = useNavigationMenuItemPropsContext();
  const value = props.value ?? itemContext?.value;
  const [contentProps, localProps] = splitContentProps({ ...props, value }, ["value"]);
  const renderStrategyProps = useRenderStrategyPropsContext();
  const presence = usePresence({ ...renderStrategyProps, present: api.value === value });
  const mergedProps = mergeProps(api.getContentProps(contentProps), presence.getPresenceProps(), localProps);
  const content = /* @__PURE__ */ jsx(PresenceProvider, { value: presence, children: presence.unmounted ? null : /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref: composeRefs(presence.ref, ref) }) });
  const viewportNode = api.getViewportNode();
  if (api.isViewportRendered && viewportNode) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { ...api.getViewportProxyProps(contentProps) }),
      /* @__PURE__ */ jsx("div", { ...api.getTriggerProxyProps(contentProps) }),
      /* @__PURE__ */ jsx(Portal, { container: { current: viewportNode }, children: content })
    ] });
  }
  return content;
});
NavigationMenuContent.displayName = "NavigationMenuContent";

export { NavigationMenuContent };
