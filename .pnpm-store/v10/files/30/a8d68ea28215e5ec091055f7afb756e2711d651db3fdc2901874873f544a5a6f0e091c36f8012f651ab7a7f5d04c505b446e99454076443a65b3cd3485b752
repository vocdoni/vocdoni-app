'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { usePasswordInputContext } from './use-password-input-context.js';

const PasswordInputIndicator = forwardRef((props, ref) => {
  const passwordInput = usePasswordInputContext();
  const mergedProps = mergeProps(passwordInput.getIndicatorProps(), props);
  return /* @__PURE__ */ jsx(ark.span, { ...mergedProps, ref, children: passwordInput.visible ? props.children : props.fallback });
});
PasswordInputIndicator.displayName = "PasswordInputIndicator";

export { PasswordInputIndicator };
