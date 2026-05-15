'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useMenuContext } from './use-menu-context.js';
import { useMenuItemPropsContext } from './use-menu-option-item-props-context.js';

const MenuItemIndicator = forwardRef((props, ref) => {
  const menu = useMenuContext();
  const itemProps = useMenuItemPropsContext();
  const mergedProps = mergeProps(menu.getItemIndicatorProps(itemProps), props);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
MenuItemIndicator.displayName = "MenuItemIndicator";

export { MenuItemIndicator };
