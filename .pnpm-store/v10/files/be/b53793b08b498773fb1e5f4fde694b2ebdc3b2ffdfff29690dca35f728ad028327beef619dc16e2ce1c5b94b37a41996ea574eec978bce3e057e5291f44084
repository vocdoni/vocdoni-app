'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const usePasswordInputContext = require('./use-password-input-context.cjs');

const PasswordInputControl = react.forwardRef((props, ref) => {
  const passwordInput = usePasswordInputContext.usePasswordInputContext();
  const mergedProps = react$1.mergeProps(passwordInput.getControlProps(), props);
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref });
});
PasswordInputControl.displayName = "PasswordInputControl";

exports.PasswordInputControl = PasswordInputControl;
