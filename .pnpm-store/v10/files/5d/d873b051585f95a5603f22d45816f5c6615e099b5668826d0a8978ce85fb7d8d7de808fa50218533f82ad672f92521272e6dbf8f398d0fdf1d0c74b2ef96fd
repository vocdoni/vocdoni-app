'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const createSplitProps = require('../../utils/create-split-props.cjs');
const factory = require('../factory.cjs');
const useSignaturePad = require('./use-signature-pad.cjs');
const useSignaturePadContext = require('./use-signature-pad-context.cjs');

const splitRootProps = createSplitProps.createSplitProps();
const SignaturePadRoot = react.forwardRef((props, ref) => {
  const [useSignaturePadProps, localProps] = splitRootProps(props, [
    "id",
    "ids",
    "defaultPaths",
    "drawing",
    "disabled",
    "readOnly",
    "name",
    "onDraw",
    "onDrawEnd",
    "paths",
    "readOnly",
    "required",
    "translations"
  ]);
  const signaturePad = useSignaturePad.useSignaturePad(useSignaturePadProps);
  const mergedProps = react$1.mergeProps(signaturePad.getRootProps(), localProps);
  return /* @__PURE__ */ jsxRuntime.jsx(useSignaturePadContext.SignaturePadProvider, { value: signaturePad, children: /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ...mergedProps, ref }) });
});
SignaturePadRoot.displayName = "SignaturePadRoot";

exports.SignaturePadRoot = SignaturePadRoot;
