'use client';
import { jsx, Fragment } from 'react/jsx-runtime';
import { formatNumber } from '@zag-js/i18n-utils';
import { useMemo } from 'react';
import { useLocaleContext } from '../../providers/locale/use-locale-context.js';

const FormatNumber = (props) => {
  const { locale } = useLocaleContext();
  const text = useMemo(() => {
    const { value, ...intlOptions } = props;
    return formatNumber(value, locale, intlOptions);
  }, [props, locale]);
  return /* @__PURE__ */ jsx(Fragment, { children: text });
};
FormatNumber.displayName = "FormatNumber";

export { FormatNumber };
