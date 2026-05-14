'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const usePasswordInput = require('./use-password-input.cjs');
const usePasswordInputContext = require('./use-password-input-context.cjs');

const splitRootProps = createSplitProps.createSplitProps();
const PasswordInputRoot = react.forwardRef((props, ref) => {
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
  const passwordInput = usePasswordInput.usePasswordInput(usePasswordInputProps);
  const mergedProps = react$1.mergeProps(passwordInput.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(usePasswordInputContext.PasswordInputProvider, { value: passwordInput, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
PasswordInputRoot.displayName = "PasswordInputRoot";

exports.PasswordInputRoot = PasswordInputRoot;
