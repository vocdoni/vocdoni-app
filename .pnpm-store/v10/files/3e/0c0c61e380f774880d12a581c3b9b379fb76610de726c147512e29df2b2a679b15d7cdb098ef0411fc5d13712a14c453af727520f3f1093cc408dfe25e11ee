'use client';
import * as passwordInput from '@zag-js/password-input';
import { useMachine, normalizeProps } from '@zag-js/react';
import { useId } from 'react';
import { useEnvironmentContext } from '../../providers/environment/use-environment-context.js';
import { useLocaleContext } from '../../providers/locale/use-locale-context.js';
import { useFieldContext } from '../field/use-field-context.js';

const usePasswordInput = (props) => {
  const id = useId();
  const { getRootNode } = useEnvironmentContext();
  const { dir } = useLocaleContext();
  const field = useFieldContext();
  const machineProps = {
    id,
    ids: {
      input: field?.ids.control
    },
    disabled: field?.disabled,
    readOnly: field?.readOnly,
    required: field?.required,
    invalid: field?.invalid,
    dir,
    getRootNode,
    ...props
  };
  const service = useMachine(passwordInput.machine, machineProps);
  return passwordInput.connect(service, normalizeProps);
};

export { usePasswordInput };
