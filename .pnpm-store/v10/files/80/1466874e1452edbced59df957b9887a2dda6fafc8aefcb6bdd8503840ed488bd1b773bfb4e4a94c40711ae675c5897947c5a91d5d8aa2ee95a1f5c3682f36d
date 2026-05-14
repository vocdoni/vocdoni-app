'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const usePasswordInputContext = require('./use-password-input-context.cjs');

const PasswordInputRootProvider = react.forwardRef((props, ref) => {
  const { value: passwordInput, ...localProps } = props;
  const mergedProps = react$1.mergeProps(passwordInput.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(usePasswordInputContext.PasswordInputProvider, { value: passwordInput, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
PasswordInputRootProvider.displayName = "PasswordInputRootProvider";

exports.PasswordInputRootProvider = PasswordInputRootProvider;
