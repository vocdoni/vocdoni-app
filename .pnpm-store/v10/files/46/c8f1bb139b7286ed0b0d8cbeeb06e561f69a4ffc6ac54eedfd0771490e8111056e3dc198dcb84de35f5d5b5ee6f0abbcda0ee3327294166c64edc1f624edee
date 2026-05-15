'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useMenuContext } from './use-menu-context.js';
import { useMenuItemPropsContext } from './use-menu-option-item-props-context.js';

const MenuItemText = forwardRef((props, ref) => {
  const menu = useMenuContext();
  const itemProps = useMenuItemPropsContext();
  const mergedProps = mergeProps(menu.getItemTextProps(itemProps), props);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
MenuItemText.displayName = "MenuItemText";

export { MenuItemText };
