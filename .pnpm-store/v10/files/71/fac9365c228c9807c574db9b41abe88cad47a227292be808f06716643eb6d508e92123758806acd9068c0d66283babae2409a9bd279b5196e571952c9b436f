'use client';
import { jsx, Fragment } from 'react/jsx-runtime';
import { formatBytes } from '@zag-js/i18n-utils';
import { useMemo } from 'react';
import { useLocaleContext } from '../../providers/locale/use-locale-context.js';

const FormatByte = (props) => {
  const { locale } = useLocaleContext();
  const text = useMemo(() => {
    const { value, ...intlOptions } = props;
    return formatBytes(value, locale, intlOptions);
  }, [props, locale]);
  return /* @__PURE__ */ jsx(Fragment, { children: text });
};
FormatByte.displayName = "FormatByte";

export { FormatByte };
