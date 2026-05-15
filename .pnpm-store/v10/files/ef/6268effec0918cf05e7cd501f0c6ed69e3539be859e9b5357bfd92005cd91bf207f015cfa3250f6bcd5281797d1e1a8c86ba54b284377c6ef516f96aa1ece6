'use client';
import { jsx } from 'react/jsx-runtime';
import { mergeProps } from '@zag-js/react';
import { forwardRef } from 'react';
import { composeRefs } from '../../utils/compose-refs.js';
import { createSplitProps } from '../../utils/create-split-props.js';
import { ark } from '../factory.js';
import { useFieldset } from './use-fieldset.js';
import { FieldsetProvider } from './use-fieldset-context.js';

const splitRootProps = createSplitProps();
const FieldsetRoot = forwardRef((props, ref) => {
  const [useFieldsetProps, localProps] = splitRootProps(props, ["id", "disabled", "invalid"]);
  const fieldset = useFieldset(useFieldsetProps);
  const mergedProps = mergeProps(fieldset.getRootProps(), localProps);
  return /* @__PURE__ */ jsx(FieldsetProvider, { value: fieldset, children: /* @__PURE__ */ jsx(ark.fieldset, { ...mergedProps, ref: composeRefs(ref, fieldset.refs.rootRef) }) });
});
FieldsetRoot.displayName = "FieldsetRoot";

export { FieldsetRoot };
