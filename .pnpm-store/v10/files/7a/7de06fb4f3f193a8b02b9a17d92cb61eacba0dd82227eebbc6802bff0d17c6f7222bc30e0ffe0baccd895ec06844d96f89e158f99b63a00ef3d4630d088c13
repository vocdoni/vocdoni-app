'use client';
'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const jsxRuntime = require('react/jsx-runtime');
const react$1 = require('@zag-js/react');
const react = require('react');
const factory = require('../factory.cjs');
const useSplitterContext = require('./use-splitter-context.cjs');
const useSplitterResizeTriggerPropsContext = require('./use-splitter-resize-trigger-props-context.cjs');

const SplitterResizeTriggerIndicator = react.forwardRef(
  (props, ref) => {
    const splitter = useSplitterContext.useSplitterContext();
    const triggerProps = useSplitterResizeTriggerPropsContext.useSplitterResizeTriggerPropsContext();
    const mergedProps = react$1.mergeProps(splitter.getResizeTriggerIndicator(triggerProps), props);
    return /* @__PURE__ */ jsxRuntime.jsx(factory.ark.div, { ref, ...mergedProps });
  }
);
SplitterResizeTriggerIndicator.displayName = "SplitterResizeTriggerIndicator";

exports.SplitterResizeTriggerIndicator = SplitterResizeTriggerIndicator;
