'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { splitRenderStrategyProps, RenderStrategyPropsProvider } from '../../utils/render-strategy.js';
import { ark } from '../factory.js';
import { useNavigationMenu } from './use-navigation-menu.js';
import { NavigationMenuProvider } from './use-navigation-menu-context.js';

const splitRootProps = createSplitProps();
const NavigationMenuRoot = forwardRef((props, ref) => {
  const [renderStrategyProps, navigationMenuProps] = splitRenderStrategyProps(props);
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
  const navigationMenu = useNavigationMenu(useNavigationMenuProps);
  const mergedProps = mergeProps(navigationMenu.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(NavigationMenuProvider, { value: navigationMenu, children: /* @__PURE__ */ jsx(RenderStrategyPropsProvider, { value: renderStrategyProps, children: /* @__PURE__ */ jsx(ark.nav, { ...mergedProps, ref }) }) });
});
NavigationMenuRoot.displayName = "NavigationMenuRoot";

export { NavigationMenuRoot };
