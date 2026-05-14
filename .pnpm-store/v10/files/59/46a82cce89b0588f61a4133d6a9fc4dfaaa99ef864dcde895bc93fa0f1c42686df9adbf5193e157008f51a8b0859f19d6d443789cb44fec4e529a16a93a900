"use strict";
"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var codeBlockAdapterContext = require('./code-block-adapter-context.cjs');
var useCodeHighlight = require('./use-code-highlight.cjs');

function CodeBlockAdapterProvider(props) {
  const { children, value } = props;
  const context = useCodeHighlight.useCodeHighlight(value);
  return /* @__PURE__ */ jsxRuntime.jsx(codeBlockAdapterContext.CodeBlockAdapterContextProvider, { value: context, children });
}

exports.CodeBlockAdapterProvider = CodeBlockAdapterProvider;
