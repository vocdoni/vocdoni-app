'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { ark } from '../factory.js';
import { usePasswordInputContext } from './use-password-input-context.js';

const PasswordInputVisibilityTrigger = forwardRef(
  (props, ref) => {
    const passwordInput = usePasswordInputContext();
    const mergedProps = mergeProps(passwordInput.getVisibilityTriggerProps(), props);
    return /* @__PURE__ */ jsx(ark.button, { ...mergedProps, ref });
  }
);
PasswordInputVisibilityTrigger.displayName = "PasswordInputVisibilityTrigger";

export { PasswordInputVisibilityTrigger };
