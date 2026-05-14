'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const i18nUtils = require('@zag-js/i18n-utils');
const react = require('react');
const useLocaleContext = require('./use-locale-context.cjs');

function useFilter(props) {
  const env = useLocaleContext.useLocaleContext();
  const locale = props.locale ?? env.locale;
  return react.useMemo(() => i18nUtils.createFilter({ ...props, locale }), [locale, props]);
}

exports.useFilter = useFilter;
