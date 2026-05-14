'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useNavigationMenuContext } from './use-navigation-menu-context.js';

const splitViewportProps = createSplitProps();
const NavigationMenuViewportPositioner = forwardRef(
  (props, ref) => {
    const [positionerProps, localProps] = splitViewportProps(props, ["align"]);
    const navigationMenu = useNavigationMenuContext();
    const mergedProps = mergeProps(navigationMenu.getViewportPositionerProps(positionerProps), localProps);
    return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
  }
);
NavigationMenuViewportPositioner.displayName = "NavigationMenuViewportPositioner";

export { NavigationMenuViewportPositioner };
