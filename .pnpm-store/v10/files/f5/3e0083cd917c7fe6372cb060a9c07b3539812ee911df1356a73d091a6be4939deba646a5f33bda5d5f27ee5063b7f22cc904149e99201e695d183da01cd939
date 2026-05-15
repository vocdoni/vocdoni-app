'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { PasswordInputProvider } from './use-password-input-context.js';

const PasswordInputRootProvider = forwardRef((props, ref) => {
  const { value: passwordInput, ...localProps } = props;
  const mergedProps = mergeProps(passwordInput.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(PasswordInputProvider, { value: passwordInput, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
PasswordInputRootProvider.displayName = "PasswordInputRootProvider";

export { PasswordInputRootProvider };
