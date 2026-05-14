'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useNavigationMenuContext } from './use-navigation-menu-context.js';
import { useNavigationMenuItemPropsContext } from './use-navigation-menu-item-props-context.js';

const splitLinkProps = createSplitProps();
const NavigationMenuLink = forwardRef((props, ref) => {
  const itemContext = useNavigationMenuItemPropsContext();
  const value = props.value ?? itemContext?.value;
  const [linkProps, localProps] = splitLinkProps({ ...props, value }, ["current", "onSelect", "value", "closeOnClick"]);
  const navigationMenu = useNavigationMenuContext();
  const mergedProps = mergeProps(navigationMenu.getLinkProps(linkProps), localProps);
  return /* @__PURE__ */ jsx(ark.a, { ...mergedProps, ref });
});
NavigationMenuLink.displayName = "NavigationMenuLink";

export { NavigationMenuLink };
