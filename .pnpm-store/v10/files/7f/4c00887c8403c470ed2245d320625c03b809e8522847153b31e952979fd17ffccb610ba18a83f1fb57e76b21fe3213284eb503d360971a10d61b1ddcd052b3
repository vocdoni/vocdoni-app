'use client';
import { createFilter } from '@zag-js/i18n-utils';
import { useMemo } from 'react';
import { useLocaleContext } from './use-locale-context.js';

function useFilter(props) {
  const env = useLocaleContext();
  const locale = props.locale ?? env.locale;
  return useMemo(() => createFilter({ ...props, locale }), [locale, props]);
}

export { useFilter };
