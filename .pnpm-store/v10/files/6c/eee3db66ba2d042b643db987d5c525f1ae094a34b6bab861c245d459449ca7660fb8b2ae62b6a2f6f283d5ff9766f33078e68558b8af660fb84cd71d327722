'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { uniq } from '@zag-js/utils';
import { forwardRef, useMemo } from 'react';
import { ark } from '../factory.js';
import { useDatePickerContext } from './use-date-picker-context.js';

const DatePickerRangeText = forwardRef((props, ref) => {
  const datePicker = useDatePickerContext();
  const mergedProps = mergeProps(datePicker.getRangeTextProps(), props);
  const visibleRangeText = useMemo(() => {
    const { start, end } = datePicker.visibleRangeText;
    return uniq([start, end]).filter(Boolean).join(" - ");
  }, [datePicker.visibleRangeText]);
  return /* @__PURE__ */ jsx(ark.div, { ...mergedProps, ref, children: visibleRangeText });
});
DatePickerRangeText.displayName = "DatePickerRangeText";

export { DatePickerRangeText };
