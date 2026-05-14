'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { usePasswordInputContext } from './use-password-input-context.js';

const PasswordInputControl = forwardRef((props, ref) => {
  const passwordInput = usePasswordInputContext();
  const mergedProps = mergeProps(passwordInput.getControlProps(), props);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref });
});
PasswordInputControl.displayName = "PasswordInputControl";

export { PasswordInputControl };
