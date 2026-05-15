'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { ensure } from '@zag-js/utils';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useNavigationMenuContext } from './use-navigation-menu-context.js';
import { createSplitProps } from '../../utils/create-split-props.js';
import { useNavigationMenuItemPropsContext } from './use-navigation-menu-item-props-context.js';

const splitItemProps = createSplitProps();
const NavigationMenuTrigger = forwardRef((props, ref) => {
  const itemContext = useNavigationMenuItemPropsContext();
  ensure(itemContext, () => "NavigationMenu.Trigger must be used within NavigationMenu.Item");
  const value = itemContext.value;
  const disabled = props.disabled ?? itemContext.disabled;
  const [triggerProps, localProps] = splitItemProps({ ...props, value, disabled }, ["value", "disabled"]);
  const navigationMenu = useNavigationMenuContext();
  const mergedProps = mergeProps(navigationMenu.getTriggerProps(triggerProps), localProps);
  return /* @__PURE__ */ jsx(ark.button, { ...mergedProps, ref });
});
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export { NavigationMenuTrigger };
