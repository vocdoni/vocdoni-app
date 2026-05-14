'use client';
import { createCollator } from '@zag-js/i18n-utils';
import { useLocaleContext } from './use-locale-context.js';
import { useMemo } from 'react';

function useCollator(props = {}) {
  const env = useLocaleContext();
  const locale = props.locale ?? env.locale;
  return useMemo(() => {
    const { locale: _, ...options } = props;
    return createCollator(locale, options);
  }, [locale, props]);
}

export { useCollator };
