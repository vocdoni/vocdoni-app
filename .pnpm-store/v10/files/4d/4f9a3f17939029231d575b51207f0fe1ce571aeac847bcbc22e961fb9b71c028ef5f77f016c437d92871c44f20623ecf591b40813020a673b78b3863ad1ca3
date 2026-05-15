'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const usePresenceContext = require('../presence/use-presence-context.cjs');
const useBottomSheetContext = require('./use-bottom-sheet-context.cjs');

const BottomSheetTrigger = react.forwardRef((props, ref) => {
  const bottomSheet = useBottomSheetContext.useBottomSheetContext();
  const presence = usePresenceContext.usePresenceContext();
  const mergedProps = react$1.mergeProps(
    {
      ...bottomSheet.getTriggerProps(),
      "aria-controls": presence.unmounted ? void 0 : bottomSheet.getTriggerProps()["aria-controls"]
    },
    props
  );
  return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.button, { ...mergedProps, ref });
});
BottomSheetTrigger.displayName = "BottomSheetTrigger";

exports.BottomSheetTrigger = BottomSheetTrigger;
