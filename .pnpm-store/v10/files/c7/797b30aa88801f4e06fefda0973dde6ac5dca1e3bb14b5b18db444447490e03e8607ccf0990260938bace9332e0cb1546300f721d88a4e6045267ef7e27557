'use client';
import { jsx, Fragment } from 'react/jsx-runtime';
import { formatRelativeTime } from '@zag-js/i18n-utils';
import { useMemo } from 'react';
import { useLocaleContext } from '../../providers/locale/use-locale-context.js';

const FormatRelativeTime = (props) => {
  const { locale } = useLocaleContext();
  const text = useMemo(() => {
    const { value, ...intlOptions } = props;
    return formatRelativeTime(value, locale, intlOptions);
  }, [props, locale]);
  return /* @__PURE__ */ jsx(Fragment, { children: text });
};
FormatRelativeTime.displayName = "FormatRelativeTime";

export { FormatRelativeTime };
