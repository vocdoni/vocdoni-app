'use client';
import * as marquee from '@zag-js/marquee';
import { useMachine, normalizeProps } from '@zag-js/react';
import { useId } from 'react';
import { useEnvironmentContext } from '../../providers/environment/use-environment-context.js';
import { useLocaleContext } from '../../providers/locale/use-locale-context.js';

const useMarquee = (props) => {
  const id = useId();
  const { getRootNode } = useEnvironmentContext();
  const { dir } = useLocaleContext();
  const context = {
    id,
    dir,
    getRootNode,
    ...props
  };
  const service = useMachine(marquee.machine, context);
  return marquee.connect(service, normalizeProps);
};

export { useMarquee };
