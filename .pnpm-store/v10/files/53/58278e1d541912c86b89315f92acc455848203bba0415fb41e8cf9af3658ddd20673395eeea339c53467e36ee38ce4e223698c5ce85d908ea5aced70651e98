'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useNavigationMenuContext } from './use-navigation-menu-context.js';

const NavigationMenuArrow = forwardRef((props, ref) => {
  const navigationMenu = useNavigationMenuContext();
  const mergedProps = mergeProps(navigationMenu.getArrowProps(), props);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
NavigationMenuArrow.displayName = "NavigationMenuArrow";

export { NavigationMenuArrow };
