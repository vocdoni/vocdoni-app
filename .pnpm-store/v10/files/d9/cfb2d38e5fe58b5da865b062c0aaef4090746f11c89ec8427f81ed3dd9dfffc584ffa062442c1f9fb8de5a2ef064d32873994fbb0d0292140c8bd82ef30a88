'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useNavigationMenuContext } from './use-navigation-menu-context.js';
import { useNavigationMenuItemPropsContext } from './use-navigation-menu-item-props-context.js';

const NavigationMenuItemIndicator = forwardRef(
  (props, ref) => {
    const navigationMenu = useNavigationMenuContext();
    const itemProps = useNavigationMenuItemPropsContext();
    const mergedProps = mergeProps(navigationMenu.getItemIndicatorProps(itemProps), props);
    return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
  }
);
NavigationMenuItemIndicator.displayName = "NavigationMenuItemIndicator";

export { NavigationMenuItemIndicator };
