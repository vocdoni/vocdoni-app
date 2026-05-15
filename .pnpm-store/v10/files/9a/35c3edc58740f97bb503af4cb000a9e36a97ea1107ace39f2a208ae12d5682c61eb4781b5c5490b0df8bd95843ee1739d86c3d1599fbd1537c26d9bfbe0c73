'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { useFieldContext } from '../field/use-field-context.js';
import { usePasswordInputContext } from './use-password-input-context.js';

const PasswordInputInput = forwardRef((props, ref) => {
  const passwordInput = usePasswordInputContext();
  const mergedProps = mergeProps(passwordInput.getInputProps(), props);
  const field = useFieldContext();
  return /* @__PURE__ */ jsx(ark.input, { "aria-describedby": field?.ariaDescribedby, ...mergedProps, ref });
});
PasswordInputInput.displayName = "PasswordInputInput";

export { PasswordInputInput };
