'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { splitRenderStrategyProps, RenderStrategyPropsProvider } from '../../utils/render-strategy.js';
import { ark } from '../factory.js';
import { NavigationMenuProvider } from './use-navigation-menu-context.js';

const splitRootProviderProps = createSplitProps();
const NavigationMenuRootProvider = forwardRef((props, ref) => {
  const [renderStrategyProps, navigationMenuProps] = splitRenderStrategyProps(props);
  const [{ value: navigationMenu }, localProps] = splitRootProviderProps(navigationMenuProps, ["value"]);
  const mergedProps = mergeProps(navigationMenu.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(NavigationMenuProvider, { value: navigationMenu, children: /* @__PURE__ */ jsx(RenderStrategyPropsProvider, { value: renderStrategyProps, children: /* @__PURE__ */ jsx(ark.nav, { ...mergedProps, ref }) }) });
});
NavigationMenuRootProvider.displayName = "NavigationMenuRootProvider";

export { NavigationMenuRootProvider };
