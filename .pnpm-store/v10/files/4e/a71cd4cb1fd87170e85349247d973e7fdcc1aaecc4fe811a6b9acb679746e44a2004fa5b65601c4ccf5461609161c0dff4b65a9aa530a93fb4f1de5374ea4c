'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const utils = require('@zag-js/utils');
const react = require('react');
const factory = require('../factory.cjs');
const useNavigationMenuContext = require('./use-navigation-menu-context.cjs');
const createSplitProps = require('../../utils/create-split-props.cjs');
const useNavigationMenuItemPropsContext = require('./use-navigation-menu-item-props-context.cjs');

const splitItemProps = createSplitProps.createSplitProps();
const NavigationMenuTrigger = react.forwardRef((props, ref) => {
  const itemContext = useNavigationMenuItemPropsContext.useNavigationMenuItemPropsContext();
  utils.ensure(itemContext, () => "NavigationMenu.Trigger must be used within NavigationMenu.Item");
  const value = itemContext.value;
  const disabled = props.disabled ?? itemContext.disabled;
  const [triggerProps, localProps] = splitItemProps({ ...props, value, disabled }, ["value", "disabled"]);
  const navigationMenu = useNavigationMenuContext.useNavigationMenuContext();
  const mergedProps = react$1.mergeProps(navigationMenu.getTriggerProps(triggerProps), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.button, { ...mergedProps, ref });
});
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

exports.NavigationMenuTrigger = NavigationMenuTrigger;
