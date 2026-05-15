'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { composeRefs } from '../../utils/compose-refs.js';
import { createSplitProps } from '../../utils/create-split-props.js';
import { useRenderStrategyPropsContext } from '../../utils/render-strategy.js';
import { ark } from '../factory.js';
import { usePresence } from '../presence/use-presence.js';
import { PresenceProvider } from '../presence/use-presence-context.js';
import { useNavigationMenuContext } from './use-navigation-menu-context.js';

const splitViewportProps = createSplitProps();
const NavigationMenuViewport = forwardRef((props, ref) => {
  const [viewportProps, localProps] = splitViewportProps(props, ["align"]);
  const navigationMenu = useNavigationMenuContext();
  const renderStrategyProps = useRenderStrategyPropsContext();
  const presence = usePresence({ ...renderStrategyProps, present: navigationMenu.open });
  const mergedProps = mergeProps(
    navigationMenu.getViewportProps(viewportProps),
    presence.getPresenceProps(),
    localProps
  );
  return /* @__PURE__ */ jsx(PresenceProvider, { value: presence, children: presence.unmounted ? null : /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref: composeRefs(presence.ref, ref) }) });
});
NavigationMenuViewport.displayName = "NavigationMenuViewport";

export { NavigationMenuViewport };
