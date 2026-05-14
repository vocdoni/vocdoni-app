'use client';
import { useMachine, normalizeProps } from '@zag-js/react';
import * as navigationMenu from '@zag-js/navigation-menu';
import { useId } from 'react';
import { useEnvironmentContext } from '../../providers/environment/use-environment-context.js';
import { useLocaleContext } from '../../providers/locale/use-locale-context.js';

const useNavigationMenu = (props) => {
  const id = useId();
  const { getRootNode } = useEnvironmentContext();
  const { dir } = useLocaleContext();
  const machineProps = {
    id,
    dir,
    getRootNode,
    ...props
  };
  const service = useMachine(navigationMenu.machine, machineProps);
  return navigationMenu.connect(service, normalizeProps);
};

export { useNavigationMenu };
