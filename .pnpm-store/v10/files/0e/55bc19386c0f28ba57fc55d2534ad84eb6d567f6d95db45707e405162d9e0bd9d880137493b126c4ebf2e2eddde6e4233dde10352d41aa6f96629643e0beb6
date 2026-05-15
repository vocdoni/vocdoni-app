'use client';
import * as scrollArea from '@zag-js/scroll-area';
import { useMachine, normalizeProps } from '@zag-js/react';
import { useId } from 'react';
import { useEnvironmentContext } from '../../providers/environment/use-environment-context.js';
import { useLocaleContext } from '../../providers/locale/use-locale-context.js';

const useScrollArea = (props) => {
  const id = useId();
  const { getRootNode } = useEnvironmentContext();
  const { dir } = useLocaleContext();
  const context = {
    id,
    dir,
    getRootNode,
    ...props
  };
  const service = useMachine(scrollArea.machine, context);
  return scrollArea.connect(service, normalizeProps);
};

export { useScrollArea };
