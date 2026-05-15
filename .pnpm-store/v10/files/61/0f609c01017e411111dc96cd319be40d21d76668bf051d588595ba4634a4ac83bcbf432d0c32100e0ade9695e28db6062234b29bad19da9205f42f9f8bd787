'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const domQuery = require('@zag-js/dom-query');
const react = require('react');
const useEnvironmentContext = require('../../providers/environment/use-environment-context.cjs');
const useSafeLayoutEffect = require('../../utils/use-safe-layout-effect.cjs');
const fieldset_anatomy = require('./fieldset.anatomy.cjs');

const useFieldset = (props = {}) => {
  const { disabled = false, invalid = false } = props;
  const env = useEnvironmentContext.useEnvironmentContext();
  const [textElements, setTextElements] = react.useState({ hasErrorText: false, hasHelperText: false });
  const uid = react.useId();
  const id = props.id ?? uid;
  const rootRef = react.useRef(null);
  const legendId = `fieldset::${id}::legend`;
  const errorTextId = `fieldset::${id}::error-text`;
  const helperTextId = `fieldset::${id}::helper-text`;
  useSafeLayoutEffect.useSafeLayoutEffect(() => {
    const rootNode = rootRef.current;
    if (!rootNode) return;
    const checkTextElements = () => {
      const docOrShadowRoot = env.getRootNode();
      const hasErrorText = !!docOrShadowRoot.getElementById(errorTextId);
      const hasHelperText = !!docOrShadowRoot.getElementById(helperTextId);
      setTextElements({ hasErrorText, hasHelperText });
    };
    checkTextElements();
    const win = env.getWindow();
    const observer = new win.MutationObserver(checkTextElements);
    observer.observe(rootNode, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [env, errorTextId, helperTextId]);
  const ids = [];
  if (textElements.hasErrorText && invalid) ids.push(errorTextId);
  if (textElements.hasHelperText) ids.push(helperTextId);
  const labelIds = ids.length > 0 ? ids.join(" ") : void 0;
  const getRootProps = () => ({
    ...fieldset_anatomy.parts.root.attrs,
    ref: rootRef,
    disabled,
    "data-disabled": domQuery.dataAttr(disabled),
    "data-invalid": domQuery.dataAttr(invalid),
    "aria-labelledby": legendId,
    "aria-describedby": labelIds
  });
  const getLegendProps = () => ({
    id: legendId,
    ...fieldset_anatomy.parts.legend.attrs,
    "data-disabled": domQuery.dataAttr(disabled),
    "data-invalid": domQuery.dataAttr(invalid)
  });
  const getHelperTextProps = () => ({
    id: helperTextId,
    ...fieldset_anatomy.parts.helperText.attrs
  });
  const getErrorTextProps = () => ({
    id: errorTextId,
    ...fieldset_anatomy.parts.errorText.attrs,
    "aria-live": "polite"
  });
  return {
    refs: {
      rootRef
    },
    ids: {
      legend: legendId,
      errorText: errorTextId,
      helperText: helperTextId
    },
    disabled,
    invalid,
    getRootProps,
    getLegendProps,
    getHelperTextProps,
    getErrorTextProps
  };
};

exports.useFieldset = useFieldset;
