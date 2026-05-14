'use client';
import * as radio from '@zag-js/radio-group';
import { useMachine, normalizeProps } from '@zag-js/react';
import { useId } from 'react';
import { useEnvironmentContext } from '../../providers/environment/use-environment-context.js';
import { useLocaleContext } from '../../providers/locale/use-locale-context.js';
import { useFieldsetContext } from '../fieldset/use-fieldset-context.js';

const useRadioGroup = (props) => {
  const fieldset = useFieldsetContext();
  const id = useId();
  const { getRootNode } = useEnvironmentContext();
  const { dir } = useLocaleContext();
  const machineProps = {
    id,
    ids: {
      label: fieldset?.ids?.legend
    },
    dir,
    disabled: fieldset?.disabled,
    invalid: fieldset?.invalid,
    getRootNode,
    ...props
  };
  const service = useMachine(radio.machine, machineProps);
  return radio.connect(service, normalizeProps);
};

export { useRadioGroup };
