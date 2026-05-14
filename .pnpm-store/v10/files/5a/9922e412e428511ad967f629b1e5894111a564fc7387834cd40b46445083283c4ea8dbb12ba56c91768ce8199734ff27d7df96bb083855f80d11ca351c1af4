'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useFieldContext = require('../field/use-field-context.cjs');
const usePasswordInputContext = require('./use-password-input-context.cjs');

const PasswordInputInput = react.forwardRef((props, ref) => {
  const passwordInput = usePasswordInputContext.usePasswordInputContext();
  const mergedProps = react$1.mergeProps(passwordInput.getInputProps(), props);
  const field = useFieldContext.useFieldContext();
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.input, { "aria-describedby": field?.ariaDescribedby, ...mergedProps, ref });
});
PasswordInputInput.displayName = "PasswordInputInput";

exports.PasswordInputInput = PasswordInputInput;
