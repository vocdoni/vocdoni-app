'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const i18nUtils = require('@zag-js/i18n-utils');
const react = require('react');
const useLocaleContext = require('../../providers/locale/use-locale-context.cjs');

const FormatByte = (props) => {
  const { locale } = useLocaleContext.useLocaleContext();
  const text = react.useMemo(() => {
    const { value, ...intlOptions } = props;
    return i18nUtils.formatBytes(value, locale, intlOptions);
  }, [props, locale]);
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: text });
};
FormatByte.displayName = "FormatByte";

exports.FormatByte = FormatByte;
