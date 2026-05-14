'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const i18nUtils = require('@zag-js/i18n-utils');
const useLocaleContext = require('./use-locale-context.cjs');
const react = require('react');

function useCollator(props = {}) {
  const env = useLocaleContext.useLocaleContext();
  const locale = props.locale ?? env.locale;
  return react.useMemo(() => {
    const { locale: _, ...options } = props;
    return i18nUtils.createCollator(locale, options);
  }, [locale, props]);
}

exports.useCollator = useCollator;
