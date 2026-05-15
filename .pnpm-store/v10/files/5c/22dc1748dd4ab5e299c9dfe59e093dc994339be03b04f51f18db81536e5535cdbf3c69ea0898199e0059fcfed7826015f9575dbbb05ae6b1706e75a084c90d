'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useNavigationMenuContext } from './use-navigation-menu-context.js';
import { NavigationMenuItemPropsProvider } from './use-navigation-menu-item-props-context.js';

const splitItemProps = createSplitProps();
const NavigationMenuItem = forwardRef((props, ref) => {
  const [itemProps, localProps] = splitItemProps(props, ["disabled", "value"]);
  const navigationMenu = useNavigationMenuContext();
  const mergedProps = mergeProps(navigationMenu.getItemProps(itemProps), localProps);
  return /* @__PURE__ */ jsx(NavigationMenuItemPropsProvider, { value: itemProps, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
NavigationMenuItem.displayName = "NavigationMenuItem";

export { NavigationMenuItem };
