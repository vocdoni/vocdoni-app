'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { usePasswordInput } from './use-password-input.js';
import { PasswordInputProvider } from './use-password-input-context.js';

const splitRootProps = createSplitProps();
const PasswordInputRoot = forwardRef((props, ref) => {
  const [usePasswordInputProps, localProps] = splitRootProps(props, [
    "autoComplete",
    "defaultVisible",
    "disabled",
    "id",
    "ids",
    "ignorePasswordManagers",
    "invalid",
    "name",
    "onVisibilityChange",
    "readOnly",
    "required",
    "translations",
    "visible"
  ]);
  const passwordInput = usePasswordInput(usePasswordInputProps);
  const mergedProps = mergeProps(passwordInput.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(PasswordInputProvider, { value: passwordInput, children: /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref }) });
});
PasswordInputRoot.displayName = "PasswordInputRoot";

export { PasswordInputRoot };
